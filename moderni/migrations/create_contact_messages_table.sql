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
