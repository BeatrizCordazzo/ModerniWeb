<?php

require_once __DIR__ . '/../conexion.php';

class UserModel
{
    private PDO $pdo;

    public function __construct(?PDO $pdo = null)
    {
        $this->pdo = $pdo ?? get_pdo_connection();
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, nombre, email, telefono, direccion, fecha_registro, rol, password FROM usuarios WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function updatePassword(int $userId, string $hashedPassword): void
    {
        $stmt = $this->pdo->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
        $stmt->execute([$hashedPassword, $userId]);
    }
}
