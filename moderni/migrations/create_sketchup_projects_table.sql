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
