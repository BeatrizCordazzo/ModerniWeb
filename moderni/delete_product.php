<?php
require_once __DIR__ . '/conexion.php';
$allowed_origins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost',
    'http://127.0.0.1'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

$productId = null;
if (is_array($payload) && isset($payload['id'])) {
    $productId = (int)$payload['id'];
} elseif ($method === 'DELETE' && isset($_GET['id'])) {
    $productId = (int)$_GET['id'];
} elseif ($method === 'POST' && isset($_POST['id'])) {
    $productId = (int)$_POST['id'];
}

if (!$productId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing product id']);
    exit;
}

session_start();
$userRole = null;
if (isset($_SESSION['user'])) {
    $u = $_SESSION['user'];
    $userRole = $u['rol'] ?? ($u['role'] ?? null);
}
$allowed_roles = ['admin', 'arquitecto'];
if (!in_array($userRole, $allowed_roles, true)) {
    $isLocalOrigin = false;
    if ($origin) {
        if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
            $isLocalOrigin = true;
        }
    }
    if (!$isLocalOrigin) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden: admin role required']);
        exit;
    }
}

try {
    $pdo = get_pdo_connection();
$stmt = $pdo->prepare('DELETE FROM muebles WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $productId]);
    $deleted = $stmt->rowCount();

    if ($deleted === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Product not found']);
        exit;
    }

    echo json_encode(['success' => true, 'deleted' => $productId]);
    exit;

} catch (Exception $e) {
    error_log('delete_product.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error deleting product', 'details' => $e->getMessage()]);
    exit;
}





