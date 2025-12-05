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

$titulo = trim($data['titulo'] ?? ($data['title'] ?? ''));
$descripcion = trim($data['descripcion'] ?? ($data['description'] ?? ''));
$categoria = trim($data['categoria'] ?? ($data['category'] ?? ''));
$cliente = trim($data['cliente'] ?? ($data['client'] ?? ''));
$ubicacion = trim($data['ubicacion'] ?? ($data['location'] ?? ''));
$fechaCompletado = trim($data['fecha_completado'] ?? ($data['completed_at'] ?? ''));
$duracion = isset($data['duracion_dias']) ? (int)$data['duracion_dias'] : (isset($data['duration']) ? (int)$data['duration'] : null);
$presupuesto = isset($data['presupuesto']) ? (float)$data['presupuesto'] : (isset($data['budget']) ? (float)$data['budget'] : null);
$estilo = trim($data['estilo'] ?? ($data['style'] ?? ''));
$area = isset($data['area_m2']) ? (float)$data['area_m2'] : (isset($data['area']) ? (float)$data['area'] : null);
$destacado = array_key_exists('destacado', $data) ? (bool)$data['destacado'] : (bool)($data['featured'] ?? false);
$imagenes = [];
if (!empty($data['imagenes']) && is_array($data['imagenes'])) {
    $imagenes = $data['imagenes'];
} elseif (!empty($data['images']) && is_array($data['images'])) {
    $imagenes = $data['images'];
}
if (!empty($data['imagen_principal'])) {
    array_unshift($imagenes, $data['imagen_principal']);
}
$imagenes = array_values(array_filter(array_map(static function ($img) {
    return trim((string)$img);
}, $imagenes)));
$imagenes = array_slice(array_unique($imagenes), 0, 4);

$materiales = $data['materiales'] ?? ($data['materials'] ?? []);
if (is_string($materiales)) {
    $materiales = preg_split('/[\r\n,]+/', $materiales);
}
if (!is_array($materiales)) {
    $materiales = [];
}
$materiales = array_values(array_filter(array_map(static function ($mat) {
    return trim((string)$mat);
}, $materiales)));
$materialesJoined = !empty($materiales) ? implode('|', $materiales) : null;

if ($titulo === '' || $categoria === '' || empty($imagenes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    $pdo = get_pdo_connection();

    $stmt = $pdo->prepare('
        INSERT INTO proyectos_showcase
            (titulo, descripcion, categoria, cliente, ubicacion, fecha_completado, duracion_dias, presupuesto, imagen_principal, imagen_2, imagen_3, imagen_4, estilo, area_m2, materiales, destacado)
        VALUES
            (:titulo, :descripcion, :categoria, :cliente, :ubicacion, :fecha_completado, :duracion_dias, :presupuesto, :imagen_principal, :imagen_2, :imagen_3, :imagen_4, :estilo, :area_m2, :materiales, :destacado)
    ');
    $stmt->execute([
        ':titulo' => $titulo,
        ':descripcion' => $descripcion !== '' ? $descripcion : null,
        ':categoria' => $categoria,
        ':cliente' => $cliente !== '' ? $cliente : null,
        ':ubicacion' => $ubicacion !== '' ? $ubicacion : null,
        ':fecha_completado' => $fechaCompletado !== '' ? $fechaCompletado : null,
        ':duracion_dias' => $duracion,
        ':presupuesto' => $presupuesto,
        ':imagen_principal' => $imagenes[0] ?? null,
        ':imagen_2' => $imagenes[1] ?? null,
        ':imagen_3' => $imagenes[2] ?? null,
        ':imagen_4' => $imagenes[3] ?? null,
        ':estilo' => $estilo !== '' ? $estilo : null,
        ':area_m2' => $area,
        ':materiales' => $materialesJoined,
        ':destacado' => $destacado ? 1 : 0,
    ]);

    $projectId = (int)$pdo->lastInsertId();
    $projectStmt = $pdo->prepare('SELECT * FROM proyectos_showcase WHERE id = :id LIMIT 1');
    $projectStmt->execute([':id' => $projectId]);
    $project = $projectStmt->fetch();

    if (!$project) {
        throw new RuntimeException('Unable to fetch inserted project');
    }

    $imagenesResult = [];
    if (!empty($project['imagen_principal'])) $imagenesResult[] = $project['imagen_principal'];
    if (!empty($project['imagen_2'])) $imagenesResult[] = $project['imagen_2'];
    if (!empty($project['imagen_3'])) $imagenesResult[] = $project['imagen_3'];
    if (!empty($project['imagen_4'])) $imagenesResult[] = $project['imagen_4'];

    $materialesResult = [];
    if (!empty($project['materiales'])) {
        $materialesResult = explode('|', $project['materiales']);
    }

    $payload = [
        'id' => (int)$project['id'],
        'titulo' => $project['titulo'],
        'descripcion' => $project['descripcion'],
        'categoria' => $project['categoria'],
        'cliente' => $project['cliente'],
        'ubicacion' => $project['ubicacion'],
        'fecha_completado' => $project['fecha_completado'],
        'duracion_dias' => $project['duracion_dias'] !== null ? (int)$project['duracion_dias'] : null,
        'presupuesto' => $project['presupuesto'] !== null ? (float)$project['presupuesto'] : null,
        'imagenes' => $imagenesResult,
        'estilo' => $project['estilo'],
        'area_m2' => $project['area_m2'] !== null ? (float)$project['area_m2'] : null,
        'materiales' => $materialesResult,
        'destacado' => (bool)$project['destacado'],
    ];

    echo json_encode(['success' => true, 'project' => $payload]);
    exit;

} catch (Exception $e) {
    error_log('create_showcase_project.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error creating showcase project', 'details' => $e->getMessage()]);
    exit;
}





