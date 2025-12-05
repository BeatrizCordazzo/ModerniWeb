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

// Get parameters
$categoria = isset($_GET['categoria']) ? $_GET['categoria'] : null;
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : null;

// Build query
$sql = "SELECT 
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
WHERE 1=1";

$params = [];
if ($categoria) {
    $sql .= " AND c.nombre = :categoria";
    $params[':categoria'] = $categoria;
}

if ($tipo) {
    $sql .= " AND m.tipo_producto = :tipo";
    $params[':tipo'] = $tipo;
}

$sql .= " ORDER BY m.id";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$products = [];
$colorStmt = $pdo->prepare("SELECT co.nombre, co.codigo_hex 
    FROM colores_mueble cm
    INNER JOIN colores co ON cm.color_id = co.id
    WHERE cm.mueble_id = :mueble_id");

foreach ($rows as $row) {
    $colors = [];
    if ($colorStmt) {
        $colorStmt->execute([':mueble_id' => $row['id']]);
        $colorRows = $colorStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($colorRows as $color_row) {
            $colors[] = [
                "name" => $color_row['nombre'],
                "code" => $color_row['codigo_hex']
            ];
        }
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
    
    $products[] = $product;
}

// Return JSON response
echo json_encode($products, JSON_UNESCAPED_UNICODE);
?>


