-- Adds direccion column to usuarios table so we can persist billing addresses.
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

PREPARE stmt FROM @sql_add_direccion;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'OK - add_user_address executed' AS info;
