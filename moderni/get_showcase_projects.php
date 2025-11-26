<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/conexion.php';
$pdo = get_pdo_connection();

// Get category filter from query parameter
$category = isset($_GET['categoria']) ? $_GET['categoria'] : null;

// Build query
$sql = "SELECT 
            id,
            titulo,
            descripcion,
            categoria,
            cliente,
            ubicacion,
            fecha_completado,
            duracion_dias,
            presupuesto,
            imagen_principal,
            imagen_2,
            imagen_3,
            imagen_4,
            estilo,
            area_m2,
            materiales,
            destacado
        FROM proyectos_showcase";

if ($category) {
    $sql .= " WHERE categoria = :categoria";
}

$sql .= " ORDER BY destacado DESC, fecha_completado DESC";

$stmt = $pdo->prepare($sql);
$params = $category ? [':categoria' => $category] : [];
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$projects = array();

foreach ($rows as $row) {
    $imagenes = array();
    if (!empty($row['imagen_principal'])) $imagenes[] = $row['imagen_principal'];
    if (!empty($row['imagen_2'])) $imagenes[] = $row['imagen_2'];
    if (!empty($row['imagen_3'])) $imagenes[] = $row['imagen_3'];
    if (!empty($row['imagen_4'])) $imagenes[] = $row['imagen_4'];
    
    $materiales_array = array();
    if (!empty($row['materiales'])) {
        $materiales_array = explode('|', $row['materiales']);
    }
    
    $project = array(
        "id" => (int)$row['id'],
        "titulo" => $row['titulo'],
        "descripcion" => $row['descripcion'],
        "categoria" => $row['categoria'],
        "cliente" => $row['cliente'],
        "ubicacion" => $row['ubicacion'],
        "fecha_completado" => $row['fecha_completado'],
        "duracion_dias" => (int)$row['duracion_dias'],
        "presupuesto" => (float)$row['presupuesto'],
        "imagenes" => $imagenes,
        "estilo" => $row['estilo'],
        "area_m2" => (float)$row['area_m2'],
        "materiales" => $materiales_array,
        "destacado" => (bool)$row['destacado']
    );
    
    $projects[] = $project;
}

echo json_encode($projects, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>


