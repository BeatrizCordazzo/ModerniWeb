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

$logFile = __DIR__ . DIRECTORY_SEPARATOR . 'delete_sketchup_project_error.log';
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
    echo json_encode(['success' => false, 'error' => 'Solo los administradores pueden excluir modelos.']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payload']);
    exit;
}

$projectId = isset($payload['project_id']) ? (int)$payload['project_id'] : 0;
if ($projectId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de modelo inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, file_path FROM sketchup_projects WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $projectId]);
    $project = $stmt->fetch();
    if (!$project) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Modelo no encontrado']);
        exit;
    }

    $pdo->beginTransaction();
    $del = $pdo->prepare('DELETE FROM sketchup_projects WHERE id = :id');
    $del->execute([':id' => $projectId]);
    $pdo->commit();

    $path = (string)($project['file_path'] ?? '');
    if ($path !== '' && strpos($path, '..') === false) {
        $clean = str_replace(['\\', '//'], '/', $path);
        $fullPath = __DIR__ . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $clean);
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    echo json_encode(['success' => true]);
    exit;
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $logError('Delete failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo eliminar el modelo.']);
    exit;
}





