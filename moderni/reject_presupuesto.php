<?php
ob_start();
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
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['presupuesto_id']) || !isset($input['motivo'])) {
        throw new Exception('presupuesto_id and motivo required');
    }

    $presupuestoId = intval($input['presupuesto_id']);
    $motivo = trim($input['motivo']);
    if ($motivo === '') {
        throw new Exception('motivo is required');
    }

    $rechazadoPor = isset($_COOKIE['user_id']) ? intval($_COOKIE['user_id']) : null;

    $pdo = get_pdo_connection();

    $stmt = $pdo->prepare("UPDATE presupuestos SET estado = 'rechazado', rechazo_motivo = ?, rechazado_por = ?, fecha_rechazo = NOW() WHERE id = ?");
    $stmt->execute([$motivo, $rechazadoPor, $presupuestoId]);

    $stmt = $pdo->prepare("SELECT pr.cliente_id, u.email, u.nombre, pr.proyecto_id FROM presupuestos pr LEFT JOIN usuarios u ON pr.cliente_id = u.id WHERE pr.id = ?");
    $stmt->execute([$presupuestoId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $clienteId = $row && isset($row['cliente_id']) ? (int) $row['cliente_id'] : null;
    $clientEmail = $row['email'] ?? null;
    $clientName = $row['nombre'] ?? '';
    $projectId = $row['proyecto_id'] ?? null;

    $mailSent = false;
    if ($clientEmail && function_exists('mail')) {
        $subject = 'Notificacion: Presupuesto rechazado';
        $body = build_rejection_message($clientName, $presupuestoId, $projectId, $motivo);
        $headers = 'From: no-reply@moderni.local' . "\r\n"
            . 'Reply-To: no-reply@moderni.local' . "\r\n"
            . 'X-Mailer: PHP/' . phpversion();
        $mailSent = @mail($clientEmail, $subject, $body, $headers);
    }

    $notificationLogged = log_rejection_notification(
        $pdo,
        $clienteId,
        $clientEmail,
        $clientName,
        $presupuestoId,
        $projectId,
        $motivo
    );

    send_json([
        'success' => true,
        'mensaje' => 'Presupuesto rechazado',
        'email_sent' => (bool) $mailSent,
        'notification_logged' => $notificationLogged,
    ]);
} catch (Throwable $e) {
    http_response_code(400);
    send_json([
        'success' => false,
        'mensaje' => $e->getMessage(),
    ]);
}

function build_rejection_message(string $name, int $presupuestoId, $projectId, string $motivo): string
{
    $greeting = trim($name) !== '' ? "Hola {$name}," : 'Hola,';
    $projectText = $projectId ? " para el proyecto ID {$projectId}" : '';

    return "{$greeting}\n\n"
        . "Tu presupuesto (ID: {$presupuestoId}){$projectText} ha sido rechazado.\n\n"
        . "Motivo:\n{$motivo}\n\n"
        . "Si necesitas mas detalles, por favor responde a este mensaje.\n\n"
        . "Equipo Moderni";
}

function log_rejection_notification(PDO $pdo, ?int $clienteId, ?string $email, string $nombre, int $presupuestoId, $projectId, string $motivo): bool
{
    try {
        ensure_contact_table($pdo);
        if (!$email && $clienteId) {
            $stmt = $pdo->prepare('SELECT email, nombre FROM usuarios WHERE id = ? LIMIT 1');
            $stmt->execute([$clienteId]);
            $userRow = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($userRow) {
                $email = $email ?: ($userRow['email'] ?? null);
                if (!$nombre && isset($userRow['nombre'])) {
                    $nombre = $userRow['nombre'];
                }
            }
        }

        if (!$email) {
            return false;
        }

        $subject = 'Presupuesto rechazado';
        $message = build_rejection_message($nombre, $presupuestoId, $projectId, $motivo);

        $stmt = $pdo->prepare('INSERT INTO contact_messages (user_id, name, email, phone, subject, message, status, admin_unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $clienteId,
            $nombre ?: 'Cliente',
            $email,
            null,
            $subject,
            $message,
            'new',
            0,
        ]);
        return true;
    } catch (Throwable $e) {
        error_log('log_rejection_notification error: ' . $e->getMessage());
        return false;
    }
}

function ensure_contact_table(PDO $pdo): void
{
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
        // Ignore errors here      
    }
}

function send_json(array $payload): void
{
    $buffer = ob_get_contents();
    if ($buffer !== false && $buffer !== '') {
        @file_put_contents(
            __DIR__ . '/reject_presupuesto.log',
            '[' . date('Y-m-d H:i:s') . "] stray output: {$buffer}\n",
            FILE_APPEND
        );
        ob_clean();
    }

    $json = json_encode($payload, get_json_options());
    if ($json === false) {
        $fallback = [
            'success' => false,
            'mensaje' => 'JSON encoding error: ' . json_last_error_msg(),
        ];
        $json = json_encode($fallback, get_json_options(false));
    }
    echo $json;
}

function get_json_options(bool $allowInvalidUtf8 = true): int
{
    $options = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    if ($allowInvalidUtf8 && defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
        $options |= JSON_INVALID_UTF8_SUBSTITUTE;
    }
    return $options;
}

?>
