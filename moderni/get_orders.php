<?php
require_once __DIR__ . '/conexion.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

try {
    $pdo = get_pdo_connection();
// Check pedidos table
    $check = $pdo->query("SHOW TABLES LIKE 'pedidos'")->fetch();
    if (!$check) {
        echo json_encode(['success' => true, 'orders' => []]);
        exit;
    }

    // Determine whether pedidos has cliente_id and created_at columns
    $hasClienteId = (bool)$pdo->query("SHOW COLUMNS FROM pedidos LIKE 'cliente_id'")->fetch();
    $hasCreatedAt = (bool)$pdo->query("SHOW COLUMNS FROM pedidos LIKE 'created_at'")->fetch();

    // Fetch rows and normalize. If cliente_id exists, join with usuarios to get cliente_nombre/email
    if ($hasClienteId) {
        $orderQuery = 'SELECT p.*, u.nombre AS cliente_nombre, u.email AS cliente_email FROM pedidos p LEFT JOIN usuarios u ON p.cliente_id = u.id ' . ($hasCreatedAt ? 'ORDER BY p.created_at DESC' : 'ORDER BY p.id DESC') . ' LIMIT 500';
    } else {
        $orderQuery = ($hasCreatedAt ? 'SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 500' : 'SELECT * FROM pedidos ORDER BY id DESC LIMIT 500');
    }
    $rows = $pdo->query($orderQuery)->fetchAll(PDO::FETCH_ASSOC);
    $normalized = [];
    // Check if pedido_items exists
    $hasItemsTable = (bool)$pdo->query("SHOW TABLES LIKE 'pedido_items'")->fetch();

    foreach ($rows as $r) {
        $order = $r;
        $orderItems = [];
        // If pedido_items table exists, try fetch items
        if ($hasItemsTable) {
            $pid = isset($r['id']) ? intval($r['id']) : (isset($r['pedido_id']) ? intval($r['pedido_id']) : 0);
            if ($pid > 0) {
                $stmt = $pdo->query('SELECT id, name, quantity, price, extra FROM pedido_items WHERE pedido_id = ' . $pid);
                if ($stmt) {
                    $itemsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($itemsRaw as $it) {
                        $extra = null;
                        if (!empty($it['extra'])) {
                            $dec = json_decode($it['extra'], true);
                            $extra = json_last_error() === JSON_ERROR_NONE ? $dec : $it['extra'];
                        }
                        $orderItems[] = array_merge($it, ['extra' => $extra]);
                    }
                }
            }
        }
        // fallback to items column
        if (empty($orderItems) && isset($r['items']) && $r['items']) {
            $tmp = json_decode($r['items'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($tmp)) $orderItems = $tmp;
        }

        $order['items'] = $orderItems;
        $normalized[] = $order;
    }

    echo json_encode(['success' => true, 'orders' => $normalized]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}





