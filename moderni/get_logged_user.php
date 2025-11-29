<?php
require_once __DIR__ . '/conexion.php';
// get_logged_user.php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

try {
    session_start();
    $user_id = 0;
    if (isset($_SESSION['user_id'])) {
        $user_id = (int)$_SESSION['user_id'];
    } elseif (isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) {
        $user_id = (int)$_COOKIE['user_id'];
    }

    if ($user_id <= 0) {
        echo json_encode(null);
        exit;
    }
    $pdo = get_pdo_connection();
    $stmt = $pdo->prepare('SELECT id, nombre, email, telefono, direccion, rol, fecha_registro FROM usuarios WHERE id = ? LIMIT 1');
    $stmt->execute([$user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        echo json_encode(null);
        exit;
    }

    $telefono = $row['telefono'] ?? null;
    $direccion = $row['direccion'] ?? null;
    $fechaRegistro = $row['fecha_registro'] ?? null;

    $response = [
        'id' => (int)$row['id'],
        'nombre' => $row['nombre'],
        'name' => $row['nombre'],
        'email' => $row['email'],
        'telefono' => $telefono,
        'phone' => $telefono,
        'direccion' => $direccion,
        'address' => $direccion,
        'rol' => $row['rol'] ?? 'cliente',
        'fecha_registro' => $fechaRegistro,
        'memberSince' => $fechaRegistro,
    ];

    $_SESSION['user_id'] = $response['id'];
    $_SESSION['user'] = array_merge($_SESSION['user'] ?? [], $response);

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

?>





