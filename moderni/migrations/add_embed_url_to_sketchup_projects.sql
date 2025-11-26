ALTER TABLE `sketchup_projects`
  ADD COLUMN IF NOT EXISTS `embed_url` VARCHAR(1024) NULL AFTER `file_original_name`;
