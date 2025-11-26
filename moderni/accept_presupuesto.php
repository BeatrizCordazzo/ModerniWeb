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
$pdo = get_pdo_connection();

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['presupuesto_id'])) throw new Exception('presupuesto_id required');

    $presupuesto_id = intval($input['presupuesto_id']);
    $final_price = null;
    if (isset($input['final_price']) && is_numeric($input['final_price'])) {
        $final_price = floatval($input['final_price']);
    }

    if ($final_price !== null) {
        $stmt = $pdo->prepare("UPDATE presupuestos SET total = ?, estimated_total = COALESCE(estimated_total, ?), estado = 'aceptado' WHERE id = ?");
        $stmt->execute([$final_price, $final_price, $presupuesto_id]);
    } else {
        $stmt = $pdo->prepare("UPDATE presupuestos SET estado = 'aceptado' WHERE id = ?");
        $stmt->execute([$presupuesto_id]);
    }

    $stmt = $pdo->prepare("SELECT proyecto_id, detalle FROM presupuestos WHERE id = ?");
    $stmt->execute([$presupuesto_id]);
    $p = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($p && !empty($p['proyecto_id'])) {
        $proyecto_id = (int)$p['proyecto_id'];
        $stmt2 = $pdo->prepare("UPDATE proyectos SET carpintero_estado = 'to-do' WHERE id = ?");
        $stmt2->execute([$proyecto_id]);

        $detalleVal = $p['detalle'] ?? null;
        if (empty($detalleVal)) {
            $stmt3 = $pdo->prepare("SELECT detalle FROM presupuestos WHERE proyecto_id = ? AND detalle IS NOT NULL AND detalle != '' LIMIT 1");
            $stmt3->execute([$proyecto_id]);
            $found = $stmt3->fetch(PDO::FETCH_ASSOC);
            if ($found && !empty($found['detalle'])) {
                $stmt4 = $pdo->prepare("UPDATE presupuestos SET detalle = ? WHERE id = ?");
                $stmt4->execute([$found['detalle'], $presupuesto_id]);
            }
        }
    }

    echo json_encode(['success' => true, 'mensaje' => 'Presupuesto aceptado']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}

?>
