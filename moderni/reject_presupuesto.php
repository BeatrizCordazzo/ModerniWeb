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
header('Content-Type: application/json');

require_once __DIR__ . '/conexion.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['presupuesto_id']) || !isset($input['motivo'])) throw new Exception('presupuesto_id and motivo required');

    $presupuesto_id = intval($input['presupuesto_id']);
    $motivo = $input['motivo'];

    // try to get user id from cookie if present
    $rechazado_por = isset($_COOKIE['user_id']) ? intval($_COOKIE['user_id']) : null;

    $pdo = get_pdo_connection();

    $stmt = $pdo->prepare("UPDATE presupuestos SET estado = 'rechazado', rechazo_motivo = ?, rechazado_por = ?, fecha_rechazo = NOW() WHERE id = ?");
    $stmt->execute([$motivo, $rechazado_por, $presupuesto_id]);

    $stmt = $pdo->prepare("SELECT pr.cliente_id, u.email, u.nombre, pr.proyecto_id FROM presupuestos pr LEFT JOIN usuarios u ON pr.cliente_id = u.id WHERE pr.id = ?");
    $stmt->execute([$presupuesto_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $mailSent = false;
    if ($row && !empty($row['email'])) {
        $to = $row['email'];
        $subject = "Notificación: Presupuesto rechazado";
        $body = "Hola " . ($row['nombre'] ?? '') . ",\n\nSu presupuesto (ID: $presupuesto_id) para el proyecto ID " . ($row['proyecto_id'] ?? '') . " ha sido rechazado.\n\nMotivo:\n" . $motivo . "\n\nSi desea más detalles, por favor responda a este correo.\n\nSaludos,\nEquipo Moderni";

        $headers = 'From: no-reply@moderni.local' . "\r\n"
            . 'Reply-To: no-reply@moderni.local' . "\r\n"
            . 'X-Mailer: PHP/' . phpversion();
        $mailSent = mail($to, $subject, $body, $headers);
    }
    echo json_encode(['success' => true, 'mensaje' => 'Presupuesto rechazado', 'email_sent' => $mailSent ?? false]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}

?>
