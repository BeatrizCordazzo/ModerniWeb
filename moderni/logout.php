<?php
// CORS preflight
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

session_start();

// Vaciar variables de sesión
$_SESSION = [];

// Destruir la sesión en el servidor
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}
session_destroy();

// Borrar también la cookie user_id en el cliente
setcookie('user_id', '', time() - 3600, '/');
if (isset($_COOKIE['user_id'])) {
    unset($_COOKIE['user_id']);
}

echo json_encode([
    'success' => true,
    'mensaje' => 'Sesión cerrada'
]);
exit;
?>
