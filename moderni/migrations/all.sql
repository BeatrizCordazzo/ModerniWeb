USE moderni;

ALTER TABLE `sketchup_projects`
  ADD COLUMN IF NOT EXISTS `embed_url` VARCHAR(1024) NULL AFTER `file_original_name`;

ALTER TABLE presupuestos
ADD COLUMN IF NOT EXISTS estimated_total DECIMAL(12,2) NULL AFTER total;

UPDATE presupuestos
SET estimated_total = total
WHERE estimated_total IS NULL;

SELECT 'estimated_total column ready' AS info;

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

USE moderni;

CREATE TABLE IF NOT EXISTS architect_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  architect_id INT NOT NULL,
  project_title VARCHAR(255) NULL,
  project_notes TEXT NOT NULL,
  file_path VARCHAR(255) NULL,
  file_original_name VARCHAR(255) NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  admin_comment TEXT NULL,
  decided_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_architect_projects_architect (architect_id),
  KEY idx_architect_projects_status (status),
  CONSTRAINT fk_architect_projects_user FOREIGN KEY (architect_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

SELECT 'architect_projects table ready' AS info;

USE moderni;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(80) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  status ENUM('new','read','responded','closed') DEFAULT 'new',
  response TEXT NULL,
  response_user_id INT NULL,
  response_created_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_messages_user (user_id),
  INDEX idx_contact_messages_status (status),
  CONSTRAINT fk_contact_messages_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_messages_response_user FOREIGN KEY (response_user_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'contact_messages table ready' AS info;

CREATE TABLE IF NOT EXISTS custom_furniture_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    min_width INT,
    max_width INT,
    min_height INT,
    max_height INT,
    depth INT,
    colors_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service (service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

USE moderni;

CREATE TABLE IF NOT EXISTS order_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  order_type ENUM('pedido','custom') NOT NULL DEFAULT 'pedido',
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_order_review (order_type, order_id),
  INDEX idx_order_reviews_user (user_id),
  CONSTRAINT fk_order_reviews_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'order_reviews table ready' AS info;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT DEFAULT NULL,
  order_name VARCHAR(255) DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  items TEXT DEFAULT NULL, 
  total DECIMAL(12,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'pendiente',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  mueble_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(12,2) DEFAULT NULL,
  extra JSON DEFAULT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (mueble_id) REFERENCES muebles(id) ON DELETE SET NULL
);

SET @idx_name = 'idx_pedidos_cliente';
SELECT COUNT(*) INTO @exists_idx FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'pedidos' AND index_name = @idx_name;
SET @sql = IF(@exists_idx = 0, 'ALTER TABLE `pedidos` ADD INDEX `idx_pedidos_cliente` (`cliente_id`);', 'SELECT "idx_pedidos_cliente_already_exists"');
PREPARE stmt_idx FROM @sql; EXECUTE stmt_idx; DEALLOCATE PREPARE stmt_idx;

SET @idx_name2 = 'idx_pedido_items_pedido';
SELECT COUNT(*) INTO @exists_idx2 FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'pedido_items' AND index_name = @idx_name2;
SET @sql2 = IF(@exists_idx2 = 0, 'ALTER TABLE `pedido_items` ADD INDEX `idx_pedido_items_pedido` (`pedido_id`);', 'SELECT "idx_pedido_items_pedido_already_exists"');
PREPARE stmt_idx2 FROM @sql2; EXECUTE stmt_idx2; DEALLOCATE PREPARE stmt_idx2;

CREATE TABLE IF NOT EXISTS `sketchup_projects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `title` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_original_name` VARCHAR(255) NULL,
  `embed_url` VARCHAR(1024) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sketchup_admin` (`admin_id`),
  CONSTRAINT `fk_sketchup_admin` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE moderni;

CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('product','service','custom') DEFAULT 'product',
  item_id INT NULL,
  item_slug VARCHAR(120) NULL,
  item_name VARCHAR(255) NOT NULL,
  item_image VARCHAR(255) NULL,
  item_price DECIMAL(12,2) NULL,
  extra JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_favorite (user_id, item_type, item_id, item_slug),
  KEY idx_user_favorites_user (user_id),
  CONSTRAINT fk_user_favorites_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

SELECT 'user_favorites table ready' AS info;

USE Moderni;

ALTER TABLE pedidos
  MODIFY cliente_id INT DEFAULT NULL;

SET @fk_name = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'pedidos'
    AND COLUMN_NAME = 'cliente_id'
    AND REFERENCED_TABLE_NAME = 'usuarios'
  LIMIT 1
);

SELECT CONCAT('Found FK: ', @fk_name) AS debug_found_fk;

SET @drop_sql = IF(@fk_name IS NOT NULL,
  CONCAT('ALTER TABLE `pedidos` DROP FOREIGN KEY `', @fk_name, '`;'),
  'SELECT "no_fk_to_drop";'
);

PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'pedidos'
    AND COLUMN_NAME = 'cliente_id'
    AND REFERENCED_TABLE_NAME = 'usuarios'
);

SELECT CONCAT('FK exist count: ', @exists) AS debug_fk_exists;

SET @add_sql = IF(@exists = 0,
  'ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL;',
  'SELECT "fk_already_present";'
);

PREPARE stmt2 FROM @add_sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  mueble_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(12,2) DEFAULT NULL,
  extra JSON DEFAULT NULL,
  
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (mueble_id) REFERENCES muebles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);

SELECT 'OK - fix_pedidos_inplace.sql executed' AS info;

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('bathroom', 'Bathroom Vanity', 'storage', 599.95, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop', 60, 180, 80, 90, 50,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Gray","code":"#808080"},{"name":"Black","code":"#000000"}]'),
  ('bathroom', 'Bathroom Mirror', 'accessory', 199.95, 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop', 50, 150, 60, 120, 5,
    '[{"name":"Chrome Frame","code":"#C0C0C0"},{"name":"Black Frame","code":"#000000"},{"name":"Gold Frame","code":"#FFD700"},{"name":"Frameless","code":"#FFFFFF"}]'),
  ('bathroom', 'Storage Cabinet', 'storage', 399.95, 'https://images.unsplash.com/photo-1595516695946-e22a04b82d70?w=400&h=400&fit=crop', 40, 80, 120, 200, 30,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Gray","code":"#808080"},{"name":"Walnut","code":"#5C4033"}]'),
  ('bathroom', 'Shower Enclosure', 'fixture', 899.95, 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop', 80, 120, 180, 200, 80,
    '[{"name":"Clear Glass","code":"#E8F4F8"},{"name":"Frosted Glass","code":"#F0F0F0"},{"name":"Black Frame","code":"#000000"},{"name":"Chrome Frame","code":"#C0C0C0"}]'),
  ('bathroom', 'Bathtub', 'fixture', 1299.95, 'https://images.unsplash.com/photo-1564540583246-934409427776?w=400&h=400&fit=crop', 140, 180, 50, 65, 70,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Matte Black","code":"#1C1C1C"},{"name":"Cream","code":"#FFFDD0"}]'),
  ('bathroom', 'Heated Towel Rack', 'accessory', 299.95, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop', 50, 80, 80, 120, 15,
    '[{"name":"Chrome","code":"#C0C0C0"},{"name":"Brushed Nickel","code":"#B8B8B8"},{"name":"Matte Black","code":"#1C1C1C"},{"name":"Brass","code":"#B5A642"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('kitchen', 'Base Cabinet', 'cabinet', 299.95, 'https://images.unsplash.com/photo-1595514535116-02876df50c56?w=400&h=400&fit=crop', 30, 120, 70, 90, 60,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Upper Cabinet', 'cabinet', 249.95, 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop', 30, 120, 50, 90, 35,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Countertop', 'surface', 149.95, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop', 60, 300, 3, 5, 60,
    '[{"name":"Granite Black","code":"#1C1C1C"},{"name":"Marble White","code":"#F5F5F5"},{"name":"Quartz Gray","code":"#808080"},{"name":"Butcher Block","code":"#D2691E"}]'),
  ('kitchen', 'Kitchen Island', 'furniture', 899.95, 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=400&fit=crop', 100, 200, 85, 95, 80,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Navy","code":"#001F3F"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Tall Pantry', 'storage', 599.95, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop', 60, 100, 200, 240, 60,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Open Shelving Unit', 'storage', 199.95, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop', 60, 150, 30, 50, 30,
    '[{"name":"Natural Wood","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Black Metal","code":"#1C1C1C"},{"name":"Walnut","code":"#5C4033"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('livingroom', 'Sofa', 'seating', 1299.95, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', 180, 280, 80, 100, 90,
    '[{"name":"Gray","code":"#808080"},{"name":"Beige","code":"#F5F5DC"},{"name":"Navy","code":"#000080"},{"name":"Charcoal","code":"#36454F"}]'),
  ('livingroom', 'Coffee Table', 'table', 399.95, 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop', 100, 150, 40, 50, 60,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('livingroom', 'TV Entertainment Unit', 'storage', 899.95, 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop', 150, 250, 50, 70, 45,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White Gloss","code":"#FFFFFF"},{"name":"Gray","code":"#808080"}]'),
  ('livingroom', 'Bookshelf', 'storage', 699.95, 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop', 80, 180, 180, 240, 35,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('livingroom', 'Side Table', 'table', 249.95, 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop', 40, 60, 50, 65, 40,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Marble Top","code":"#E8F4F8"}]'),
  ('livingroom', 'Accent Chair', 'seating', 549.95, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop', 60, 80, 80, 100, 70,
    '[{"name":"Velvet Blue","code":"#4169E1"},{"name":"Gray Fabric","code":"#A9A9A9"},{"name":"Beige Linen","code":"#F5F5DC"},{"name":"Emerald Green","code":"#50C878"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('bedroom', 'Bed Frame', 'furniture', 899.95, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop', 140, 200, 40, 150, 210,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Gray","code":"#808080"}]'),
  ('bedroom', 'Nightstand', 'furniture', 249.95, 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop', 40, 60, 50, 70, 40,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('bedroom', 'Dresser', 'storage', 699.95, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop', 100, 180, 80, 120, 50,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Gray","code":"#808080"}]'),
  ('bedroom', 'Wardrobe', 'storage', 1299.95, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 100, 250, 180, 240, 60,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Mirrored","code":"#E8F4F8"}]'),
  ('bedroom', 'Bedroom Bench', 'furniture', 349.95, 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop', 100, 150, 40, 50, 40,
    '[{"name":"Fabric Gray","code":"#A9A9A9"},{"name":"Fabric Beige","code":"#F5F5DC"},{"name":"Leather Brown","code":"#654321"},{"name":"Velvet Navy","code":"#001F3F"}]'),
  ('bedroom', 'Vanity Table', 'furniture', 499.95, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop', 80, 120, 75, 80, 45,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Gold Accent","code":"#FFD700"},{"name":"Black","code":"#000000"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('others', 'Entry Console', 'storage', 449.95, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=400&fit=crop', 90, 140, 75, 90, 35,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Matte Black","code":"#1C1C1C"}]'),
  ('others', 'Accent Cabinet', 'storage', 799.95, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=400&fit=crop', 80, 140, 90, 120, 45,
    '[{"name":"Indigo","code":"#264653"},{"name":"Mustard","code":"#E9C46A"},{"name":"Forest","code":"#2A9D8F"},{"name":"Charcoal","code":"#333333"}]'),
  ('others', 'Wall Shelf Set', 'storage', 199.95, 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=400&h=400&fit=crop', 40, 120, 20, 40, 20,
    '[{"name":"Natural Wood","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('others', 'Reading Chair', 'seating', 599.95, 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop', 70, 90, 90, 110, 75,
    '[{"name":"Teal","code":"#008080"},{"name":"Rust","code":"#B7410E"},{"name":"Cream","code":"#FFFDD0"},{"name":"Gray","code":"#808080"}]'),
  ('others', 'Floor Lamp', 'lighting', 249.95, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop', 30, 40, 150, 180, 30,
    '[{"name":"Brass","code":"#B5A642"},{"name":"Matte Black","code":"#1C1C1C"},{"name":"White Shade","code":"#FFFFFF"},{"name":"Bronze","code":"#8C7853"}]'),
  ('others', 'Workspace Desk', 'furniture', 549.95, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop', 120, 180, 75, 80, 70,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Graphite","code":"#4B4B4B"}]');

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

-- Add direccion column to usuarios table if it's missing
SET @has_direccion := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'usuarios'
    AND COLUMN_NAME = 'direccion'
);

SET @sql_add_direccion := IF(
  @has_direccion = 0,
  'ALTER TABLE `usuarios` ADD COLUMN `direccion` VARCHAR(255) NULL AFTER `telefono`;',
  'SELECT "direccion_already_exists"'
);

PREPARE stmt_direccion FROM @sql_add_direccion;
EXECUTE stmt_direccion;
DEALLOCATE PREPARE stmt_direccion;
