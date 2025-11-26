USE moderni;

INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES
('Cliente Uno', 'cliente1@moderni.local', 'cliente1pass', '600111111', 'cliente'),
('Cliente Dos', 'cliente2@moderni.local', 'cliente2pass', '600222222', 'cliente')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO proyectos (cliente_id, arquitecto_id, nombre, descripcion, estado, fecha_inicio, fecha_entrega)
VALUES
((SELECT id FROM usuarios WHERE email='cliente1@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Cocina Cliente1', 'Renovación completa de cocina.', 'pendiente', '2025-10-01', '2025-11-15'),
((SELECT id FROM usuarios WHERE email='cliente2@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Baño Cliente2', 'Rediseño del baño principal.', 'pendiente', '2025-10-10', '2025-11-05')
ON DUPLICATE KEY UPDATE nombre=nombre;

INSERT INTO presupuestos (cliente_id, proyecto_id, total, estado)
VALUES
((SELECT id FROM usuarios WHERE email='cliente1@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Cocina Cliente1' LIMIT 1), 12500.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente2@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Baño Cliente2' LIMIT 1), 8500.00, 'pendiente')
ON DUPLICATE KEY UPDATE total=total;

SELECT 'Seeded users' as Info, COUNT(*) FROM usuarios WHERE email IN ('cliente1@moderni.local','cliente2@moderni.local');
SELECT 'Seeded projects', COUNT(*) FROM proyectos WHERE nombre LIKE 'Proyecto % Cliente%';
SELECT 'Seeded presupuestos', COUNT(*) FROM presupuestos WHERE estado='pendiente' AND proyecto_id IN (SELECT id FROM proyectos WHERE nombre LIKE 'Proyecto % Cliente%');

INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES
('Cliente Tres', 'cliente3@moderni.local', 'cliente3pass', '600333333', 'cliente'),
('Cliente Cuatro', 'cliente4@moderni.local', 'cliente4pass', '600444444', 'cliente'),
('Cliente Cinco', 'cliente5@moderni.local', 'cliente5pass', '600555555', 'cliente'),
('Cliente Seis', 'cliente6@moderni.local', 'cliente6pass', '600666666', 'cliente'),
('Cliente Siete', 'cliente7@moderni.local', 'cliente7pass', '600777777', 'cliente'),
('Cliente Ocho', 'cliente8@moderni.local', 'cliente8pass', '600888888', 'cliente'),
('Cliente Nueve', 'cliente9@moderni.local', 'cliente9pass', '600999999', 'cliente'),
('Cliente Diez', 'cliente10@moderni.local', 'cliente10pass', '600101010', 'cliente')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO proyectos (cliente_id, arquitecto_id, nombre, descripcion, estado, fecha_inicio, fecha_entrega)
VALUES
((SELECT id FROM usuarios WHERE email='cliente3@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Living Cliente3', 'Reforma del living con nueva carpintería.', 'pendiente', '2025-10-05', '2025-11-20'),
((SELECT id FROM usuarios WHERE email='cliente4@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Dormitorio Cliente4', 'Armario empotrado y renovación.', 'pendiente', '2025-10-07', '2025-11-01'),
((SELECT id FROM usuarios WHERE email='cliente5@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Cocina Cliente5', 'Actualización de mobiliario y encimera.', 'pendiente', '2025-10-08', '2025-12-01'),
((SELECT id FROM usuarios WHERE email='cliente6@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Baño Cliente6', 'Nueva distribución y carpintería a medida.', 'pendiente', '2025-10-09', '2025-11-18'),
((SELECT id FROM usuarios WHERE email='cliente7@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Oficina Cliente7', 'Mobiliario a medida para oficina en casa.', 'pendiente', '2025-10-11', '2025-11-30'),
((SELECT id FROM usuarios WHERE email='cliente8@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Terraza Cliente8', 'Deck y cerramiento de carpintería.', 'pendiente', '2025-10-12', '2025-11-25'),
((SELECT id FROM usuarios WHERE email='cliente9@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Hall Cliente9', 'Mobiliario y revestimientos de madera.', 'pendiente', '2025-10-13', '2025-11-10'),
((SELECT id FROM usuarios WHERE email='cliente10@moderni.local' LIMIT 1), (SELECT id FROM usuarios WHERE email='arq@moderni.local' LIMIT 1), 'Proyecto Armario Cliente10', 'Vestidor a medida y carpintería completa.', 'pendiente', '2025-10-14', '2025-11-22')
ON DUPLICATE KEY UPDATE nombre=nombre;

INSERT INTO presupuestos (cliente_id, proyecto_id, total, estado)
VALUES
((SELECT id FROM usuarios WHERE email='cliente3@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Living Cliente3' LIMIT 1), 7200.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente4@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Dormitorio Cliente4' LIMIT 1), 9400.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente5@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Cocina Cliente5' LIMIT 1), 15000.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente6@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Baño Cliente6' LIMIT 1), 9800.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente7@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Oficina Cliente7' LIMIT 1), 4300.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente8@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Terraza Cliente8' LIMIT 1), 6700.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente9@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Hall Cliente9' LIMIT 1), 3800.00, 'pendiente'),
((SELECT id FROM usuarios WHERE email='cliente10@moderni.local' LIMIT 1), (SELECT id FROM proyectos WHERE nombre='Proyecto Armario Cliente10' LIMIT 1), 11200.00, 'pendiente')
ON DUPLICATE KEY UPDATE total=total;

SELECT 'Total seeded users' as Info, COUNT(*) FROM usuarios WHERE email LIKE 'cliente%@moderni.local';
SELECT 'Total seeded proyectos matching pattern', COUNT(*) FROM proyectos WHERE nombre LIKE 'Proyecto % Cliente%';
SELECT 'Total pending presupuestos', COUNT(*) FROM presupuestos WHERE estado='pendiente' AND proyecto_id IN (SELECT id FROM proyectos WHERE nombre LIKE 'Proyecto % Cliente%');
