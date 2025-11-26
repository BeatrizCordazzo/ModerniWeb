<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/conexion.php';
$pdo = get_pdo_connection();

// Get product ID
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Product ID is required"]);
    exit();
}

// Build query
$stmt = $pdo->prepare("SELECT 
    m.id,
    m.nombre,
    m.coleccion,
    m.descripcion,
    c.nombre as categoria,
    m.tipo_producto,
    m.precio,
    m.precio_anterior,
    m.stock,
    m.en_stock,
    m.imagen_url,
    m.estilo,
    m.dimensiones_ancho,
    m.dimensiones_alto,
    m.dimensiones_profundo,
    m.incluye
FROM muebles m
INNER JOIN categorias c ON m.categoria_id = c.id
WHERE m.id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) {
    http_response_code(404);
    echo json_encode(["error" => "Product not found"]);
    exit();
}

// Get colors for this product
$color_stmt = $pdo->prepare("SELECT co.nombre, co.codigo_hex 
              FROM colores_mueble cm
              INNER JOIN colores co ON cm.color_id = co.id
              WHERE cm.mueble_id = ?");
$color_stmt->execute([$row['id']]);
$colors = [];
while ($color_row = $color_stmt->fetch(PDO::FETCH_ASSOC)) {
    $colors[] = [
        "name" => $color_row['nombre'],
        "code" => $color_row['codigo_hex']
    ];
}

// Parse includes array
$includes = array();
if (!empty($row['incluye'])) {
    $includes = explode('|', $row['incluye']);
}

// Build product object
$product = array(
    "id" => (int)$row['id'],
    "name" => $row['nombre'],
    "collection" => $row['coleccion'],
    "description" => $row['descripcion'],
    "category" => $row['categoria'],
    "type" => $row['tipo_producto'],
    "price" => (float)$row['precio'],
    "oldPrice" => $row['precio_anterior'] ? (float)$row['precio_anterior'] : null,
    "inStock" => (bool)$row['en_stock'],
    "stock" => (int)$row['stock'],
    "image" => $row['imagen_url'],
    "style" => $row['estilo'],
    "colors" => $colors,
    "includes" => $includes
);

// Add dimensions if available
if ($row['dimensiones_ancho'] || $row['dimensiones_alto'] || $row['dimensiones_profundo']) {
    $product['dimensions'] = array(
        "width" => $row['dimensiones_ancho'],
        "height" => $row['dimensiones_alto'],
        "depth" => $row['dimensiones_profundo']
    );
}

// Return JSON response
echo json_encode($product, JSON_UNESCAPED_UNICODE);
?>


