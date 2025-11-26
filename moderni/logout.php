<?php
// Handle CORS preflight
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

// Expire the cookie 'user_id' on the client
setcookie('user_id', '', time() - 3600, "/");
// Also try to unset it from the $_COOKIE superglobal
if (isset($_COOKIE['user_id'])) {
    unset($_COOKIE['user_id']);
}

echo json_encode([
    'success' => true,
    'mensaje' => 'Sesión cerrada'
]);

?>
