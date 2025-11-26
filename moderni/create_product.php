<?php
require_once __DIR__ . '/conexion.php';
$allowed_origins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost',
    'http://127.0.0.1'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
$userRole = null;
if (isset($_SESSION['user'])) {
    $u = $_SESSION['user'];
    $userRole = $u['rol'] ?? ($u['role'] ?? null);
}
$allowed_roles = ['admin', 'arquitecto'];
if (!in_array($userRole, $allowed_roles, true)) {
    $isLocalOrigin = false;
    if ($origin) {
        if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
            $isLocalOrigin = true;
        }
    }
    if (!$isLocalOrigin) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden: admin role required']);
        exit;
    }
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payload']);
    exit;
}

$name = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$collection = trim($data['collection'] ?? '');
$categoryName = trim($data['categoryName'] ?? ($data['categoria'] ?? ''));
$type = trim($data['type'] ?? ($data['tipo_producto'] ?? ''));
$price = isset($data['price']) ? (float)$data['price'] : null;
$oldPrice = isset($data['oldPrice']) ? (float)$data['oldPrice'] : null;
$stock = isset($data['stock']) ? (int)$data['stock'] : 0;
$inStock = array_key_exists('inStock', $data) ? (bool)$data['inStock'] : true;
$imageUrl = trim($data['image'] ?? ($data['imagen_url'] ?? ''));
$style = trim($data['style'] ?? '');
$includes = $data['includes'] ?? [];
$dimensions = $data['dimensions'] ?? [];

if ($name === '' || $categoryName === '' || $type === '' || $price === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$dimensionsWidth = is_array($dimensions) ? trim($dimensions['width'] ?? '') : '';
$dimensionsHeight = is_array($dimensions) ? trim($dimensions['height'] ?? '') : '';
$dimensionsDepth = is_array($dimensions) ? trim($dimensions['depth'] ?? '') : '';

if (!is_array($includes)) {
    $includes = [];
}
$includes = array_values(array_filter(array_map(static function ($item) {
    return trim((string)$item);
}, $includes)));
$includesJoined = !empty($includes) ? implode('|', $includes) : null;

$colors = [];
if (!empty($data['colors']) && is_array($data['colors'])) {
    $colors = $data['colors'];
}

try {
    $pdo = get_pdo_connection();

    $pdo->beginTransaction();

    $categoriaId = null;
    if ($categoryName !== '') {
        $catStmt = $pdo->prepare('SELECT id FROM categorias WHERE nombre = :nombre LIMIT 1');
        $catStmt->execute([':nombre' => $categoryName]);
        $cat = $catStmt->fetch();
        if ($cat) {
            $categoriaId = (int)$cat['id'];
        } else {
            $catType = (strpos($type, 'set_') === 0) ? 'set' : 'individual';
            $insertCat = $pdo->prepare('INSERT INTO categorias (nombre, tipo, descripcion) VALUES (:nombre, :tipo, :descripcion)');
            $insertCat->execute([
                ':nombre' => $categoryName,
                ':tipo' => $catType,
                ':descripcion' => $catType === 'set' ? 'Auto-creada para sets' : 'Auto-creada para muebles',
            ]);
            $categoriaId = (int)$pdo->lastInsertId();
        }
    }

    $insertSql = '
        INSERT INTO muebles
            (nombre, coleccion, descripcion, categoria, categoria_id, tipo_producto, precio, precio_anterior, stock, en_stock, imagen_url, estilo, dimensiones_ancho, dimensiones_alto, dimensiones_profundo, incluye)
        VALUES
            (:nombre, :coleccion, :descripcion, :categoria, :categoria_id, :tipo_producto, :precio, :precio_anterior, :stock, :en_stock, :imagen_url, :estilo, :dimensiones_ancho, :dimensiones_alto, :dimensiones_profundo, :incluye)
    ';
    $stmt = $pdo->prepare($insertSql);
    $stmt->execute([
        ':nombre' => $name,
        ':coleccion' => $collection !== '' ? $collection : null,
        ':descripcion' => $description !== '' ? $description : null,
        ':categoria' => $categoryName,
        ':categoria_id' => $categoriaId,
        ':tipo_producto' => $type,
        ':precio' => $price,
        ':precio_anterior' => $oldPrice ?: null,
        ':stock' => $stock,
        ':en_stock' => $inStock ? 1 : 0,
        ':imagen_url' => $imageUrl !== '' ? $imageUrl : null,
        ':estilo' => $style !== '' ? $style : null,
        ':dimensiones_ancho' => $dimensionsWidth !== '' ? $dimensionsWidth : null,
        ':dimensiones_alto' => $dimensionsHeight !== '' ? $dimensionsHeight : null,
        ':dimensiones_profundo' => $dimensionsDepth !== '' ? $dimensionsDepth : null,
        ':incluye' => $includesJoined,
    ]);

    $productId = (int)$pdo->lastInsertId();

    if (!empty($colors)) {
        $colorSelect = $pdo->prepare('SELECT id FROM colores WHERE (LOWER(nombre) = LOWER(:nombre) OR codigo_hex = :hex) LIMIT 1');
        $colorInsert = $pdo->prepare('INSERT INTO colores (nombre, codigo_hex) VALUES (:nombre, :hex)');
        $linkInsert = $pdo->prepare('INSERT IGNORE INTO colores_mueble (mueble_id, color_id) VALUES (:mueble_id, :color_id)');

        foreach ($colors as $color) {
            if (!is_array($color)) {
                continue;
            }
            $colorName = trim($color['name'] ?? ($color['nombre'] ?? ''));
            $colorHex = trim($color['code'] ?? ($color['codigo_hex'] ?? ''));
            if ($colorName === '' && $colorHex === '') {
                continue;
            }
            if ($colorHex === '') {
                $colorHex = '#000000';
            }
            if ($colorHex[0] !== '#') {
                $colorHex = '#' . ltrim($colorHex, '#');
            }

            $colorId = null;
            $colorSelect->execute([':nombre' => $colorName, ':hex' => $colorHex]);
            $existing = $colorSelect->fetch();
            if ($existing) {
                $colorId = (int)$existing['id'];
            } else {
                $colorInsert->execute([':nombre' => $colorName ?: $colorHex, ':hex' => $colorHex]);
                $colorId = (int)$pdo->lastInsertId();
            }

            if ($colorId) {
                $linkInsert->execute([':mueble_id' => $productId, ':color_id' => $colorId]);
            }
        }
    }

    $pdo->commit();

    $productStmt = $pdo->prepare('SELECT * FROM muebles WHERE id = :id LIMIT 1');
    $productStmt->execute([':id' => $productId]);
    $product = $productStmt->fetch();

    echo json_encode(['success' => true, 'product' => $product]);
    exit;

} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    error_log('create_product.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error creating product', 'details' => $e->getMessage()]);
    exit;
}
