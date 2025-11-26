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
