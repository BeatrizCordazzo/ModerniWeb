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
