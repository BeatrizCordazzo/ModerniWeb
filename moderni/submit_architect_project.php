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

$logFile = __DIR__ . DIRECTORY_SEPARATOR . 'submit_architect_project_error.log';
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

if (!$userId || $userRole !== 'arquitecto') {
    $logError(
        'Forbidden submit attempt. session=' . var_export($_SESSION, true) .
        ' cookies=' . var_export($_COOKIE, true) .
        ' detectedUserId=' . var_export($userId, true) .
        ' role=' . var_export($userRole, true)
    );
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Solo los arquitectos pueden enviar proyectos.']);
    exit;
}

$projectTitle = isset($_POST['project_title']) ? trim((string)$_POST['project_title']) : '';
$projectNotes = isset($_POST['project_notes']) ? trim((string)$_POST['project_notes']) : '';

if ($projectNotes === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El texto del proyecto es obligatorio.']);
    exit;
}

if (!isset($_FILES['project_file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Debe adjuntar un archivo.']);
    exit;
}

$file = $_FILES['project_file'];
if (!empty($file['error'])) {
    $logError('Upload error code: ' . $file['error']);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se pudo subir el archivo.']);
    exit;
}

$allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip', 'rar'];
$originalName = $file['name'] ?? 'archivo';
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if ($extension && !in_array($extension, $allowedExtensions, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido.']);
    exit;
}

$uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'architect_projects';
if (!is_dir($uploadDir) && !@mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
    $logError('Unable to create upload directory: ' . $uploadDir);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo preparar la carpeta de archivos.']);
    exit;
}

$safeExtension = $extension ?: 'dat';
$uniqueName = 'architect_' . $userId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $safeExtension;
$targetPath = $uploadDir . DIRECTORY_SEPARATOR . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    $logError('move_uploaded_file failed for user ' . $userId);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar el archivo en el servidor.']);
    exit;
}

$relativePath = 'uploads/architect_projects/' . $uniqueName;

try {
    $stmt = $pdo->prepare(
        'INSERT INTO architect_projects (architect_id, project_title, project_notes, file_path, file_original_name)
         VALUES (:architect_id, :title, :notes, :path, :original)'
    );
    $stmt->execute([
        ':architect_id' => $userId,
        ':title' => $projectTitle !== '' ? $projectTitle : null,
        ':notes' => $projectNotes,
        ':path' => $relativePath,
        ':original' => $originalName,
    ]);
    $newId = (int)$pdo->lastInsertId();

    $select = $pdo->prepare(
        'SELECT ap.*, u.nombre AS architect_name, u.email AS architect_email
         FROM architect_projects ap
         JOIN usuarios u ON u.id = ap.architect_id
         WHERE ap.id = :id LIMIT 1'
    );
    $select->execute([':id' => $newId]);
    $project = $select->fetch();
    if ($project) {
        $project['file_url'] = $project['file_path'];
    }

    echo json_encode(['success' => true, 'project' => $project], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    $logError('Insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar el proyecto.']);
    exit;
}






