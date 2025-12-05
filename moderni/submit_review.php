<?php
require_once __DIR__ . '/conexion.php';
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

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
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!$payload) throw new Exception('Invalid payload');

    $orderId = isset($payload['order_id']) ? intval($payload['order_id']) : 0;
    $orderType = isset($payload['order_type']) && $payload['order_type'] === 'custom' ? 'custom' : 'pedido';
    $rating = isset($payload['rating']) ? intval($payload['rating']) : 0;
    $comment = isset($payload['comment']) ? trim($payload['comment']) : '';

    if ($orderId <= 0) throw new Exception('order_id is required');
    if ($rating < 1 || $rating > 5) throw new Exception('rating must be between 1 and 5');
    if ($comment !== '' && mb_strlen($comment) > 1000) throw new Exception('comment too long');
    $pdo = get_pdo_connection();
ensureReviewsTable($pdo);

    $statusValue = '';
    if ($orderType === 'pedido') {
        $pedidoColumns = get_table_columns($pdo, 'pedidos');
        $selectColumns = ['cliente_id'];
        if (in_array('status', $pedidoColumns, true)) $selectColumns[] = 'status';
        if (in_array('estado', $pedidoColumns, true)) $selectColumns[] = 'estado';
        $selectColumns = array_values(array_unique($selectColumns));
        $stmt = $pdo->prepare('SELECT ' . implode(', ', $selectColumns) . ' FROM pedidos WHERE id = ? LIMIT 1');
        $stmt->execute([$orderId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row || intval($row['cliente_id']) !== $userId) throw new Exception('Order not found');
        $statusSource = '';
        foreach (['status', 'estado'] as $col) {
            if (isset($row[$col]) && $row[$col] !== null && $row[$col] !== '') {
                $statusSource = $row[$col];
                break;
            }
        }
        $statusValue = normalize_status($statusSource);
    } else {
        $stmt = $pdo->prepare('
            SELECT pr.cliente_id, ps.estado 
            FROM presupuestos ps 
            JOIN proyectos pr ON ps.proyecto_id = pr.id 
            WHERE ps.id = ? LIMIT 1
        ');
        $stmt->execute([$orderId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row || intval($row['cliente_id']) !== $userId) throw new Exception('Custom project not found');
        $statusValue = normalize_status($row['estado'] ?? '');
    }

    $existing = $pdo->prepare('SELECT id, user_id FROM order_reviews WHERE order_type = ? AND order_id = ? LIMIT 1');
    $existing->execute([$orderType, $orderId]);
    $existingRow = $existing->fetch(PDO::FETCH_ASSOC);

    if ($existingRow) {
        if (intval($existingRow['user_id']) !== $userId) {
            throw new Exception('Order already reviewed');
        }
        $update = $pdo->prepare('UPDATE order_reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?');
        $update->execute([$rating, $comment, $existingRow['id']]);
    } else {
        $insert = $pdo->prepare('INSERT INTO order_reviews (user_id, order_id, order_type, rating, comment) VALUES (?, ?, ?, ?, ?)');
        $insert->execute([$userId, $orderId, $orderType, $rating, $comment]);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function ensureReviewsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS order_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT NOT NULL,
        order_type ENUM('pedido','custom') NOT NULL DEFAULT 'pedido',
        rating TINYINT NOT NULL,
        comment TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_order_review (order_type, order_id),
        INDEX idx_order_reviews_user (user_id),
        CONSTRAINT fk_order_reviews_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $pdo->exec($sql);
}

function normalize_status($raw): string {
    if (!$raw || !is_string($raw)) return '';
    $normalized = strtolower(trim($raw));
    $map = [
        'pending' => ['pending', 'pendiente', 'pending payment'],
        'processing' => ['processing', 'procesando', 'en proceso', 'in progress', 'in-progress'],
        'shipped' => ['shipped', 'enviado', 'sent'],
        'delivered' => ['delivered', 'entregado', 'entregada'],
        'done' => ['done', 'terminado', 'terminada', 'completado', 'completada', 'finished', 'finalizado', 'finalizada'],
        'approved' => ['approved', 'aprobado', 'aprobada', 'aceptado', 'aceptada', 'accepted'],
        'cancelled' => ['cancelled', 'cancelado', 'cancelada'],
    ];
    foreach ($map as $canonical => $aliases) {
        if (in_array($normalized, $aliases, true)) {
            return $canonical;
        }
    }
    return $normalized;
}

function get_table_columns(PDO $pdo, string $table): array {
    static $cache = [];
    if (isset($cache[$table])) return $cache[$table];
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
        $cache[$table] = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    } catch (Exception $e) {
        $cache[$table] = [];
    }
    return $cache[$table];
}





