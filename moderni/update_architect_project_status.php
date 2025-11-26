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

$raw = file_get_contents('php://input');
$payload = strlen($raw) ? json_decode($raw, true) : null;
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'JSON invalido.']);
    exit;
}

$projectId = isset($payload['project_id']) ? (int)$payload['project_id'] : 0;
$newStatus = isset($payload['status']) ? strtolower(trim((string)$payload['status'])) : '';
$adminComment = isset($payload['admin_comment']) ? trim((string)$payload['admin_comment']) : '';

if ($projectId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de proyecto requerido.']);
    exit;
}

$allowedStatuses = ['accepted', 'rejected'];
if (!in_array($newStatus, $allowedStatuses, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Estado no permitido.']);
    exit;
}

$logFile = __DIR__ . DIRECTORY_SEPARATOR . 'update_architect_project_status_error.log';
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
if (isset($_SESSION['user'])) {
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
    echo json_encode(['success' => false, 'error' => 'Solo los administradores pueden actualizar estos proyectos.']);
    exit;
}

try {
    $pdo->beginTransaction();

    $check = $pdo->prepare('SELECT id FROM architect_projects WHERE id = :id FOR UPDATE');
    $check->execute([':id' => $projectId]);
    $existing = $check->fetch();
    if (!$existing) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Proyecto no encontrado.']);
        exit;
    }

    $update = $pdo->prepare(
        'UPDATE architect_projects
         SET status = :status,
             admin_comment = :comment,
             decided_at = NOW(),
             updated_at = NOW()
         WHERE id = :id'
    );
    $update->execute([
        ':status' => $newStatus,
        ':comment' => $adminComment !== '' ? $adminComment : null,
        ':id' => $projectId,
    ]);

    $select = $pdo->prepare(
        'SELECT ap.*, u.nombre AS architect_name, u.email AS architect_email
         FROM architect_projects ap
         JOIN usuarios u ON u.id = ap.architect_id
         WHERE ap.id = :id LIMIT 1'
    );
    $select->execute([':id' => $projectId]);
    $project = $select->fetch();
    if ($project) {
        $project['file_url'] = $project['file_path'];
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'project' => $project], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $logError('Update failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo actualizar el proyecto.']);
    exit;
}






