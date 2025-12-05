<?php
require_once __DIR__ . '/conexion.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function normalize_status($raw) {
    $default = [
        'value' => 'pending',
        'label' => 'Pending'
    ];
    if (!$raw || !is_string($raw)) return $default;

    $normalized = strtolower(trim($raw));
    $map = [
        'pending' => ['pending', 'pendiente', 'pending payment'],
        'processing' => ['processing', 'procesando', 'en proceso'],
        'shipped' => ['shipped', 'enviado'],
        'delivered' => ['delivered', 'entregado'],
        'cancelled' => ['cancelled', 'cancelado'],
        'to-do' => ['to-do', 'todo', 'por hacer'],
        'in progress' => ['in progress', 'en progreso', 'in-progress'],
        'done' => ['done', 'terminado', 'completado', 'finished'],
        'approved' => ['approved', 'aprobado', 'aceptado', 'accepted'],
        'rejected' => ['rejected', 'rechazado', 'denied', 'declined']
    ];
    $labels = [
        'pending' => 'Pending',
        'processing' => 'Processing',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
        'to-do' => 'To-do',
        'in progress' => 'In Progress',
        'done' => 'Completed',
        'approved' => 'Approved',
        'rejected' => 'Rejected'
    ];

    foreach ($map as $key => $aliases) {
        if (in_array($normalized, $aliases, true)) {
            return ['value' => $key, 'label' => $labels[$key] ?? ucfirst($key)];
        }
    }

    return ['value' => $normalized, 'label' => ucfirst($normalized)];
}

function decode_json_array($value) {
    if (empty($value)) return [];
    if (is_array($value)) return $value;
    if (is_string($value)) {
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (is_array($decoded)) return $decoded;
        }
    }
    if (is_object($value)) return [ (array) $value ];
    return [];
}

function split_includes($value) {
    if (!$value) return [];
    if (is_array($value)) return array_values(array_filter(array_map('trim', $value)));
    if (is_string($value)) {
        $parts = preg_split('/[|,\n]+/', $value);
        return array_values(array_filter(array_map('trim', $parts)));
    }
    return [];
}

function ensure_reviews_table(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS order_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT NOT NULL,
        order_type ENUM('pedido','custom') NOT NULL DEFAULT 'pedido',
        rating TINYINT NOT NULL,
        comment TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_order_review (order_type, order_id),
        INDEX idx_order_reviews_user (user_id),
        CONSTRAINT fk_order_reviews_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $pdo->exec($sql);
}

function is_reviewable_order_status(string $status): bool {
    return in_array($status, ['done', 'delivered'], true);
}

