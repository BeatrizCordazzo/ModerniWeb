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
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
} else {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$logFile = __DIR__ . DIRECTORY_SEPARATOR . 'manage_users_error.log';
$logError = static function (string $message) use ($logFile): void {
    $timestamp = date('Y-m-d H:i:s');
    @file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
};

try {
    $pdo = get_pdo_connection();
} catch (Exception $e) {
    $logError('DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB connection failed', 'details' => $e->getMessage()]);
    exit;
}

session_start();
$method = $_SERVER['REQUEST_METHOD'];
$manageableRoles = ['cliente', 'arquitecto'];
$manageableRolesLower = array_map('strtolower', $manageableRoles);

/**
 * Ensure current session/cookie user is an admin.
 */
$resolveAdminRole = static function () use ($pdo, $logError) {
    $userRole = null;
    $userId = null;

    if (isset($_SESSION['user'])) {
        $user = $_SESSION['user'];
        $userRole = $user['rol'] ?? ($user['role'] ?? null);
        $userId = isset($user['id']) ? (int)$user['id'] : null;
    } elseif (isset($_SESSION['user_id'])) {
        $userId = (int)$_SESSION['user_id'];
    }

    if (!$userId && isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) {
        $userId = (int)$_COOKIE['user_id'];
    }

    if ($userId && !$userRole) {
        $stmt = $pdo->prepare('SELECT id, nombre, email, rol FROM usuarios WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $userId]);
        $row = $stmt->fetch();
        if ($row) {
            $userRole = $row['rol'] ?? null;
            $_SESSION['user_id'] = (int)$row['id'];
            $_SESSION['user'] = array_merge($_SESSION['user'] ?? [], $row);
        } else {
            $logError("Session user id {$userId} not found when resolving role");
        }
    }

    return $userRole ? strtolower((string)$userRole) : null;
};

$currentRole = $resolveAdminRole();
if ($currentRole !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden: admin role required']);
    exit;
}

$rawInput = file_get_contents('php://input');
$jsonInput = strlen($rawInput) ? json_decode($rawInput, true) : null;

if ($method === 'GET') {
    try {
        $inPlaceholder = implode(',', array_fill(0, count($manageableRoles), '?'));
        $stmt = $pdo->prepare("SELECT id, nombre, email, telefono, direccion, rol, fecha_registro FROM usuarios WHERE LOWER(rol) IN ($inPlaceholder) ORDER BY nombre ASC");
        $stmt->execute($manageableRolesLower);
        $users = $stmt->fetchAll();
        echo json_encode(['success' => true, 'users' => $users], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        $logError('GET users failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error fetching users', 'details' => $e->getMessage()]);
        exit;
    }
}

$needsJson = in_array($method, ['POST', 'PUT'], true);
if ($needsJson && !is_array($jsonInput)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$normalizeRole = static function (?string $role, array $allowed) {
    if (!$role) return null;
    $lower = strtolower(trim($role));
    return in_array($lower, $allowed, true) ? $lower : null;
};

if ($method === 'POST') {
    $nombre = trim($jsonInput['nombre'] ?? '');
    $email = trim($jsonInput['email'] ?? '');
    $telefono = trim($jsonInput['telefono'] ?? '');
    $rol = $normalizeRole($jsonInput['rol'] ?? '', $manageableRolesLower);
    $password = $jsonInput['password'] ?? '';
    $direccion = isset($jsonInput['direccion']) ? trim((string)$jsonInput['direccion']) : '';

    if ($nombre === '' || $email === '' || !$rol) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nombre, email y rol son obligatorios']);
        exit;
    }
    if ($password === '' || strlen($password) < 4) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 4 caracteres']);
        exit;
    }

    try {
        $dupe = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email LIMIT 1');
        $dupe->execute([':email' => $email]);
        if ($dupe->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Ya existe un usuario con ese email']);
            exit;
        }

        $insert = $pdo->prepare('INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol, fecha_registro) VALUES (:nombre, :email, :password, :telefono, :direccion, :rol, NOW())');
        $insert->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':password' => $password,
            ':telefono' => $telefono ?: null,
            ':direccion' => $direccion !== '' ? $direccion : null,
            ':rol' => $rol,
        ]);
        $id = (int)$pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT id, nombre, email, telefono, direccion, rol, fecha_registro FROM usuarios WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $newUser = $stmt->fetch();

        echo json_encode(['success' => true, 'user' => $newUser], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        $logError('POST user failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error creando usuario', 'details' => $e->getMessage()]);
        exit;
    }
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($jsonInput['id']) ? (int)$jsonInput['id'] : 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID de usuario requerido']);
        exit;
    }

    $fields = [];
    $params = [':id' => $id];

    if (isset($jsonInput['nombre'])) {
        $fields[] = 'nombre = :nombre';
        $params[':nombre'] = trim((string)$jsonInput['nombre']);
    }
    if (isset($jsonInput['email'])) {
        $email = trim((string)$jsonInput['email']);
        if ($email === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'El email no puede estar vacío']);
            exit;
        }
        $dupe = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email AND id != :id LIMIT 1');
        $dupe->execute([':email' => $email, ':id' => $id]);
        if ($dupe->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Ya existe otro usuario con ese email']);
            exit;
        }
        $fields[] = 'email = :email';
        $params[':email'] = $email;
    }
    if (array_key_exists('telefono', $jsonInput)) {
        $fields[] = 'telefono = :telefono';
        $telefono = trim((string)$jsonInput['telefono']);
        $params[':telefono'] = $telefono !== '' ? $telefono : null;
    }
    if (array_key_exists('direccion', $jsonInput)) {
        $fields[] = 'direccion = :direccion';
        $direccion = trim((string)$jsonInput['direccion']);
        $params[':direccion'] = $direccion !== '' ? $direccion : null;
    }
    if (isset($jsonInput['rol'])) {
        $role = $normalizeRole($jsonInput['rol'], $manageableRolesLower);
        if (!$role) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Rol no válido']);
            exit;
        }
        $fields[] = 'rol = :rol';
        $params[':rol'] = $role;
    }
    if (isset($jsonInput['password']) && $jsonInput['password'] !== '') {
        $password = (string)$jsonInput['password'];
        if (strlen($password) < 4) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 4 caracteres']);
            exit;
        }
        $fields[] = 'password = :password';
        $params[':password'] = $password;
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No hay cambios para guardar']);
        exit;
    }

    try {
        $sql = 'UPDATE usuarios SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $select = $pdo->prepare('SELECT id, nombre, email, telefono, rol, fecha_registro FROM usuarios WHERE id = :id LIMIT 1');
        $select->execute([':id' => $id]);
        $updated = $select->fetch();
        if (!$updated) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado después de actualizar']);
            exit;
        }

        echo json_encode(['success' => true, 'user' => $updated], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        $logError('PUT user failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error actualizando usuario', 'details' => $e->getMessage()]);
        exit;
    }
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($jsonInput['id']) ? (int)$jsonInput['id'] : 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID de usuario requerido']);
        exit;
    }

    try {
        $check = $pdo->prepare('SELECT rol FROM usuarios WHERE id = :id LIMIT 1');
        $check->execute([':id' => $id]);
        $row = $check->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
            exit;
        }
        $normalizedRole = strtolower((string)$row['rol']);
        if (!in_array($normalizedRole, $manageableRolesLower, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Solo se pueden eliminar clientes o arquitectos']);
            exit;
        }

        $pdo->beginTransaction();

        // Nullify contact message references regardless of role
        $nullifyContactUser = $pdo->prepare('UPDATE contact_messages SET user_id = NULL WHERE user_id = :id');
        $nullifyContactUser->execute([':id' => $id]);
        $nullifyContactResponder = $pdo->prepare('UPDATE contact_messages SET response_user_id = NULL WHERE response_user_id = :id');
        $nullifyContactResponder->execute([':id' => $id]);

        if ($normalizedRole === 'cliente') {
            $projectStmt = $pdo->prepare('SELECT id FROM `proyectos` WHERE cliente_id = :id');
            $projectStmt->execute([':id' => $id]);
            $projectIds = $projectStmt->fetchAll(PDO::FETCH_COLUMN);

            $clientCleanupStatements = [
                'DELETE FROM `reseñas` WHERE cliente_id = :id',
                'DELETE FROM order_reviews WHERE user_id = :id',
                'DELETE FROM user_favorites WHERE user_id = :id',
                'DELETE FROM presupuestos WHERE cliente_id = :id',
            ];
            foreach ($clientCleanupStatements as $sql) {
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':id' => $id]);
            }

            if (!empty($projectIds)) {
                $placeholders = implode(',', array_fill(0, count($projectIds), '?'));
                $deleteProjectReviews = $pdo->prepare("DELETE FROM `reseñas` WHERE proyecto_id IN ($placeholders)");
                $deleteProjectReviews->execute($projectIds);
                $deleteProjectBudgets = $pdo->prepare("DELETE FROM presupuestos WHERE proyecto_id IN ($placeholders)");
                $deleteProjectBudgets->execute($projectIds);
            }

            $deleteProjects = $pdo->prepare('DELETE FROM `proyectos` WHERE cliente_id = :id');
            $deleteProjects->execute([':id' => $id]);
        } elseif ($normalizedRole === 'arquitecto') {
            $dropArchitect = $pdo->prepare('UPDATE `proyectos` SET arquitecto_id = NULL WHERE arquitecto_id = :id');
            $dropArchitect->execute([':id' => $id]);
        }

        $stmt = $pdo->prepare('DELETE FROM usuarios WHERE id = :id');
        $stmt->execute([':id' => $id]);

        $pdo->commit();

        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $logError('DELETE user failed (id ' . $id . '): ' . $e->getMessage());
        if ($e instanceof PDOException && (int)$e->getCode() === 23000) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'No se puede eliminar este usuario porque tiene registros asociados.']);
            exit;
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error eliminando usuario', 'details' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
exit;
?>



