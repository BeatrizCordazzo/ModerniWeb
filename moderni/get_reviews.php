<?php
require_once __DIR__ . '/conexion.php';
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    $pdo = get_pdo_connection();
ensureReviewsTable($pdo);

    $stmt = $pdo->query('
        SELECT 
            r.id,
            r.order_id,
            r.order_type,
            r.rating,
            r.comment,
            r.created_at,
            u.nombre AS user_name
        FROM order_reviews r
        LEFT JOIN usuarios u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    ');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $reviews = [];
    foreach ($rows as $row) {
        $reviews[] = [
            'id' => (int) $row['id'],
            'order_id' => (int) $row['order_id'],
            'order_type' => $row['order_type'],
            'rating' => (int) $row['rating'],
            'comment' => $row['comment'] ?? '',
            'created_at' => $row['created_at'],
            'user_name' => $row['user_name'] ?? 'Cliente Moderni'
        ];
    }

    echo json_encode(['success' => true, 'reviews' => $reviews]);
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





