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

session_start();
$userId = null;
if (isset($_SESSION['user_id'])) $userId = intval($_SESSION['user_id']);
if (!$userId && isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) $userId = intval($_COOKIE['user_id']);

try {
    $pdo = get_pdo_connection();
ensureContactTable($pdo);

    if (!$userId || !isAdmin($pdo, $userId)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit;
    }

    $stmt = $pdo->query("SELECT cm.*, u.nombre AS user_nombre
        FROM contact_messages cm
        LEFT JOIN usuarios u ON cm.user_id = u.id
        ORDER BY cm.created_at DESC");
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $unreadCount = 0;
    foreach ($messages as &$msg) {
        if (isset($msg['id'])) $msg['id'] = (int) $msg['id'];
        if (isset($msg['user_id'])) $msg['user_id'] = $msg['user_id'] !== null ? (int) $msg['user_id'] : null;
        if (isset($msg['response_user_id'])) $msg['response_user_id'] = $msg['response_user_id'] !== null ? (int) $msg['response_user_id'] : null;
        if (isset($msg['admin_unread'])) {
            $msg['admin_unread'] = (int) $msg['admin_unread'];
            if ($msg['admin_unread'] === 1) {
                $unreadCount++;
            }
        } else {
            $msg['admin_unread'] = 0;
        }
    }
    echo json_encode(['success' => true, 'messages' => $messages, 'unread_count' => $unreadCount]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function ensureContactTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(80) NULL,
        subject VARCHAR(255) NULL,
        message TEXT NOT NULL,
        status ENUM('new','read','responded','closed') DEFAULT 'new',
        admin_unread TINYINT(1) NOT NULL DEFAULT 1,
        response TEXT NULL,
        response_user_id INT NULL,
        response_created_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_contact_messages_user (user_id),
        INDEX idx_contact_messages_status (status),
        CONSTRAINT fk_cm_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        CONSTRAINT fk_cm_response_user FOREIGN KEY (response_user_id) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $pdo->exec($sql);
    try {
        $check = $pdo->query("SHOW COLUMNS FROM contact_messages LIKE 'admin_unread'");
        $exists = $check && $check->fetch(PDO::FETCH_ASSOC);
        if (!$exists) {
            $pdo->exec("ALTER TABLE contact_messages ADD COLUMN admin_unread TINYINT(1) NOT NULL DEFAULT 1 AFTER status");
        }
    } catch (Exception $e) {
        // ignore failures
    }
}

function isAdmin(PDO $pdo, int $userId): bool {
    $stmt = $pdo->prepare('SELECT rol FROM usuarios WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return false;
    $role = isset($row['rol']) ? strtolower(trim($row['rol'])) : '';
    return in_array($role, ['admin', 'arquitecto'], true);
}