try {
    $pdo = get_pdo_connection();
ensure_reviews_table($pdo);

    // Ensure legacy databases have the estimated_total column for custom orders
    try {
        $estimatedCol = $pdo->query("SHOW COLUMNS FROM presupuestos LIKE 'estimated_total'")->fetch(PDO::FETCH_ASSOC);
        if (!$estimatedCol) {
            $pdo->exec("ALTER TABLE presupuestos ADD COLUMN estimated_total DECIMAL(12,2) NULL AFTER total");
        }
    } catch (Exception $e) {
        @file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'get_my_orders_error.log', date('Y-m-d H:i:s') . " - Could not ensure estimated_total column: " . $e->getMessage() . "\n", FILE_APPEND);
    }

    // Debug: log incoming request and email param
    $debugFile = __DIR__ . DIRECTORY_SEPARATOR . 'get_my_orders_debug.log';
    $incomingEmail = isset($_GET['email']) ? $_GET['email'] : null;
    @file_put_contents($debugFile, date('Y-m-d H:i:s') . " - get_my_orders called, email param: " . var_export($incomingEmail, true) . "\n", FILE_APPEND);

    session_start();
    $cliente_id = null;
    if (isset($_SESSION['user_id'])) $cliente_id = intval($_SESSION['user_id']);
    if (!$cliente_id && isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) $cliente_id = intval($_COOKIE['user_id']);

    if (!$cliente_id) {
        // Try to map by email if provided
        if (!empty($_GET['email'])) {
            $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
            $stmt->execute([$_GET['email']]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) $cliente_id = intval($row['id']);
            @file_put_contents($debugFile, date('Y-m-d H:i:s') . " - looked up usuario by email, found id: " . var_export($cliente_id, true) . "\n", FILE_APPEND);
        }
    }

    if (!$cliente_id) {
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        http_response_code(401);
        exit;
    }

    $reviewsByOrder = [];
    $reviewStmt = $pdo->prepare('SELECT order_type, order_id, rating, comment, created_at FROM order_reviews WHERE user_id = ?');
    $reviewStmt->execute([$cliente_id]);
    $reviewRows = $reviewStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($reviewRows as $rev) {
        $key = $rev['order_type'] . ':' . $rev['order_id'];
        $reviewsByOrder[$key] = [
            'rating' => isset($rev['rating']) ? (int) $rev['rating'] : null,
            'comment' => $rev['comment'] ?? null,
            'created_at' => $rev['created_at'] ?? null
        ];
    }

    $results = [];

    // Prepared statements reused for efficiency
    $pedidoItemsStmt = $pdo->prepare('
        SELECT 
            pi.id,
            pi.mueble_id,
            pi.name,
            pi.quantity,
            pi.price,
            pi.extra,
            m.nombre AS mueble_nombre,
            m.descripcion AS mueble_descripcion,
            m.imagen_url,
            m.dimensiones_ancho,
            m.dimensiones_alto,
            m.dimensiones_profundo,
            m.incluye,
            m.precio AS mueble_precio
        FROM pedido_items pi
        LEFT JOIN muebles m ON pi.mueble_id = m.id
        WHERE pi.pedido_id = ?
    ');
    $colorStmt = $pdo->prepare('
        SELECT co.nombre, co.codigo_hex 
        FROM colores_mueble cm 
        INNER JOIN colores co ON cm.color_id = co.id 
        WHERE cm.mueble_id = ?
        ORDER BY cm.id ASC
    ');

    // 1) Fetch normal pedidos
    $stmt = $pdo->prepare('SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY created_at DESC');
    $stmt->execute([$cliente_id]);
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($pedidos as $p) {
        $items = [];
        $totalFromDb = isset($p['total']) ? (float) $p['total'] : 0;
        $calculatedTotal = 0;

        $pedidoItemsStmt->execute([$p['id']]);
        $rows = $pedidoItemsStmt->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            foreach ($rows as $row) {
                $extra = [];
                if (!empty($row['extra'])) {
                    $decodedExtra = json_decode($row['extra'], true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedExtra)) $extra = $decodedExtra;
                }

                $dimensions = [
                    'width' => $extra['dimensions']['width'] ?? $row['dimensiones_ancho'] ?? null,
                    'height' => $extra['dimensions']['height'] ?? $row['dimensiones_alto'] ?? null,
                    'depth' => $extra['dimensions']['depth'] ?? $row['dimensiones_profundo'] ?? null
                ];
                if (!$dimensions['width'] && !$dimensions['height'] && !$dimensions['depth']) {
                    $dimensions = null;
                }

                $includes = split_includes($extra['includes'] ?? $row['incluye'] ?? null);

                $color = null;
                $allColors = [];
                $colorSource = $extra['color'] ?? $extra['selectedColor'] ?? null;
                if (!empty($row['mueble_id'])) {
                    $colorStmt->execute([$row['mueble_id']]);
                    $allColors = $colorStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
                    if (!$colorSource && !empty($allColors)) {
                        $colorSource = $allColors[0];
                    }
                }
                if (is_array($colorSource)) {
                    $color = [
                        'name' => $colorSource['name'] ?? $colorSource['nombre'] ?? null,
                        'code' => $colorSource['code'] ?? $colorSource['codigo_hex'] ?? null
                    ];
                } elseif (is_string($colorSource)) {
                    $color = ['name' => $colorSource, 'code' => null];
                }

                $image = $extra['image'] ?? $row['imagen_url'] ?? null;
                $price = $row['price'] !== null ? (float) $row['price'] : (isset($row['mueble_precio']) ? (float) $row['mueble_precio'] : 0);
                $quantity = (int) ($row['quantity'] ?? 1);
                if ($price && $quantity) {
                    $calculatedTotal += $price * $quantity;
                }

                $items[] = [
                    'id' => $row['mueble_id'],
                    'name' => $row['name'] ?? $row['mueble_nombre'],
                    'description' => $row['mueble_descripcion'] ?? $extra['description'] ?? null,
                    'quantity' => $quantity,
                    'price' => $price,
                    'image' => $image,
                    'dimensions' => $dimensions,
                    'color' => $color,
                    'availableColors' => $allColors,
                    'includes' => $includes
                ];
            }
        } else {
            // fallback to JSON stored in pedidos.items
            $decoded = decode_json_array($p['items'] ?? null);
            foreach ($decoded as $rawItem) {
                $name = $rawItem['name'] ?? $rawItem['title'] ?? (is_string($rawItem) ? $rawItem : 'Item');
                $quantity = isset($rawItem['quantity']) ? (int) $rawItem['quantity'] : 1;
                $price = isset($rawItem['price']) ? (float) $rawItem['price'] : (isset($rawItem['unit_price']) ? (float) $rawItem['unit_price'] : 0);
                if ($price && $quantity) $calculatedTotal += $price * $quantity;
                $items[] = [
                    'id' => $rawItem['id'] ?? null,
                    'name' => $name,
                    'description' => $rawItem['description'] ?? null,
                    'quantity' => $quantity,
                    'price' => $price,
                    'image' => $rawItem['image'] ?? null,
                    'dimensions' => $rawItem['dimensions'] ?? null,
                    'color' => $rawItem['color'] ?? $rawItem['selectedColor'] ?? null,
                    'includes' => split_includes($rawItem['includes'] ?? null)
                ];
            }
        }

        $statusInfo = normalize_status($p['status'] ?? $p['estado'] ?? 'pending');
        $orderKey = 'pedido:' . $p['id'];
        $reviewData = $reviewsByOrder[$orderKey] ?? null;
        $canReview = is_reviewable_order_status($statusInfo['value']) && !$reviewData;
        $finalTotal = $totalFromDb ?: $calculatedTotal;
        $results[] = [
            'type' => 'pedido',
            'id' => (int) $p['id'],
            'name' => $p['order_name'] ?? $p['nombre'] ?? ('Pedido ' . $p['id']),
            'description' => $p['description'] ?? $p['descripcion'] ?? null,
            'items' => $items,
            'total' => $finalTotal ?: null,
            'estimated_total' => null,
            'rejection_reason' => null,
            'rejection_date' => null,
            'status' => $statusInfo['value'],
            'status_label' => $statusInfo['label'],
            'progress_status' => null,
            'created_at' => $p['created_at'] ?? $p['fecha'] ?? null,
            'review' => $reviewData,
            'can_review' => $canReview
        ];
    }

    // 2) Fetch custom proyectos / presupuestos that belong to this cliente
    $stmt = $pdo->prepare('
        SELECT 
            pr.id as proyecto_id,
            pr.nombre as proyecto_nombre,
            pr.descripcion as proyecto_descripcion,
            pr.carpintero_estado,
            ps.id as presupuesto_id,
            ps.total,
            ps.estimated_total,
            ps.estado,
            ps.fecha_creacion,
            ps.detalle,
            ps.rechazo_motivo,
            ps.rechazado_por,
            ps.fecha_rechazo
        FROM proyectos pr 
        JOIN presupuestos ps ON ps.proyecto_id = pr.id 
        WHERE pr.cliente_id = ? 
        ORDER BY ps.fecha_creacion DESC
    ');
    $stmt->execute([$cliente_id]);
    $cust = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cust as $c) {
        $items = [];
        $customTotalFromDb = isset($c['total']) ? (float) $c['total'] : 0;
        $estimatedTotal = isset($c['estimated_total']) ? (float) $c['estimated_total'] : null;
        $customCalculatedTotal = 0;

        $detallePayload = null;
        if (!empty($c['detalle'])) {
            $decoded = json_decode($c['detalle'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $detallePayload = $decoded;
            }
        }

        $candidateItems = [];
        if (is_array($detallePayload)) {
            if (isset($detallePayload['furniture']) && is_array($detallePayload['furniture'])) {
                $candidateItems = $detallePayload['furniture'];
            } elseif (isset($detallePayload[0])) {
                $candidateItems = $detallePayload;
            }
        }

        if ($candidateItems) {
            foreach ($candidateItems as $item) {
                if (!is_array($item)) continue;
                $includes = split_includes($item['includes'] ?? null);
                $dimensions = $item['dimensions'] ?? null;
                if (is_array($dimensions)) {
                    $dimensions = [
                        'width' => $dimensions['width'] ?? null,
                        'height' => $dimensions['height'] ?? null,
                        'depth' => $dimensions['depth'] ?? null
                    ];
                }
                $color = $item['color'] ?? $item['selectedColor'] ?? null;
                if (is_array($color)) {
                    $color = [
                        'name' => $color['name'] ?? $color['nombre'] ?? null,
                        'code' => $color['code'] ?? $color['codigo_hex'] ?? null
                    ];
                }
                $quantity = isset($item['quantity']) ? (int) $item['quantity'] : 1;
                $price = isset($item['price']) ? (float) $item['price'] : (isset($item['unit_price']) ? (float) $item['unit_price'] : 0);
                if ($price && $quantity) {
                    $customCalculatedTotal += $price * $quantity;
                }
                $items[] = [
                    'name' => $item['name'] ?? $item['title'] ?? 'Furniture item',
                    'description' => $item['description'] ?? null,
                    'quantity' => $quantity,
                    'price' => $price,
                    'image' => $item['image'] ?? null,
                    'dimensions' => $dimensions,
                    'color' => $color,
                    'includes' => $includes
                ];
            }
        } elseif (!empty($c['proyecto_descripcion'])) {
            $items[] = [
                'name' => $c['proyecto_nombre'] ?? ('Proyecto ' . $c['proyecto_id']),
                'description' => $c['proyecto_descripcion'],
                'quantity' => 1,
                'price' => $customTotalFromDb ?: ($estimatedTotal ?? 0),
                'image' => null,
                'dimensions' => null,
                'color' => null,
                'includes' => []
            ];
            if ($customTotalFromDb) {
                $customCalculatedTotal += $customTotalFromDb;
            } elseif ($estimatedTotal) {
                $customCalculatedTotal += $estimatedTotal;
            }
        }

        $statusInfo = normalize_status($c['estado'] ?? 'pending');
        $progressValue = null;
        $progressLabel = null;
        if (!empty($c['carpintero_estado'])) {
            $normalizedProgress = normalize_status($c['carpintero_estado']);
            $progressValue = $normalizedProgress['value'];
            $progressLabel = $normalizedProgress['label'];
        }
        $orderKey = 'custom:' . $c['presupuesto_id'];
        $reviewData = $reviewsByOrder[$orderKey] ?? null;
        $canReview = is_reviewable_order_status($statusInfo['value']) && !$reviewData;

        $results[] = [
            'type' => 'custom',
            'id' => (int) $c['presupuesto_id'],
            'project_id' => (int) $c['proyecto_id'],
            'name' => $c['proyecto_nombre'] ?? ('Proyecto ' . $c['proyecto_id']),
            'description' => $c['proyecto_descripcion'] ?? null,
            'items' => $items,
            'total' => $customTotalFromDb ?: ($estimatedTotal ?: ($customCalculatedTotal ?: null)),
            'estimated_total' => $estimatedTotal,
            'status' => $statusInfo['value'],
            'status_label' => $statusInfo['label'],
            'progress_status' => $progressValue,
            'progress_status_label' => $progressLabel,
            'rejection_reason' => $c['rechazo_motivo'] ?? null,
            'rejected_by' => $c['rechazado_por'] ?? null,
            'rejection_date' => $c['fecha_rechazo'] ?? null,
            'created_at' => $c['fecha_creacion'] ?? null,
            'review' => $reviewData,
            'can_review' => $canReview
        ];
    }

    echo json_encode(['success' => true, 'orders' => $results]);
    exit;
} catch (Exception $e) {
    error_log('get_my_orders.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

?>





