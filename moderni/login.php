<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:4200');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
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
    $pdo = get_pdo_connection();

    $stmt = $pdo->prepare("SELECT id, nombre, email, telefono, fecha_registro, rol, password FROM usuarios WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $storedPassword = $row['password'] ?? '';
        $isValid = false;
        $needsUpgrade = false;

        if ($storedPassword !== '' && password_verify($password, $storedPassword)) {
            $isValid = true;
            $needsUpgrade = password_needs_rehash($storedPassword, PASSWORD_DEFAULT);
        } elseif ($storedPassword === $password) {
            $isValid = true;
            $needsUpgrade = true;
        }

        if ($isValid && $needsUpgrade) {
            $newHash = password_hash($password, PASSWORD_DEFAULT);
            $update = $pdo->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
            $update->execute([$newHash, $row['id']]);
            $row['password'] = $newHash;
        }

        if ($isValid) {
            setcookie('user_id', $row['id'], time() + (86400 * 7), "/");
            $userPayload = [
                'id' => $row['id'],
                'nombre' => $row['nombre'],
                'email' => $row['email'],
                'telefono' => $row['telefono'] ?? null,
                'fecha_registro' => $row['fecha_registro'] ?? null,
                'rol' => $row['rol'] ?? 'cliente',
            ];
            echo json_encode([
                'success' => true,
                'mensaje' => 'Inicio de sesión exitoso',
                'user' => $userPayload,
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'mensaje' => 'Credenciales inválidas',
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'mensaje' => 'Credenciales inválidas',
        ]);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'mensaje' => $e->getMessage(),
    ]);
}


