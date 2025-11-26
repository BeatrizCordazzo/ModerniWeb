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

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

session_start();
$cliente_id = null;
if (isset($_SESSION['user_id'])) {
    $cliente_id = intval($_SESSION['user_id']);
}
// Some auth endpoints/setups use a cookie 'user_id' instead of PHP session.
if (!$cliente_id && isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) {
    $cliente_id = intval($_COOKIE['user_id']);
}

// Debug: log which cliente_id we detected (helps trace guest vs logged-in behavior)
@file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'create_custom_order_debug.log', date('Y-m-d H:i:s') . " - detected cliente_id: " . var_export($cliente_id, true) . "\n", FILE_APPEND);

try {
    $pdo = get_pdo_connection();

    // Ensure the presupuestos table can store both estimated and final totals (for older DBs)
    try {
        $estimatedCol = $pdo->query("SHOW COLUMNS FROM presupuestos LIKE 'estimated_total'")->fetch(PDO::FETCH_ASSOC);
        if (!$estimatedCol) {
            $pdo->exec("ALTER TABLE presupuestos ADD COLUMN estimated_total DECIMAL(12,2) NULL AFTER total");
        }
    } catch (Exception $e) {
        @file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'create_custom_order_error.log', date('Y-m-d H:i:s') . " - Could not ensure estimated_total column: " . $e->getMessage() . "\n", FILE_APPEND);
    }

    // If we couldn't find the logged user in session, try to resolve by email supplied in payload
    if (!$cliente_id) {
        if (!empty($data['cliente_email'])) {
            $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
            $stmt->execute([$data['cliente_email']]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $cliente_id = intval($row['id']);
            } else {
                // create a new cliente user
                $nombreCliente = !empty($data['cliente_name']) ? $data['cliente_name'] : $data['cliente_email'];
                $passwordHash = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
                $ins = $pdo->prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)');
                $ins->execute([$nombreCliente, $data['cliente_email'], $passwordHash, 'cliente']);
                $cliente_id = $pdo->lastInsertId();
            }
        } else if (!empty($data['cliente_name'])) {
            // create a guest user record using a generated email
            $genEmail = 'guest+' . time() . '@moderni.local';
            $nombreCliente = $data['cliente_name'];
            $passwordHash = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $ins = $pdo->prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)');
            $ins->execute([$nombreCliente, $genEmail, $passwordHash, 'cliente']);
            $cliente_id = $pdo->lastInsertId();
        } else {
            // No user info provided: create a guest account so admin can trace the pedido
            $genEmail = 'guest+' . time() . '@moderni.local';
            $nombreCliente = 'Cliente Invitado';
            $passwordHash = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $ins = $pdo->prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)');
            $ins->execute([$nombreCliente, $genEmail, $passwordHash, 'cliente']);
            $cliente_id = $pdo->lastInsertId();
        }
    }

    // find architect id if exists (arq@moderni.local)
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = 'arq@moderni.local' LIMIT 1");
    $stmt->execute();
    $arq = $stmt->fetch(PDO::FETCH_ASSOC);
    $arquitecto_id = $arq ? intval($arq['id']) : null;

    // Create a proyecto
    $nombre = isset($data['title']) ? $data['title'] : 'Pedido personalizado ' . date('Y-m-d H:i:s');
    $descripcion = isset($data['description']) ? $data['description'] : (isset($data['spaceDimensions']) ? json_encode($data['spaceDimensions']) : 'Pedido personalizado');
    $fecha_inicio = date('Y-m-d');
    $fecha_entrega = isset($data['desired_finish']) ? $data['desired_finish'] : null;

    $insertProyecto = $pdo->prepare('INSERT INTO proyectos (cliente_id, arquitecto_id, nombre, descripcion, estado, fecha_inicio, fecha_entrega) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $estadoProyecto = 'pendiente';
    $insertProyecto->execute([$cliente_id, $arquitecto_id, $nombre, $descripcion, $estadoProyecto, $fecha_inicio, $fecha_entrega]);
    $proyecto_id = $pdo->lastInsertId();

    // Create presupuestos entry
    $total = isset($data['totalPrice']) ? floatval($data['totalPrice']) : 0.0;
    $insertPres = $pdo->prepare('INSERT INTO presupuestos (cliente_id, proyecto_id, total, estimated_total, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?)');
    $fecha_creacion = date('Y-m-d H:i:s');
    $presEstado = 'pendiente';
    $insertPres->execute([$cliente_id, $proyecto_id, $total, $total, $presEstado, $fecha_creacion]);
    $presupuesto_id = $pdo->lastInsertId();

    // Store a detalle column as JSON with furniture, images and spaceDimensions.
    if (!empty($data['furniture']) || !empty($data['images']) || !empty($data['spaceDimensions'])) {
        // Check if column exists; if not, attempt to add it so older DBs still work
        $colCheck = $pdo->query("SHOW COLUMNS FROM presupuestos LIKE 'detalle'")->fetch();
        if (!$colCheck) {
            try {
                $pdo->exec("ALTER TABLE presupuestos ADD COLUMN detalle TEXT NULL");
                // re-check
                $colCheck = $pdo->query("SHOW COLUMNS FROM presupuestos LIKE 'detalle'")->fetch();
            } catch (Exception $e) {
                // If adding column fails, log and continue 
                @file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'create_custom_order_error.log', date('Y-m-d H:i:s') . " - Could not add detalle column: " . $e->getMessage() . "\n", FILE_APPEND);
            }
        }

        if ($colCheck) {
            // Normalize furniture and images before storing
            $furniture = $data['furniture'] ?? [];
            if (!is_array($furniture)) $furniture = [];

            // Ensure each furniture item preserves expected keys
            $normalizedFurniture = [];
            foreach ($furniture as $fi) {
                if (!is_array($fi)) continue;
                $normalizedFurniture[] = [
                    'name' => $fi['name'] ?? ($fi['nombre'] ?? null),
                    'quantity' => isset($fi['quantity']) ? intval($fi['quantity']) : (isset($fi['cantidad']) ? intval($fi['cantidad']) : 1),
                    'dimensions' => $fi['dimensions'] ?? ($fi['dimensiones'] ?? null),
                    'price' => isset($fi['price']) ? floatval($fi['price']) : (isset($fi['precio']) ? floatval($fi['precio']) : null),
                    'image' => $fi['image'] ?? ($fi['img'] ?? ($fi['imagen'] ?? null)),
                    'meta' => isset($fi['meta']) ? $fi['meta'] : null,
                ];
            }

            // Build images array: prefer data['images'], otherwise collect from furniture.image
            $images = [];
            if (!empty($data['images']) && is_array($data['images'])) {
                $images = $data['images'];
            }
            if (empty($images)) {
                foreach ($normalizedFurniture as $nf) {
                    if (!empty($nf['image'])) $images[] = $nf['image'];
                }
            }
            // clean images: remove nulls and duplicates
            $images = array_values(array_filter(array_unique($images)));

            $detallePayload = [
                'furniture' => $normalizedFurniture,
                'images' => $images,
                'spaceDimensions' => $data['spaceDimensions'] ?? null,
                'meta' => [
                    'sent_at' => date('c'),
                    'client_email' => $data['cliente_email'] ?? null,
                    'saved_by' => 'create_custom_order.php'
                ]
            ];
            $detalleJson = json_encode($detallePayload);
            $upd = $pdo->prepare('UPDATE presupuestos SET detalle = ? WHERE id = ?');
            $upd->execute([$detalleJson, $presupuesto_id]);
        }
    }

    echo json_encode(['success' => true, 'proyecto_id' => $proyecto_id, 'presupuesto_id' => $presupuesto_id]);
    exit;
} catch (Exception $e) {
    // Log detailed error for debugging
    $logFile = __DIR__ . DIRECTORY_SEPARATOR . 'create_custom_order_error.log';
    $msg = date('Y-m-d H:i:s') . " - Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n";
    @file_put_contents($logFile, $msg, FILE_APPEND);

    http_response_code(500);
    // Return the exception message to help client-side debugging during development
    echo json_encode(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()]);
    exit;
}





