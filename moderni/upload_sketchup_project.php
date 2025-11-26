<?php
require_once __DIR__ . '/conexion.php';

$allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost',
    'http://127.0.0.1'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
} else {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$logFile = __DIR__ . DIRECTORY_SEPARATOR . 'upload_sketchup_project_error.log';
$logError = static function (string $message) use ($logFile): void {
    $timestamp = date('Y-m-d H:i:s');
    @file_put_contents($logFile, '[' . $timestamp . '] ' . $message . PHP_EOL, FILE_APPEND);
};

session_start();
$userId = null;
$userRole = null;
$normalizeRole = static function ($role) {
    if ($role === null) {
        return null;
    }
    return strtolower(trim((string)$role));
};

if (isset($_SESSION['user']) && is_array($_SESSION['user'])) {
    $userId = isset($_SESSION['user']['id']) ? (int)$_SESSION['user']['id'] : null;
    $userRole = $normalizeRole($_SESSION['user']['rol'] ?? ($_SESSION['user']['role'] ?? null));
}

if (!$userId && isset($_SESSION['user_id'])) {
    $userId = (int)$_SESSION['user_id'];
}

$cookieUserId = null;
if (isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) {
    $cookieUserId = (int)$_COOKIE['user_id'];
}
if ($cookieUserId) {
    if (!$userId || $userId !== $cookieUserId) {
        $userId = $cookieUserId;
        $userRole = null; // force reload from DB to sync role
    }
}

try {
    $pdo = get_pdo_connection();
} catch (Exception $e) {
    $logError('DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB connection failed']);
    exit;
}

if ($userId && !$userRole) {
    $stmt = $pdo->prepare('SELECT id, rol FROM usuarios WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $row = $stmt->fetch();
    if ($row) {
        $userRole = $normalizeRole($row['rol'] ?? null);
        $_SESSION['user_id'] = (int)$row['id'];
        $_SESSION['user'] = array_merge($_SESSION['user'] ?? [], $row);
    }
}

if (!$userId || $userRole !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Solo los administradores pueden subir modelos.']);
    exit;
}

if (!isset($_FILES['skp_file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Debe adjuntar un archivo .skp.']);
    exit;
}

$file = $_FILES['skp_file'];
if (!empty($file['error'])) {
    $logError('Upload error code: ' . $file['error']);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se pudo subir el archivo.']);
    exit;
}

$extension = strtolower(pathinfo($file['name'] ?? 'modelo.skp', PATHINFO_EXTENSION));
if ($extension !== 'skp') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Solo se permiten archivos .skp.']);
    exit;
}

// Límite de tamaño (150 MB por seguridad)
$maxSize = 150 * 1024 * 1024;
if (($file['size'] ?? 0) > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El archivo supera el tamaño máximo permitido (150 MB).']);
    exit;
}

$uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'sketchup';
if (!is_dir($uploadDir) && !@mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
    $logError('Unable to create upload directory: ' . $uploadDir);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo preparar la carpeta de archivos.']);
    exit;
}

$safeBase = 'skp_' . $userId . '_' . time() . '_' . bin2hex(random_bytes(4));
$uniqueName = $safeBase . '.skp';
$targetPath = $uploadDir . DIRECTORY_SEPARATOR . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    $logError('move_uploaded_file failed for user ' . $userId);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar el archivo en el servidor.']);
    exit;
}

$relativePath = 'uploads/sketchup/' . $uniqueName;
$title = isset($_POST['title']) ? trim((string)$_POST['title']) : '';
$notes = isset($_POST['notes']) ? trim((string)$_POST['notes']) : '';
$embedInput = isset($_POST['embed_url']) ? trim((string)$_POST['embed_url']) : '';
$embedUrl = null;
if ($embedInput !== '') {
    $candidate = $embedInput;
    if (stripos($candidate, '<iframe') !== false) {
        if (preg_match('/src\s*=\s*"([^"]+)"/i', $candidate, $match) === 1 && !empty($match[1])) {
            $candidate = $match[1];
        } elseif (preg_match("/src\s*=\s*'([^']+)'/i", $candidate, $match) === 1 && !empty($match[1])) {
            $candidate = $match[1];
        }
    }
    $candidate = trim(strip_tags($candidate));
    if ($candidate !== '' && preg_match('#^https?://#i', $candidate)) {
        $embedUrl = $candidate;
    }
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO sketchup_projects (admin_id, title, notes, file_path, file_original_name, embed_url)
         VALUES (:admin_id, :title, :notes, :path, :original, :embed_url)'
    );
    $stmt->execute([
        ':admin_id' => $userId,
        ':title' => $title !== '' ? $title : null,
        ':notes' => $notes !== '' ? $notes : null,
        ':path' => $relativePath,
        ':original' => $file['name'] ?? null,
        ':embed_url' => $embedUrl,
    ]);

    $newId = (int)$pdo->lastInsertId();
    echo json_encode([
        'success' => true,
        'project' => [
            'id' => $newId,
            'title' => $title,
            'notes' => $notes,
            'file_path' => $relativePath,
            'file_original_name' => $file['name'] ?? null,
            'embed_url' => $embedUrl,
            'file_url' => $relativePath,
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    $logError('Insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar el modelo.']);
    exit;
}





