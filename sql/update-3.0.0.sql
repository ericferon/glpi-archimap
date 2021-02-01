-- -----------------------------------------------------
-- Table `glpi_plugin_archimap_configs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `glpi_plugin_archimap_configs`;
CREATE  TABLE `glpi_plugin_archimap_configs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `type` VARCHAR(45) NOT NULL ,
  `key` VARCHAR(45) NOT NULL ,
  `value` MEDIUMTEXT NULL ,
  PRIMARY KEY (`id`) ,
  UNIQUE KEY `unicity` (`type`,`key`))
 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
