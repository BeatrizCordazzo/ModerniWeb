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

$logFile = __DIR__ . DIRECTORY_SEPARATOR . 'get_architect_projects_error.log';
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

$role = $userRole ?? '';
if (!$userId || !in_array($role, ['admin', 'arquitecto'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No autorizado.']);
    exit;
}

$statusParam = strtolower(trim((string)($_GET['status'] ?? 'all')));
$allowedStatus = ['pending', 'accepted', 'rejected', 'all'];
if (!in_array($statusParam, $allowedStatus, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Estado no valido.']);
    exit;
}

$conditions = [];
$params = [];

if ($statusParam !== 'all') {
    $conditions[] = 'ap.status = :status';
    $params[':status'] = $statusParam;
}

if ($role !== 'admin') {
    $conditions[] = 'ap.architect_id = :architect_id';
    $params[':architect_id'] = $userId;
}

$where = '';
if (!empty($conditions)) {
    $where = 'WHERE ' . implode(' AND ', $conditions);
}

$selectColumns = 'ap.*, u.nombre AS architect_name, u.email AS architect_email';
$sql = "SELECT {$selectColumns}
        FROM architect_projects ap
        JOIN usuarios u ON u.id = ap.architect_id
        {$where}
        ORDER BY ap.created_at DESC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $projects = $stmt->fetchAll();
    foreach ($projects as &$project) {
        $project['file_url'] = $project['file_path'];
    }
    echo json_encode(['success' => true, 'projects' => $projects], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    $logError('Query failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudieron cargar los proyectos.']);
    exit;
}






