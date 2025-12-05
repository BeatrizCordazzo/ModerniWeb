<?php
require_once __DIR__ . '/conexion.php';

$allowed_origins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost',
    'http://127.0.0.1',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
} else {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
$userRole = null;
if (isset($_SESSION['user'])) {
    $userRole = $_SESSION['user']['rol'] ?? ($_SESSION['user']['role'] ?? null);
}
$allowedRoles = ['admin', 'arquitecto', 'carpintero', 'superadmin'];
if (!$userRole || !in_array(strtolower((string)$userRole), $allowedRoles, true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden']);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing image file']);
    exit;
}

$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Upload failed', 'code' => $file['error']]);
    exit;
}

$maxSize = 5 * 1024 * 1024; // 5 MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large (limit 5MB)']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

if (!isset($allowedTypes[$mimeType])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Unsupported image format']);
    exit;
}

$extension = $allowedTypes[$mimeType];
$uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'products';
if (!is_dir($uploadDir) && !@mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to create upload directory']);
    exit;
}

$uniqueName = 'product_' . bin2hex(random_bytes(8)) . '.' . $extension;
$targetPath = $uploadDir . DIRECTORY_SEPARATOR . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
    exit;
}

$relativePath = 'uploads/products/' . $uniqueName;
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$basePath = $basePath === '.' ? '' : $basePath;
$publicUrl = $scheme . '://' . $host . $basePath . '/' . $relativePath;

echo json_encode([
    'success' => true,
    'url' => $publicUrl,
    'relative' => $relativePath,
    'mime' => $mimeType,
]);
exit;
