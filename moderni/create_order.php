<?php
require_once __DIR__ . '/conexion.php';
// create_order.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { echo json_encode(['success' => false, 'message' => 'Invalid JSON']); exit; }

session_start();
$cliente_id = null;
if (isset($_SESSION['user_id'])) $cliente_id = intval($_SESSION['user_id']);
if (!$cliente_id && isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) $cliente_id = intval($_COOKIE['user_id']);

try {
    $pdo = get_pdo_connection();
// If no cliente_id, try to resolve or create guest similar to create_custom_order
    if (!$cliente_id) {
        if (!empty($data['cliente_email'])) {
            $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
            $stmt->execute([$data['cliente_email']]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) $cliente_id = intval($row['id']);
            else {
                $nombreCliente = !empty($data['cliente_name']) ? $data['cliente_name'] : $data['cliente_email'];
                $pw = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
                $ins = $pdo->prepare('INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)');
                $ins->execute([$nombreCliente, $data['cliente_email'], $pw, 'cliente']);
                $cliente_id = $pdo->lastInsertId();
            }
        } else {
            $genEmail = 'guest+' . time() . '@moderni.local';
            $nombreCliente = $data['cliente_name'] ?? 'Cliente Invitado';
            $pw = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $ins = $pdo->prepare('INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)');
            $ins->execute([$nombreCliente, $genEmail, $pw, 'cliente']);
            $cliente_id = $pdo->lastInsertId();
        }
    }

    $titulo = $data['title'] ?? ('Pedido - ' . date('Y-m-d H:i:s'));
    $descripcion = $data['description'] ?? null;
    $total = isset($data['totalPrice']) ? floatval($data['totalPrice']) : 0.0;
    $fecha = date('Y-m-d H:i:s');
    $estado = 'pendiente';

    // Insert into pedidos: detect available columns and build insert dynamically to be compatible with different schemas
    $availableCols = $pdo->query("SHOW COLUMNS FROM pedidos")->fetchAll(PDO::FETCH_COLUMN, 0);
    // Ensure space dimension columns exist (space_width, space_height, space_depth) so we can persist dimensions
    $neededDims = ['space_width','space_height','space_depth'];
    foreach ($neededDims as $col) {
        if (!in_array($col, $availableCols)) {
            try {
                $pdo->exec("ALTER TABLE pedidos ADD COLUMN $col DECIMAL(10,2) NULL");
                // refresh availableCols
                $availableCols = $pdo->query("SHOW COLUMNS FROM pedidos")->fetchAll(PDO::FETCH_COLUMN, 0);
            } catch (Exception $e) {
                // if unable to alter (permissions), continue without throwing – we'll attempt best-effort insert
                @file_put_contents(__DIR__ . '/create_order_error.log', date('c') . ' - alter failed for ' . $col . ' - ' . $e->getMessage() . "\n", FILE_APPEND);
            }
        }
    }
    // columns we will try to set if present
    $colMap = [
        'cliente_id' => 'cliente_id',
        'titulo' => in_array('titulo', $availableCols) ? 'titulo' : (in_array('title', $availableCols) ? 'title' : null),
        'descripcion' => in_array('descripcion', $availableCols) ? 'descripcion' : (in_array('description', $availableCols) ? 'description' : null),
        'total' => in_array('total', $availableCols) ? 'total' : (in_array('amount', $availableCols) ? 'amount' : null),
        'estado' => in_array('estado', $availableCols) ? 'estado' : (in_array('status', $availableCols) ? 'status' : null),
        'fecha_creacion' => in_array('fecha_creacion', $availableCols) ? 'fecha_creacion' : (in_array('created_at', $availableCols) ? 'created_at' : null),
        'items' => in_array('items', $availableCols) ? 'items' : null,
    ];

    $insertCols = [];
    $placeholders = [];
    $values = [];
    // cliente_id (if present)
    if (in_array('cliente_id', $availableCols)) {
        $insertCols[] = 'cliente_id'; $placeholders[] = '?'; $values[] = $cliente_id;
    }
    if ($colMap['titulo']) { $insertCols[] = $colMap['titulo']; $placeholders[] = '?'; $values[] = $titulo; }
    if ($colMap['descripcion']) { $insertCols[] = $colMap['descripcion']; $placeholders[] = '?'; $values[] = $descripcion; }
    if ($colMap['total']) { $insertCols[] = $colMap['total']; $placeholders[] = '?'; $values[] = $total; }
    if ($colMap['estado']) { $insertCols[] = $colMap['estado']; $placeholders[] = '?'; $values[] = $estado; }
    if ($colMap['fecha_creacion']) { $insertCols[] = $colMap['fecha_creacion']; $placeholders[] = '?'; $values[] = $fecha; }

    // Gather space dimensions from payload (client sends width/height/depth or spaceDimensions object)
    $space_width = null; $space_height = null; $space_depth = null;
    if (!empty($data['width']) || !empty($data['height']) || !empty($data['depth'])) {
        if (isset($data['width'])) $space_width = floatval($data['width']);
        if (isset($data['height'])) $space_height = floatval($data['height']);
        if (isset($data['depth'])) $space_depth = floatval($data['depth']);
    } elseif (!empty($data['spaceDimensions']) && is_array($data['spaceDimensions'])) {
        $sd = $data['spaceDimensions'];
        if (isset($sd['width'])) $space_width = floatval($sd['width']);
        if (isset($sd['height'])) $space_height = floatval($sd['height']);
        if (isset($sd['depth'])) $space_depth = floatval($sd['depth']);
    }

    // Normalize dimension values: accept strings like "2.8m", "280cm", "2,8" or numeric values.
    function parse_dimension($v) {
        if ($v === null) return null;
        // already numeric
        if (is_numeric($v)) return floatval($v);
        $s = trim((string)$v);
        if ($s === '') return null;
        $sl = strtolower($s);
        // 280cm -> 280
        if (preg_match('/^([0-9.,]+)\s*cm$/i', $sl, $m)) {
            $num = str_replace(',', '.', $m[1]);
            return floatval($num);
        }
        // 2.8m -> 280 (convert meters to cm)
        if (preg_match('/^([0-9.,]+)\s*m$/i', $sl, $m)) {
            $num = str_replace(',', '.', $m[1]);
            return floatval($num) * 100.0;
        }
        // plain number with comma decimal -> 2,8 -> 2.8
        $clean = str_replace(',', '.', $s);
        if (is_numeric($clean)) {
            $num = floatval($clean);
            // if value looks like meters (less than 10) convert to cm
            if ($num > 0 && $num < 10) return $num * 100.0;
            return $num;
        }
        return null;
    }

    $space_width = parse_dimension($space_width);
    $space_height = parse_dimension($space_height);
    $space_depth = parse_dimension($space_depth);

    // If the pedidos table has the space columns, include them in INSERT
    if (in_array('space_width', $availableCols) && $space_width !== null) { $insertCols[] = 'space_width'; $placeholders[] = '?'; $values[] = $space_width; }
    if (in_array('space_height', $availableCols) && $space_height !== null) { $insertCols[] = 'space_height'; $placeholders[] = '?'; $values[] = $space_height; }
    if (in_array('space_depth', $availableCols) && $space_depth !== null) { $insertCols[] = 'space_depth'; $placeholders[] = '?'; $values[] = $space_depth; }

    if (count($insertCols) === 0) {
        throw new Exception('No compatible columns found on pedidos table');
    }

    $sql = 'INSERT INTO pedidos (' . implode(',', $insertCols) . ') VALUES (' . implode(',', $placeholders) . ')';
    $ins = $pdo->prepare($sql);
    $ins->execute($values);
    $pedido_id = $pdo->lastInsertId();

    // Insert pedido items into pedido_items table (if exists), otherwise store items as JSON in pedidos.items (best-effort)
    $items = $data['furniture'] ?? $data['items'] ?? [];
    if (!is_array($items)) $items = [];

    // Try to insert into pedido_items
    $hasPedidoItems = $pdo->query("SHOW TABLES LIKE 'pedido_items'")->fetch();
    if ($hasPedidoItems) {
        $insItem = $pdo->prepare('INSERT INTO pedido_items (pedido_id, name, quantity, price, extra) VALUES (?, ?, ?, ?, ?)');
        foreach ($items as $it) {
            $name = $it['name'] ?? $it['nombre'] ?? 'Item';
            $qty = isset($it['quantity']) ? intval($it['quantity']) : (isset($it['cantidad']) ? intval($it['cantidad']) : 1);
            $price = isset($it['price']) ? floatval($it['price']) : (isset($it['precio']) ? floatval($it['precio']) : null);
            $extra = json_encode($it);
            $insItem->execute([$pedido_id, $name, $qty, $price, $extra]);
        }
    } else {
        // fallback: update pedidos.items JSON column if exists
        $itemsJson = json_encode($items);
        $haveItemsCol = $pdo->query("SHOW COLUMNS FROM pedidos LIKE 'items'")->fetch();
        if ($haveItemsCol) {
            $upd = $pdo->prepare('UPDATE pedidos SET items = ? WHERE id = ?');
            $upd->execute([$itemsJson, $pedido_id]);
        }
    }

    echo json_encode(['success' => true, 'pedido_id' => $pedido_id]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    @file_put_contents(__DIR__ . '/create_order_error.log', date('c') . ' - ' . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()]);
}

?>