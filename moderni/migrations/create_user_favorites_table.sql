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
