
-- -----------------------------------------------------
-- Table `glpi_plugin_archimap_graphs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `glpi_plugin_archimap_graphs`;
CREATE  TABLE `glpi_plugin_archimap_graphs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Internal ID' ,
  `entities_id` INT(11) NOT NULL default '0',
  `is_recursive` tinyint(1) NOT NULL default '0',
  `name` VARCHAR(45) NOT NULL COMMENT 'flow name (or code)' ,
  `plugin_archimap_graphtypes_id` INT(11) NOT NULL default '0' COMMENT 'graph type : collaboration, technical, ...' ,
  `plugin_archimap_graphstates_id` INT(11) NOT NULL default '0' COMMENT 'graph status : in progress, validated ...' ,
  `graphstatedate` DATETIME NULL COMMENT 'validity date of graph status',
  `shortdescription` VARCHAR(100) NULL ,
  `longdescription` TINYTEXT NULL ,
  `graph` MEDIUMTEXT NULL ,
  `groups_id` INT(11) NOT NULL default '0' COMMENT 'graph owner',
  `users_id` INT(11) NOT NULL default '0' COMMENT 'graph maintainer',
  `is_helpdesk_visible` int(11) NOT NULL default '1',
  `date_mod` datetime default NULL,
  `is_deleted` tinyint(1) NOT NULL default '0',
  PRIMARY KEY (`id`) ,
  KEY `entities_id` (`entities_id`),
  KEY `plugin_archimap_graphtypes_id` (`plugin_archimap_graphtypes_id`),
  KEY `plugin_archimap_graphstates_id` (`plugin_archimap_graphstates_id`),
  KEY `groups_id` (`groups_id`),
  KEY `users_id` (`users_id`),
  KEY is_helpdesk_visible (is_helpdesk_visible),
  KEY `is_deleted` (`is_deleted`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) )
 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------------------------------------------
-- Table `glpi_plugin_archimap_graphs_items`
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS `glpi_plugin_archimap_graphs_items`;
CREATE TABLE `glpi_plugin_archimap_graphs_items` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`plugin_archimap_graphs_id` int(11) NOT NULL default '0' COMMENT 'RELATION to glpi_plugin_archimap_graph (id)',
	`items_id` int(11) NOT NULL default '0' COMMENT 'RELATION to various tables, according to itemtype (id)',
   `itemtype` varchar(100) collate utf8_unicode_ci NOT NULL COMMENT 'see .class.php file',
	PRIMARY KEY  (`id`),
	UNIQUE KEY `unicity` (`plugin_archimap_graphs_id`,`items_id`,`itemtype`),
  KEY `FK_device` (`items_id`,`itemtype`),
  KEY `item` (`itemtype`,`items_id`)
)  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- -----------------------------------------------------
-- Table `glpi_plugin_archimap_profiles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `glpi_plugin_archimap_profiles`;
CREATE TABLE `glpi_plugin_archimap_profiles` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`profiles_id` int(11) NOT NULL default '0' COMMENT 'RELATION to glpi_profiles (id)',
	`archimap` char(1) collate utf8_unicode_ci default NULL,
	`open_ticket` char(1) collate utf8_unicode_ci default NULL,
	PRIMARY KEY  (`id`),
	KEY `profiles_id` (`profiles_id`)
)  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- -----------------------------------------------------
-- Table `glpi_plugin_archimap_graphtypes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `glpi_plugin_archimap_graphtypes`;
CREATE  TABLE `glpi_plugin_archimap_graphtypes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NOT NULL ,
  `comment` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `glpi_plugin_archimap_graphtype_name` (`name` ASC) )
 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- -----------------------------------------------------
-- Table `glpi_plugin_archimap_graphstates`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `glpi_plugin_archimap_graphstates`;
CREATE  TABLE `glpi_plugin_archimap_graphstates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NOT NULL ,
  `comment` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `glpi_plugin_archimap_graphstate_name` (`name` ASC) )
 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `glpi_plugin_archimap_graphstates` ( `id` , `name` , `comment` )  VALUES (1,'In Progress','In Progress');
INSERT INTO `glpi_plugin_archimap_graphstates` ( `id` , `name` , `comment` )  VALUES (2,'Validated','Validated');
INSERT INTO `glpi_plugin_archimap_graphstates` ( `id` , `name` , `comment` )  VALUES (3,'Reopened','Reopened');
INSERT INTO `glpi_plugin_archimap_graphstates` ( `id` , `name` , `comment` )  VALUES (4,'Removed','Removed');

-- -----------------------------------------------------
-- Table `glpi_plugin_archimap_graphlevels`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `glpi_plugin_archimap_graphlevels`;
CREATE  TABLE `glpi_plugin_archimap_graphlevels` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NOT NULL ,
  `comment` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `glpi_plugin_archimap_graphlevel_name` (`name` ASC) )
 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `glpi_plugin_archimap_graphlevels` ( `id` , `name` , `comment` )  VALUES (1,'High','General view');
INSERT INTO `glpi_plugin_archimap_graphlevels` ( `id` , `name` , `comment` )  VALUES (2,'Medium','Intermediate view');
INSERT INTO `glpi_plugin_archimap_graphlevels` ( `id` , `name` , `comment` )  VALUES (3,'Low','Detailed view');

INSERT INTO `glpi_displaypreferences` VALUES (NULL,'PluginArchimapGraph','2','2','0');
INSERT INTO `glpi_displaypreferences` VALUES (NULL,'PluginArchimapGraph','6','3','0');
INSERT INTO `glpi_displaypreferences` VALUES (NULL,'PluginArchimapGraph','7','4','0');
	
