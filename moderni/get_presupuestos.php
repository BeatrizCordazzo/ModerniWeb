<?php
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

require_once __DIR__ . '/conexion.php';

try {
    $pdo = get_pdo_connection();
    $sql = "SELECT pr.id AS presupuesto_id, pr.cliente_id, u.nombre AS cliente_nombre, pr.proyecto_id, pj.nombre AS proyecto_nombre, pr.total, pr.estimated_total, pr.estado, pr.fecha_creacion, pr.rechazo_motivo, pr.rechazado_por, pr.fecha_rechazo, pr.detalle
        FROM presupuestos pr
            LEFT JOIN usuarios u ON pr.cliente_id = u.id
            LEFT JOIN proyectos pj ON pr.proyecto_id = pj.id
            WHERE pr.estado = 'pendiente'
            ORDER BY pr.fecha_creacion DESC";

    $stmt = $pdo->query($sql);
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

    echo json_encode(['success' => true, 'presupuestos' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}
?>


