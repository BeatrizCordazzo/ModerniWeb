<?php

class LoginJsonView
{
    public static function sendSuccess(array $userPayload): void
    {
        echo json_encode([
            'success' => true,
            'mensaje' => 'Inicio de sesion exitoso',
            'user' => $userPayload,
        ]);
    }

    public static function sendInvalidCredentials(): void
    {
        echo json_encode([
            'success' => false,
            'mensaje' => 'Credenciales invalidas',
        ]);
    }

    public static function sendError(string $message, int $statusCode = 400): void
    {
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'mensaje' => $message,
        ]);
    }
}
