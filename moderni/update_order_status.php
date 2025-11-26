<?php
require_once __DIR__ . '/conexion.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || (!isset($input['id']) && !isset($input['pedido_id']))) {
        throw new Exception('Missing order id');
    }
    $id = isset($input['id']) ? intval($input['id']) : intval($input['pedido_id']);
    $status = isset($input['status']) ? trim($input['status']) : null;
    if ($status === null) throw new Exception('Missing status');
    $pdo = get_pdo_connection();
// Ensure pedidos table has 'status' column. If not, try to update 'estado' column as fallback.
    $colCheck = $pdo->query("SHOW COLUMNS FROM pedidos LIKE 'status'")->fetch();
    if ($colCheck) {
        $stmt = $pdo->prepare('UPDATE pedidos SET status = :status WHERE id = :id');
    } else {
        // fallback to estado column
        $stmt = $pdo->prepare('UPDATE pedidos SET estado = :status WHERE id = :id');
    }
    $stmt->execute([':status' => $status, ':id' => $id]);

    echo json_encode(['success' => true]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

?>





