<?php
require_once __DIR__ . '/conexion.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:4200');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

session_start();
$userId = null;
if (isset($_SESSION['user_id'])) $userId = intval($_SESSION['user_id']);
if (!$userId && isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) $userId = intval($_COOKIE['user_id']);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

try {
    $pdo = get_pdo_connection();
ensureFavoritesTable($pdo);

    $method = $_SERVER['REQUEST_METHOD'];
    switch ($method) {
        case 'GET':
            $favorites = fetchFavorites($pdo, $userId);
            echo json_encode(['success' => true, 'favorites' => $favorites]);
            break;
        case 'POST':
            $payload = json_decode(file_get_contents('php://input'), true);
            if (!$payload) {
                throw new Exception('Invalid JSON payload');
            }
            $favorite = saveFavorite($pdo, $userId, $payload);
            $favorites = fetchFavorites($pdo, $userId);
            echo json_encode(['success' => true, 'favorite' => $favorite, 'favorites' => $favorites]);
            break;
        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $favoriteId = null;
            if (isset($_GET['id'])) $favoriteId = intval($_GET['id']);
            if (!$favoriteId && $input && isset($input['id'])) $favoriteId = intval($input['id']);
            if (!$favoriteId && $input) {
                $favoriteId = findFavoriteId($pdo, $userId, $input);
            }
            if (!$favoriteId) {
                throw new Exception('Favorite id not provided');
            }
            $stmt = $pdo->prepare('DELETE FROM user_favorites WHERE id = ? AND user_id = ? LIMIT 1');
            $stmt->execute([$favoriteId, $userId]);
            $favorites = fetchFavorites($pdo, $userId);
            echo json_encode(['success' => true, 'favorites' => $favorites]);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function fetchFavorites(PDO $pdo, int $userId): array {
    $stmt = $pdo->prepare('SELECT id, item_type, item_id, item_slug, item_name, item_image, item_price, extra, created_at FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map(function ($row) {
        $row['item_id'] = isset($row['item_id']) ? (int) $row['item_id'] : null;
        $row['item_price'] = isset($row['item_price']) ? (float) $row['item_price'] : null;
        $row['extra'] = !empty($row['extra']) ? json_decode($row['extra'], true) : null;
        return $row;
    }, $rows);
}

function saveFavorite(PDO $pdo, int $userId, array $payload): array {
    $itemType = isset($payload['item_type']) ? trim($payload['item_type']) : 'product';
    $itemId = isset($payload['item_id']) && $payload['item_id'] !== '' ? intval($payload['item_id']) : null;
    $itemSlug = isset($payload['item_slug']) ? substr(trim($payload['item_slug']), 0, 120) : null;
    $itemName = isset($payload['item_name']) ? trim($payload['item_name']) : (isset($payload['name']) ? trim($payload['name']) : '');
    if (!$itemName) throw new Exception('Item name required');

    $itemImage = isset($payload['item_image']) ? trim($payload['item_image']) : (isset($payload['image']) ? trim($payload['image']) : null);
    $itemPrice = isset($payload['item_price']) ? floatval($payload['item_price']) : (isset($payload['price']) ? floatval($payload['price']) : null);
    $extra = isset($payload['extra']) ? json_encode($payload['extra']) : null;

    // Check if exists
    $stmt = $pdo->prepare('SELECT id FROM user_favorites WHERE user_id = :user_id AND item_type = :item_type AND ((item_id IS NULL AND :item_id IS NULL) OR item_id = :item_id) AND COALESCE(item_slug, \'\') = COALESCE(:item_slug, \'\') LIMIT 1');
    $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindValue(':item_type', $itemType, PDO::PARAM_STR);
    $stmt->bindValue(':item_id', $itemId, $itemId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindValue(':item_slug', $itemSlug, $itemSlug === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existing && isset($existing['id'])) {
        return ['id' => (int) $existing['id']];
    }

    $insert = $pdo->prepare('INSERT INTO user_favorites (user_id, item_type, item_id, item_slug, item_name, item_image, item_price, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $insert->bindValue(1, $userId, PDO::PARAM_INT);
    $insert->bindValue(2, $itemType, PDO::PARAM_STR);
    $insert->bindValue(3, $itemId, $itemId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $insert->bindValue(4, $itemSlug, $itemSlug === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $insert->bindValue(5, $itemName, PDO::PARAM_STR);
    $insert->bindValue(6, $itemImage, $itemImage === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $insert->bindValue(7, $itemPrice, $itemPrice === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $insert->bindValue(8, $extra, $extra === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $insert->execute();

    return ['id' => (int) $pdo->lastInsertId()];
}

function findFavoriteId(PDO $pdo, int $userId, array $payload): ?int {
    $itemType = isset($payload['item_type']) ? trim($payload['item_type']) : 'product';
    $itemId = isset($payload['item_id']) && $payload['item_id'] !== '' ? intval($payload['item_id']) : null;
    $itemSlug = isset($payload['item_slug']) ? substr(trim($payload['item_slug']), 0, 120) : null;

    $stmt = $pdo->prepare('SELECT id FROM user_favorites WHERE user_id = :user_id AND item_type = :item_type AND ((item_id IS NULL AND :item_id IS NULL) OR item_id = :item_id) AND COALESCE(item_slug, \'\') = COALESCE(:item_slug, \'\') LIMIT 1');
    $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindValue(':item_type', $itemType, PDO::PARAM_STR);
    $stmt->bindValue(':item_id', $itemId, $itemId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindValue(':item_slug', $itemSlug, $itemSlug === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    return $existing && isset($existing['id']) ? (int) $existing['id'] : null;
}

function ensureFavoritesTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS user_favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_type ENUM('product','service','custom') DEFAULT 'product',
        item_id INT NULL,
        item_slug VARCHAR(120) NULL,
        item_name VARCHAR(255) NOT NULL,
        item_image VARCHAR(255) NULL,
        item_price DECIMAL(12,2) NULL,
        extra JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_favorite (user_id, item_type, item_id, item_slug),
        KEY idx_user_favorites_user (user_id),
        CONSTRAINT fk_user_favorites_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $pdo->exec($sql);
}





