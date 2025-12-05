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
    header('Access-Control-Allow-Methods: GET, OPTIONS');
} else {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$logFile = __DIR__ . DIRECTORY_SEPARATOR . 'get_sketchup_projects_error.log';
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
        $userRole = null;
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
    echo json_encode(['success' => false, 'error' => 'Solo los administradores pueden ver estos modelos.']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT id, admin_id, title, notes, file_path, file_original_name, embed_url, created_at
         FROM sketchup_projects
         ORDER BY created_at DESC'
    );
    $stmt->execute();
    $projects = $stmt->fetchAll();
    if (is_array($projects)) {
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $isNgrok = stripos($host, 'ngrok-free.dev') !== false;
        $scheme = $isNgrok ? 'https' : ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
        $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']) ?? ''), '/');
        $baseUrl = $scheme . '://' . $host . ($dir ? $dir . '/' : '/');
        foreach ($projects as &$project) {
            $path = $project['file_path'] ?? '';
            if ($path) {
                $path = ltrim((string)$path, '/');
                if (preg_match('#^https?://#i', $path)) {
                    $project['file_url'] = $path;
                } else {
                    $project['file_url'] = rtrim($baseUrl, '/') . '/' . $path;
                }
            } else {
                $project['file_url'] = null;
            }
        }
    }
    echo json_encode(['success' => true, 'projects' => $projects], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    $logError('Select failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudieron cargar los modelos.']);
    exit;
}






