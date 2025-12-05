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

try {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!$payload || empty($payload['message_id']) || empty($payload['response'])) {
        throw new Exception('message_id and response required');
    }
    $pdo = get_pdo_connection();
ensureContactTable($pdo);

    if (!$userId || !isAdmin($pdo, $userId)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit;
    }

    $messageId = intval($payload['message_id']);
    $responseText = trim($payload['response']);

    $messageInfo = fetchContactMessage($pdo, $messageId);
    if (!$messageInfo) {
        throw new Exception('Mensaje no encontrado');
    }

    $stmt = $pdo->prepare('UPDATE contact_messages SET response = ?, response_user_id = ?, response_created_at = NOW(), status = \'responded\', admin_unread = 0 WHERE id = ?');
    $stmt->execute([$responseText, $userId, $messageId]);

    echo json_encode(['success' => true]);
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
        // ignore
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

function fetchContactMessage(PDO $pdo, int $messageId): ?array {
    $stmt = $pdo->prepare('SELECT id, user_id, email, name, subject FROM contact_messages WHERE id = ? LIMIT 1');
    $stmt->execute([$messageId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        return null;
    }
    if ((!isset($row['user_id']) || !$row['user_id']) && !empty($row['email'])) {
        $lookup = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
        $lookup->execute([$row['email']]);
        $userRow = $lookup->fetch(PDO::FETCH_ASSOC);
        if ($userRow && isset($userRow['id'])) {
            $row['user_id'] = intval($userRow['id']);
        }
    }
    return $row;
}






