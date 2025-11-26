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

try {
    $pdo = get_pdo_connection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB connection failed', 'details' => $e->getMessage()]);
    exit;
}

$createTableSql = "
CREATE TABLE IF NOT EXISTS custom_furniture_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    min_width INT,
    max_width INT,
    min_height INT,
    max_height INT,
    depth INT,
    colors_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service (service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";
$pdo->exec($createTableSql);

$method = $_SERVER['REQUEST_METHOD'];

// Helper to format DB row to API payload
$formatOption = static function (array $row): array {
    $colors = [];
    if (!empty($row['colors_json'])) {
        $decoded = json_decode($row['colors_json'], true);
        if (is_array($decoded)) {
            $colors = array_values(array_filter($decoded, static function ($item) {
                return is_array($item) && isset($item['name']);
            }));
        }
    }

    return [
        'id' => (int)$row['id'],
        'service' => $row['service'],
        'name' => $row['name'],
        'type' => $row['type'],
        'basePrice' => (float)$row['base_price'],
        'image' => $row['image_url'],
        'dimensions' => [
            'minWidth' => isset($row['min_width']) ? (int)$row['min_width'] : null,
            'maxWidth' => isset($row['max_width']) ? (int)$row['max_width'] : null,
            'minHeight' => isset($row['min_height']) ? (int)$row['min_height'] : null,
            'maxHeight' => isset($row['max_height']) ? (int)$row['max_height'] : null,
            'depth' => isset($row['depth']) ? (int)$row['depth'] : null,
        ],
        'availableColors' => $colors,
    ];
};

// Helper to read JSON body
$rawInput = file_get_contents('php://input');
$jsonInput = strlen($rawInput) ? json_decode($rawInput, true) : null;

$requiresAuth = in_array($method, ['POST', 'PUT', 'DELETE'], true);
$allowedRoles = ['admin', 'carpintero', 'arquitecto', 'superadmin'];
$allowedRolesLower = array_map('strtolower', $allowedRoles);
if ($requiresAuth) {
    session_start();
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

    if (!$userRole && $userId) {
        try {
            $userStmt = $pdo->prepare('SELECT id, nombre, email, rol FROM usuarios WHERE id = :id LIMIT 1');
            $userStmt->execute([':id' => $userId]);
            $dbUser = $userStmt->fetch();
            if ($dbUser) {
                $userRole = $dbUser['rol'] ?? null;
                $_SESSION['user_id'] = (int)$dbUser['id'];
                $_SESSION['user'] = array_merge($_SESSION['user'] ?? [], $dbUser);
            }
        } catch (Exception $authError) {
            error_log('custom_furniture_options auth lookup failed: ' . $authError->getMessage());
        }
    }

    $normalizedRole = $userRole ? strtolower((string)$userRole) : null;
    if (!$normalizedRole || !in_array($normalizedRole, $allowedRolesLower, true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden: admin role required']);
        exit;
    }
}

if ($method === 'GET') {
    $service = trim($_GET['service'] ?? '');
    if ($service === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing service parameter']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM custom_furniture_options WHERE service = :service ORDER BY id ASC');
    $stmt->execute([':service' => $service]);
    $options = array_map($formatOption, $stmt->fetchAll());

    echo json_encode(['success' => true, 'options' => $options], JSON_UNESCAPED_UNICODE);
    exit;
}

// For POST/PUT we expect JSON input
if (!is_array($jsonInput)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$service = trim($jsonInput['service'] ?? ($_GET['service'] ?? ''));
$name = trim($jsonInput['name'] ?? '');
$type = trim($jsonInput['type'] ?? '');
$basePrice = isset($jsonInput['basePrice']) ? (float)$jsonInput['basePrice'] : null;
$image = isset($jsonInput['image']) ? trim($jsonInput['image']) : null;
$minWidth = isset($jsonInput['minWidth']) ? (int)$jsonInput['minWidth'] : null;
$maxWidth = isset($jsonInput['maxWidth']) ? (int)$jsonInput['maxWidth'] : null;
$minHeight = isset($jsonInput['minHeight']) ? (int)$jsonInput['minHeight'] : null;
$maxHeight = isset($jsonInput['maxHeight']) ? (int)$jsonInput['maxHeight'] : null;
$depth = isset($jsonInput['depth']) ? (int)$jsonInput['depth'] : null;
$colorsInput = $jsonInput['availableColors'] ?? [];
$colors = [];
if (is_array($colorsInput)) {
    foreach ($colorsInput as $color) {
        if (!is_array($color)) {
            continue;
        }
        $colorName = trim($color['name'] ?? ($color['nombre'] ?? ''));
        $colorCode = trim($color['code'] ?? ($color['codigo_hex'] ?? ''));
        if ($colorName === '' && $colorCode === '') {
            continue;
        }
        if ($colorCode !== '' && $colorCode[0] !== '#') {
            $colorCode = '#' . ltrim($colorCode, '#');
        }
        $colors[] = [
            'name' => $colorName !== '' ? $colorName : ($colorCode ?: 'Color'),
            'code' => $colorCode !== '' ? $colorCode : '#C0C0C0',
        ];
    }
}
if (!$colors) {
    $colors = [
        ['name' => 'Personalizado', 'code' => '#C0C0C0'],
    ];
}

if ($service === '' || $name === '' || $type === '' || $basePrice === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$payload = [
    ':service' => $service,
    ':name' => $name,
    ':type' => $type,
    ':base_price' => $basePrice,
    ':image_url' => $image ?: null,
    ':min_width' => $minWidth,
    ':max_width' => $maxWidth,
    ':min_height' => $minHeight,
    ':max_height' => $maxHeight,
    ':depth' => $depth,
    ':colors_json' => json_encode($colors, JSON_UNESCAPED_UNICODE),
];

if ($method === 'POST') {
    try {
        $insertSql = 'INSERT INTO custom_furniture_options
            (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
            VALUES (:service, :name, :type, :base_price, :image_url, :min_width, :max_width, :min_height, :max_height, :depth, :colors_json)';
        $stmt = $pdo->prepare($insertSql);
        $stmt->execute($payload);

        $id = (int)$pdo->lastInsertId();
        $optionStmt = $pdo->prepare('SELECT * FROM custom_furniture_options WHERE id = :id');
        $optionStmt->execute([':id' => $id]);
        $option = $optionStmt->fetch();

        echo json_encode(['success' => true, 'option' => $formatOption($option)]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error creating option', 'details' => $e->getMessage()]);
        exit;
    }
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($jsonInput['id']) ? (int)$jsonInput['id'] : 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing option id']);
        exit;
    }

    $payload[':id'] = $id;

    try {
        $updateSql = 'UPDATE custom_furniture_options
            SET service = :service,
                name = :name,
                type = :type,
                base_price = :base_price,
                image_url = :image_url,
                min_width = :min_width,
                max_width = :max_width,
                min_height = :min_height,
                max_height = :max_height,
                depth = :depth,
                colors_json = :colors_json
            WHERE id = :id';
        $stmt = $pdo->prepare($updateSql);
        $stmt->execute($payload);

        $optionStmt = $pdo->prepare('SELECT * FROM custom_furniture_options WHERE id = :id');
        $optionStmt->execute([':id' => $id]);
        $option = $optionStmt->fetch();
        if (!$option) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Option not found after update']);
            exit;
        }

        echo json_encode(['success' => true, 'option' => $formatOption($option)]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error updating option', 'details' => $e->getMessage()]);
        exit;
    }
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($jsonInput['id']) ? (int)$jsonInput['id'] : 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing option id']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM custom_furniture_options WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Option not found or already deleted']);
            exit;
        }

        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error deleting option', 'details' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
exit;
?>





