USE moderni;

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS rol ENUM('cliente','admin','arquitecto') DEFAULT 'cliente';

ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS carpintero_estado ENUM('to-do','in progress','done') DEFAULT 'to-do';

ALTER TABLE presupuestos
ADD COLUMN IF NOT EXISTS rechazo_motivo TEXT NULL,
ADD COLUMN IF NOT EXISTS rechazado_por INT NULL,
ADD COLUMN IF NOT EXISTS fecha_rechazo TIMESTAMP NULL DEFAULT NULL;

INSERT INTO usuarios (nombre, email, password, telefono, rol)
VALUES
('Admin Usuario', 'admin@moderni.local', 'adminpass', '000000000', 'admin'),
('Arquitecto Usuario', 'arq@moderni.local', 'arqpass', '111111111', 'arquitecto');

SELECT 'Usuarios total' as Info, COUNT(*) as total FROM usuarios;
SELECT 'Presupuestos total', COUNT(*) FROM presupuestos;
SELECT 'Proyectos total', COUNT(*) FROM proyectos;
