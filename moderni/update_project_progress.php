<?php
require_once __DIR__ . '/conexion.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:4200');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['proyecto_id']) || !isset($input['estado'])) throw new Exception('proyecto_id and estado required');

    $proyecto_id = intval($input['proyecto_id']);
    $estado = $input['estado'];
    $allowed = ['to-do', 'in progress', 'done'];
    if (!in_array($estado, $allowed)) throw new Exception('Invalid estado');

    $pdo = get_pdo_connection();
    $stmt = $pdo->prepare("UPDATE proyectos SET carpintero_estado = ? WHERE id = ?");
    $stmt->execute([$estado, $proyecto_id]);

    echo json_encode(['success' => true, 'mensaje' => 'Estado del proyecto actualizado']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}

?>


