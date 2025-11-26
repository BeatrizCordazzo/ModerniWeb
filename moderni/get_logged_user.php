<?php
require_once __DIR__ . '/conexion.php';
// get_logged_user.php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

try {
    $user_id = isset($_COOKIE['user_id']) ? intval($_COOKIE['user_id']) : 0;
    if ($user_id <= 0) {
        echo json_encode(null);
        exit;
    }
    $pdo = get_pdo_connection();
// Only select columns that are expected
    $stmt = $pdo->prepare('SELECT id, nombre AS nombre, email, telefono AS telefono, rol FROM usuarios WHERE id = ? LIMIT 1');
    $stmt->execute([$user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        echo json_encode(null);
        exit;
    }

    // Return the user object (frontend expects either user object or null)
    echo json_encode($row, JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

?>





