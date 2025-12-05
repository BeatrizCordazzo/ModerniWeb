<?php

require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../views/LoginJsonView.php';

class LoginController
{
    public function __construct(private UserModel $userModel)
    {
    }

    public function handle(array $payload): void
    {
        if (!$this->isValidPayload($payload)) {
            LoginJsonView::sendError('Datos incompletos');
            return;
        }

        $user = $this->userModel->findByEmail($payload['email']);

        if (!$user || !$this->authenticateUser($payload['password'], $user)) {
            LoginJsonView::sendInvalidCredentials();
            return;
        }

        setcookie('user_id', $user['id'], time() + (86400 * 7), '/');
        LoginJsonView::sendSuccess($this->buildUserPayload($user));
    }

    private function isValidPayload(array $payload): bool
    {
        return isset($payload['email'], $payload['password'])
            && trim($payload['email']) !== ''
            && trim($payload['password']) !== '';
    }

    private function authenticateUser(string $plainPassword, array $user): bool
    {
        $storedPassword = $user['password'] ?? '';
        $isValid = false;
        $needsUpgrade = false;

        if ($storedPassword !== '' && password_verify($plainPassword, $storedPassword)) {
            $isValid = true;
            $needsUpgrade = password_needs_rehash($storedPassword, PASSWORD_DEFAULT);
        } elseif ($storedPassword === $plainPassword) {
            $isValid = true;
            $needsUpgrade = true;
        }

        if ($isValid && $needsUpgrade) {
            $newHash = password_hash($plainPassword, PASSWORD_DEFAULT);
            $this->userModel->updatePassword((int) $user['id'], $newHash);
        }

        return $isValid;
    }

    private function buildUserPayload(array $user): array
    {
        $telefono = $user['telefono'] ?? null;
        $direccion = $user['direccion'] ?? null;
        $fechaRegistro = $user['fecha_registro'] ?? null;

        return [
            'id' => (int)$user['id'],
            'nombre' => $user['nombre'],
            'name' => $user['nombre'],
            'email' => $user['email'],
            'telefono' => $telefono,
            'phone' => $telefono,
            'direccion' => $direccion,
            'address' => $direccion,
            'fecha_registro' => $fechaRegistro,
            'memberSince' => $fechaRegistro,
            'rol' => $user['rol'] ?? 'cliente',
        ];
    }
}
