<?php
require_once __DIR__ . '/conexion.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
if ($userId <= 0 && isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) {
    $userId = (int)$_COOKIE['user_id'];
}

if ($userId <= 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON body']);
    exit;
}

$nombre = trim((string)($payload['nombre'] ?? $payload['name'] ?? ''));
$email = trim((string)($payload['email'] ?? ''));
$telefono = trim((string)($payload['telefono'] ?? $payload['phone'] ?? ''));
$direccion = trim((string)($payload['direccion'] ?? $payload['address'] ?? ''));

if ($nombre === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name and email are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email']);
    exit;
}

try {
    $pdo = get_pdo_connection();

    $dupe = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email AND id != :id LIMIT 1');
    $dupe->execute([':email' => $email, ':id' => $userId]);
    if ($dupe->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'Email is already in use by another account']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE usuarios SET nombre = :nombre, email = :email, telefono = :telefono, direccion = :direccion WHERE id = :id');
    $stmt->execute([
        ':nombre' => $nombre,
        ':email' => $email,
        ':telefono' => $telefono !== '' ? $telefono : null,
        ':direccion' => $direccion !== '' ? $direccion : null,
        ':id' => $userId,
    ]);

    $select = $pdo->prepare('SELECT id, nombre, email, telefono, direccion, rol, fecha_registro FROM usuarios WHERE id = :id LIMIT 1');
    $select->execute([':id' => $userId]);
    $row = $select->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found after update']);
        exit;
    }

    $telefonoValue = $row['telefono'] ?? null;
    $direccionValue = $row['direccion'] ?? null;
    $fechaRegistro = $row['fecha_registro'] ?? null;

    $userResponse = [
        'id' => (int)$row['id'],
        'nombre' => $row['nombre'],
        'name' => $row['nombre'],
        'email' => $row['email'],
        'telefono' => $telefonoValue,
        'phone' => $telefonoValue,
        'direccion' => $direccionValue,
        'address' => $direccionValue,
        'rol' => $row['rol'] ?? 'cliente',
        'fecha_registro' => $fechaRegistro,
        'memberSince' => $fechaRegistro,
    ];

    $_SESSION['user_id'] = $userResponse['id'];
    $_SESSION['user'] = array_merge($_SESSION['user'] ?? [], $userResponse);

    echo json_encode(['success' => true, 'user' => $userResponse], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error', 'details' => $e->getMessage()]);
    exit;
}
