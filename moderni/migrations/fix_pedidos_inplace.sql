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
