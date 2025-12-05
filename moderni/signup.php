<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:4200');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json');

require_once __DIR__ . '/conexion.php';

try {
    $jsonInput = file_get_contents('php://input');
    $data = json_decode($jsonInput, true);

    if ($data === null) {
        throw new Exception('Invalid JSON data received');
    }

    $email = $data['email'];
    $password = $data['password'];
    $nombre = $data['nombre'];
    $telefono = isset($data['telefono']) ? $data['telefono'] : null;
    $direccion = isset($data['direccion']) ? $data['direccion'] : null;
    $rol = isset($data['rol']) ? $data['rol'] : 'cliente';

    if (!$email || !$password || !$nombre) {
        throw new Exception('Nombre, email y contraseña son obligatorios');
    }

    if (!preg_match('/^[\p{L}\s]+$/u', $nombre)) {
        throw new Exception('El nombre solo puede contener letras y espacios');
    }

    $pdo = get_pdo_connection();

    $checkStmt = $pdo->prepare('SELECT email FROM usuarios WHERE email = ?');
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode(['success' => false, 'mensaje' => 'El email ya existe']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$nombre, $email, $hashedPassword, $telefono, $direccion, $rol]);

    echo json_encode([
        'success' => true,
        'mensaje' => 'Usuario registrado exitosamente',
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'mensaje' => $e->getMessage(),
    ]);
}
?>
