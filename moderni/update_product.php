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
}

header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // preflight request, respond with 200 and exit
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

// If user role is not present or not allowed, allow the update only for local/dev origins
if (!in_array($userRole, $allowed_roles, true)) {
    $isLocalOrigin = false;
    if ($origin) {
        if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
            $isLocalOrigin = true;
        }
    }
    if (!$isLocalOrigin) {
        // Log session info to help debug why the request is forbidden
        error_log('update_product.php: Forbidden request - userRole=' . var_export($userRole, true) . ' origin=' . ($origin ?? 'unknown'));
        if (isset($_SESSION['user'])) {
            error_log('update_product.php: session user=' . json_encode($_SESSION['user']));
        } else {
            error_log('update_product.php: no session user present');
        }
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden: admin role required']);
        exit;
    }
    // else: allow for local dev but include a warning in logs
    error_log('update_product.php: allowing update without role for local origin: ' . ($origin ?? 'unknown'));
}

// Read JSON input
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payload: missing id']);
    exit;
}

$productId = (int) $data['id'];

$originIsLocal = $origin && (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false);

// Map frontend keys to actual DB column names
$fieldMap = [
    'name'       => 'nombre',
    'price'      => 'precio',
    'precio'     => 'precio',
    'image'      => 'imagen_url',
    'collection' => 'coleccion',
    'description'=> 'descripcion',
    'category'   => 'categoria',
    'type'       => 'tipo_producto',
    'stock'      => 'stock',
    'inStock'    => 'en_stock',
    'style'      => 'estilo',
    'includes'   => 'incluye',
    'oldPrice'   => 'precio_anterior',
];

$allowedColumns = [
    'nombre',
    'precio',
    'precio_anterior',
    'imagen_url',
    'coleccion',
    'descripcion',
    'categoria',
    'tipo_producto',
    'stock',
    'en_stock',
    'estilo',
    'incluye',
    'dimensiones_ancho',
    'dimensiones_alto',
    'dimensiones_profundo'
];

$dimensionMap = [
    'width'  => 'dimensiones_ancho',
    'height' => 'dimensiones_alto',
    'depth'  => 'dimensiones_profundo',
];

$ignoredRelationalFields = ['colors', 'images']; // handled in related tables on a separate endpoint

$setParts = [];
$params = [];

// Build set parts dynamically based on provided data.
foreach ($data as $field => $value) {
    if ($field === 'id') {
        continue;
    }

    if (in_array($field, $ignoredRelationalFields, true)) {
        continue;
    }

    if ($field === 'dimensions' && is_array($value)) {
        foreach ($dimensionMap as $dimensionKey => $column) {
            if (!array_key_exists($dimensionKey, $value)) {
                continue;
            }
            $dimensionValue = $value[$dimensionKey];
            $paramKey = ':' . $column;

            if ($dimensionValue === null) {
                $params[$paramKey] = null;
            } else {
                $params[$paramKey] = (string) $dimensionValue;
            }

            $setParts[$column] = "`$column` = $paramKey";
        }
        continue;
    }

    $column = $fieldMap[$field] ?? $field;

    if (!in_array($column, $allowedColumns, true)) {
        continue;
    }

    if ($column === 'incluye') {
        if (is_array($value)) {
            $trimmed = array_map(static function ($item) {
                return trim((string) $item);
            }, $value);
            $value = implode('|', $trimmed);
        } elseif ($value !== null) {
            $value = trim((string) $value);
        }
    }

    if ($column === 'en_stock') {
        if ($value === null) {
            $value = null;
        } else {
            $bool = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            $value = $bool ? 1 : 0;
        }
    }

    if ($column === 'stock' && $value !== null && $value !== '') {
        $value = (int) $value;
    }

    if (in_array($column, ['precio', 'precio_anterior'], true) && $value !== null && $value !== '') {
        $value = is_numeric($value) ? (string) $value : $value;
    }

    $paramKey = ':' . $column;

    if (is_array($value) || is_object($value)) {
        $value = json_encode($value, JSON_UNESCAPED_UNICODE);
    }

    $params[$paramKey] = $value;
    $setParts[$column] = "`$column` = $paramKey";
}

if (empty($setParts)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No updatable fields provided']);
    exit;
}

$tableName = 'muebles';

try {
    $pdo = get_pdo_connection();
$sql = 'UPDATE `' . $tableName . '` SET ' . implode(', ', array_values($setParts)) . ' WHERE `id` = :id LIMIT 1';
    $stmt = $pdo->prepare($sql);
    // bind id
    $stmt->bindValue(':id', $productId, PDO::PARAM_INT);
    // bind other params
    foreach ($params as $k => $v) {
        if ($v === null) {
            $stmt->bindValue($k, null, PDO::PARAM_NULL);
        } elseif (is_int($v)) {
            $stmt->bindValue($k, $v, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($k, $v, PDO::PARAM_STR);
        }
    }
    $stmt->execute();

    // Return updated row so client can refresh state if needed
    $sel = $pdo->prepare('SELECT * FROM `' . $tableName . '` WHERE `id` = :id LIMIT 1');
    $sel->bindValue(':id', $productId, PDO::PARAM_INT);
    $sel->execute();
    $updated = $sel->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'product' => $updated]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    error_log('update_product.php error: ' . $e->getMessage());
    $errMsg = 'Server error updating product';
    // When running from a local dev origin, include detailed exception to help debugging
    if (!empty($originIsLocal)) {
        $errMsg = $e->getMessage();
    }
    echo json_encode(['success' => false, 'error' => $errMsg]);
    exit;
}
?>





