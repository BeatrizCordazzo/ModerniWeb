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
    $pdo = get_pdo_connection();

    $sql = "SELECT pj.id AS proyecto_id, pj.nombre AS proyecto_nombre, pj.descripcion, pj.carpintero_estado, pj.cliente_id, u.nombre AS cliente_nombre, u.email AS cliente_email, pj.fecha_inicio
            FROM proyectos pj
            LEFT JOIN usuarios u ON pj.cliente_id = u.id
            WHERE pj.carpintero_estado IS NOT NULL
            ORDER BY u.nombre, pj.fecha_inicio DESC";

    $stmt = $pdo->query($sql);
    $projects = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    $rows = [];

    $presupuestosStmt = $pdo->prepare("SELECT id, cliente_id, total, estado, fecha_creacion, rechazo_motivo, detalle FROM presupuestos WHERE proyecto_id = ?");
    $detalleStmt = $pdo->prepare("SELECT id, concepto, descripcion, precio FROM detalle_presupuesto WHERE presupuesto_id = ?");

    foreach ($projects as $r) {
        $projectId = (int)$r['proyecto_id'];
        $presupuestos = [];

        if ($presupuestosStmt) {
            $presupuestosStmt->execute([$projectId]);
            $presRows = $presupuestosStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($presRows as $p) {
                $presupuesto = $p;
                $detalle_presupuesto = [];
                if ($detalleStmt) {
                    $detalleStmt->execute([$p['id']]);
                    $detalle_presupuesto = $detalleStmt->fetchAll(PDO::FETCH_ASSOC);
                }

                if (isset($p['detalle']) && $p['detalle'] !== null && $p['detalle'] !== '') {
                    $decoded = json_decode($p['detalle'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        if (is_array($decoded)) {
                            $images = [];
                            if (isset($decoded['images']) && is_array($decoded['images'])) {
                                $images = $decoded['images'];
                            }
                            if ((empty($images) || count($images) === 0) && isset($decoded['furniture']) && is_array($decoded['furniture'])) {
                                foreach ($decoded['furniture'] as $fi) {
                                    if (is_array($fi) && !empty($fi['image'])) {
                                        $images[] = $fi['image'];
                                    }
                                }
                                $images = array_values(array_filter(array_unique($images)));
                                if ($images) {
                                    $decoded['images'] = $images;
                                }
                            }
                        }
                        $presupuesto['detalle'] = $decoded;
                    } else {
                        $presupuesto['detalle'] = $p['detalle'];
                    }
                } else {
                    $presupuesto['detalle'] = $detalle_presupuesto;
                }

                $presupuesto['detalle_presupuesto'] = $detalle_presupuesto;
                $presupuestos[] = $presupuesto;
            }
        }

        $active_presupuesto = null;
        if (!empty($presupuestos)) {
            foreach ($presupuestos as $pp) {
                $estado = isset($pp['estado']) ? strtolower($pp['estado']) : '';
                if (strpos($estado, 'acept') !== false || strpos($estado, 'accepted') !== false) {
                    $active_presupuesto = $pp;
                    break;
                }
            }
            if ($active_presupuesto === null) {
                $active_presupuesto = $presupuestos[count($presupuestos) - 1];
            }
        }

        $r['presupuestos'] = $presupuestos;
        $r['active_presupuesto'] = $active_presupuesto;
        $rows[] = $r;
    }

    echo json_encode(['success' => true, 'projects' => $rows]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}

?>


