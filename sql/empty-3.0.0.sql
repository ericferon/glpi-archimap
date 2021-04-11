
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

INSERT INTO `glpi_plugin_archimap_configs` ( `type` , `key` , `value` )  VALUES ('LIBS','','archimate3;bpmn;uml'); 
INSERT INTO `glpi_plugin_archimap_configs` ( `type` , `key` , `value` )  VALUES ('LIBXML','Glpi','<mxlibrary>[{"xml":"rVbbauMwEP0ak92HDa5NWfqYuN2+dGEhC/toFHkSq8iSK8m5/P2OLk6s5uZAAwHrzJy5aTRSkhfN7lWRtv4tK+BJ/pLkhZLS+K9mVwDnSZayKsmfkyxL8Z9kvy5IH5w0bYkCYcYQMk/YEN6BRzygzZ4HoDYNhvX8kORz2RnOBBRSCKDWforgtmYGFi2hVn+LmSC2YpwXkkvlTORPTyv8Ia5r0lq1Zre2KU+JojVriIF8StqWM0oMkwIVcfV371SpbKxFpxkg/dFhggiG4EEZ2F0sgINC9q8gGzBqjypbVpk6aDz6IqU1sHUdaD8fPUa0X68P1GM5Z0qRvasWCMq4V+xzW/OW+ayCoc5ImwwHA8YngoI3SQlffPAzOmTZb4E1Vba8WzNRukLobam3VlEKzFOfkqnkXSNC6II0kGQFqlSgqWKtK7IDnOWGiG5FqOkUKD312p8NvksmjAspGOWwMqhj8d7O5QhtvhhlKsfqTrFBsXWtp1v6enrDVulsjQtUG2zGsZFe8+wNlXek4Qg+7zO1jfZodHwR6ySYeN8vedad7eF7vB4YJx4PkoveLtutlmMjQM0v6h+0VN4fKR6/WjA6uuGD+lf1fDDnAj97jKPhcNOTnwd2DmZpmCQ3OdGc8dR49IyaAUPPbmLe9uwP0ZDooMGwuxY2hw3wnhgWo4h9eWPHqnNnq2wJ3jTXx62nDCUDwvHURPYDOipEeySG5Go5inZozYgLm9IJ8IJf7097TKoKFO61AcXIXU322RInSwi36gQvXfzP4xLNEUq/9dtm5eHbCX4EzPeOg5J8FsDQF/PJ98mZ61NryokOR2Sy+Ff0oZZv1kHsKZ8PFSKPp6Lg96Roy3f/pELRH1eoma/T4lim+EFCO21QomSL7x8GevgwwY/w1OuXxyelk0Uvzv8=","w":150,"h":75,"aspect":"fixed","title":"Appli"},{"xml":"7VZNb6MwEP01iPYSUVBXe21I2ktWu1L2HhkzBbcGU9tswv76HX9QSJMWstrLSpWIMh6/Z78Zjz+CJK0OD5I05TeRAw+SdZCkUgjtrOqQAudBHLE8SFZBHEf4C+L7d3pvbG/UEAm1nkOIHeEX4S04j3Mo3XHvUCVpjEk7zuocZBIky33JNGwbQk3HHtWjr9QVyl/doJmJFpH5Jnt1EPpcSOP93mocBrxfsd/WvEXbKwGp4fBuNNblQ3kAUYGWHUL2LNelQ3xxAUclsKL0rK/eR5RrF6/MITV3UpLORg41ZdwBq0NhlmZR8IYt8syP0mpBRdVw0KC7xqdpIyjh2xd+BkOyPpdmnF3D24LVu5xgB1GgBuuUSwVvq9rLrkkFp5AnwWpt5/AwDo8aMcaPfx9PafTjtJGYhqrFx6PssKaw2oyEOZMuLPwSrZRoKIRk/0DwMNR81QPHSj+7DEfLNaXOLacpyjhydnoJJQdFJWs0M6mYYLqMj9m2cKdoo5DHXKXRf5oBTjLg/SEShVdhEC/dNMvQ5vjOuLHl+cvwOjxT8UpRTpTPYbjyUnYj4luKyJ6A+q3+w8bSs1Rv+FPtxevbrjfr9OeMCnLVEaczoP/7ckaPUlTTcV64aT8PmL89YKJ9CdKsy9XMMuLsGdwOu8XPbLlrW7zuG99/tFUa944UDd62zN07R5dgD5SgWq7V+J5Ew6H6ln9T9M3h7WL7jp42fwA=","w":60,"h":80,"aspect":"fixed","title":"DB"},{"xml":"xVTBbuMgEP0aK+3ForainmMn6aWrSnUve4oImdh0wTiA1/Hf72DwJqmTqIeVVooDvHkzzDwYojSXxxdNm+qH2oGI0lWU5lop62fymIMQUUL4LkqXUZIQ/KJkfcP6NFhJQzXU9jsOiXf4TUULHvGAsb0IQGUlprV8itJMtVbwGnJV18BcfIJgV3ELRUOZ43dYCWJ7LkSuhNJDiHSxXq8XmEJmKto4mjyWruSYalZxSS2kMW0awRm1XNVIxNVHP1BNb4rOIY46YocWK0QwZA/awvGmAgMUyn8BJcHqHikd39kqMOZeJVIBL6vg9jz3GDV+Xf51Pem50Jr2g1xQMy48cSyuFA2PMX0LcmO6EKy1iinZCLBgfTFoeFWMiuIgrnDodjwHF25j1N52WJuZUpkSraxDsjWVMKV8Kl7bIWSgCdhb5Dgch4sd8CigVJq7rYi6Y47xLuEtc/EuKSaekjeOfDWti/S/xPHVuJNIiJ/nd/I5Zwe4n26q9A4003h3Nad3dv3qJ+gWwkHP0PSAf9lpl2z2OLuy1/bT9wuaihA/9NkhxCpWr6v8YyqhF3da778Rhey1kpPQCPyfi0G6Cpwy5OF6rYL/cgMqjL05d/I/Duq439v7cvWOY/bzllTnzcxaY/FwtGrw7eC+nS46eiSieyusOW96nHjWuAqv6rg8vd6D7eJx/wM=","w":150,"h":75,"aspect":"fixed","title":"System Sw"},{"xml":"7VZLc5swEP41DPjCEJikZ5uY9JC209ozPXpkrIASCRFJ1Pa/764kHJvHTI859GAD33770q5WCrJcnJ4Uaetv8kB5kK2DLFdSGvcmTjnlPEgTdgiyxyBNE/gFaTEjvbPSpCWKNuZfFFKn8IfwjjrEAdqcuQdqIyCsx7sgW8nOcNbQXDYNLdF+AuCxZoZuWlIi/wiZAPbCOM8ll8qayJZFUSwhhJWuSYs0caow5ZiosmaCGJrFpG05K4lhsgEifG3PltrAsiCATA/p9w4SBNAHT5Whp9kFsJDP/olKQY06A+XIDqb2jHu3SElNWVV7tS/3DiPafVcX1Y/lXCpFzna1aFMy7oh9bhVvWVxK0XaGKm+rMxIRTg01LhcQPMuS8M07n+CQfV8FtLbrrekxtZS8E42PtSGCjimvkjXGmvQ0Tl8McBCHh/WgDRQDzCfyAl2cxk64g96BrkIL1zqxhSdM9vqY8MXy2PgNbeTjRjrrChpR6J1sqYI+aip91gjcZDNNiR0853Xe44SvG3djRwMXM/EMARvaZEFvCj+I2vUBtnCauPd8YjWvWbYrPcvX9VpsoV4+CvqaORCOg+dkT/2OCUEUwd/Km1+Fi3Ciw7UuOdE+0zD3OeyuFIcqcv/q5hSI8tmdCCPtzXEiTD/WFIdNFG6ogtESLoL0oTI4bWDeLYKsiMLaGJhyS5wDaQEJCix4IZSp4KEUlKrAqKJosAoX079Zc5BHPbYdCinitgbrxWa7/LX9bidv+kAEjlX3bwU/QXAYCHS3FwzTfZIDSQjRhrXUxttGx6vw64/NFtgYKpZugSS/8Prd12azfl7n25kNAZ0wlnympktelBSjEKe38v/R94lHX3KsqcI6R9PdxtkbPqB74di+x4GycPEE/gJ0OcfLThvQVujGMKovt4P+MO+JiuqOG3193sOLY/Vf/j7Vf37c26zs5lr3Fw==","w":150,"h":75,"aspect":"fixed","title":"Computer"},{"xml":"jVNNb9swDP01wrZLoNoIih1XN+mlO6X3QXXYSB31EYlekn8/ypKTZU6BHgxJj4/PeqQo2s4en6IK+qffAop2Jdouek9lZ48dIIpGmq1oH0XTSP5Es/4gejdGZVARHH0moSkJfxQOUJACJDphBTRZvtbjnWgf/EBoHHTeOeizvmTwoA3BJqg+8w/shLE3g9h59HGUaNfrh+/3LeNJq5Bp9rjLlhcq9tpYRdAuVAhoekXGOyby6eU0UtFfwMyucNoPbJLBagAiwfHDIoxQrcATeAsUT0w5mC3pyliWQkkNZqdr2v2yYCqV8+6ceinpjxjVaawYuN5gIU7+dhjM4uygaA3ke28DAgEVLxx4Zg5u9niDo16nTmS1X5NamlN7j4N19a5OWZhT3r1xdMW7Fl2UtOy4kbcl/Ot7aX699sVa2lf7m9Xzqnth5D9xfnX5PXbzyPy38i16OyOO+fKgIWbK19sqaH7n5YtouH9LXuS3kifqNJwb2g+J2Fb0gd+PgXR+JlNXJ2KENCClfxvPm8KaTnW4puNliMfY1Yz/BQ==","w":150,"h":75,"aspect":"fixed","title":"Location"},{"xml":"jVRNb+IwEP01EdsLShOhniFAL6xUid7RYIbE3Ynt2k4h/37HsQPdhW73EMkz8+bjvYydlVV7frZgmp/6gJSVq6ysrNY+ntpzhURZkctDVi6zosj5y4r1F9HHIZobsKj8/yQUMeEDqMPoiQ7ne0qOxrc81vIxKxe68yQVVlopFKF+zs5TIz1uDYiAPzET9h0lUaVJ26FEuZ4tV/M5+10DJsDacx0oT8GKRrbgsZyCMSQFeKkVA9l67QeoAAN7SdL3wR3wKWB1pw7IPBaJA1qP5y91GFxJhGfULXrbM+QkD75JiFnUKm9Q1k1Ke5pFH7ho15fUq6pza6EfREMlJEXgSLEmI6fHTonADGjHI0Eq2XktdGsIPfrIiQMbLYC273QHA/vxn4SiO0NdLdVu0IQb7EKTUN3dpgpNXasSBQUt3kLetFT+Dq5iHOEH3hmIYI+J7YRDPxIsZ2ORzovJw+TOOM4JApf6TNZXdTYh7VP+35l6/xY3j0MvA/95or9O7NP+vqfBtqvNqnplz78lm/KFCFclsL3hnR+tbr8tMeTnpwYtBjG+6Reb5CR/YVSM92wWVHyIdbJ0cS+LJzrnWQSrDe+5RHdZ53H7RqBF15F3nxeUDxE1WukdGM3rezPE/niOfgM=","w":150,"h":75,"aspect":"fixed","title":"Functional Area"},{"xml":"jVPBbtswDP0aodslcG3kkGPjZr1kwID0XigKY6ujTFemm/jvS1lyGy8pMAOGrcfHJ/GRUkXpzk9et/VvOgCqYqOK0hNx/HPnEhBVntmDKh5VnmfyqvzXN9H7MZq12kPD/5OQx4R3jT1EJAIdD5iAmp0c6/FeFWvqGW0DJTUNmKCfCXiqLcOu1SbwT1KJYEeLWBKSHyWKozyrleDv4NkajVu9B/xDnWVLjXD2xEzugvCAtgoBpiCn08pIVSCa667WbdjOnatg3UJ7U1unGYqFNhy2XafCRA/O35ozQsmZJyAH7AehnOyB68hYRv+yGmxVp6zVMmK6i+vqM/PL6Qfv9TAaCY2xGInTcSts7UIOYXlISj2TIdciMPDQJue3JE7s3vAGR++n9gStl1HLQnfNNIS9a9JBG+3gmvJKtuEZb6a5iFmh2jy7rUD71zgPEtpclNW9pcJ3m+2mfBZkrixTGOazvApcb5kdvQzIP7wxOzvV4APjx00NtH/D507l0rWlfLKfMU2lq/HZRtN3MoStpzYMYTRz1suJ6KHrkbvLdstPZE2rdNOm5deNHmOzC/8B","w":50,"h":95,"aspect":"fixed","title":"Entity"},{"xml":"jVTBbqMwEP0a1N1LREE55NjQbC+pVIm9rxxnAu4OjGsPTfL3O8YmbUoqLRICv3nzmHkek5VVd3pyyrbPtAfMyk1WVo6I41t3qgAxK3Kzz8rHrChyubPi1zfR+zGaW+Wg5/9JKGLCu8IBIhIBz2dMQMudlPV4n5VrGhhNDxX1Peignwt4bA1DbZUO/KN0ItjBIFaE5EaJ8iDXaiX4Ozg2WuFW7QBfyBs21AtnR8zUfSI8oGlCgCnIqbTS0hWI5tq3yobPdacmWLdQTremUwzlQmkOn12nxkQPTt+aM0LJmSegDtidhXI0e24jYxn9y1swTZuyVsuIKR/XzSXzw+kH59R5NBJ6bTASp3IbtGbhB2vRSDtRa2DS1FkEBj7b5P2WxIv6DW9w1G7aoKD2Z1Lzc6omHLo+1dqrDuaUVzI9X/GuRRcxLXRc5LcltPcalU/pd3VKvZszafcap0dC9ZUJ/i0ZVW+2m+q3IF/KkLENA13NI/MC84OTkfpKHPPzYwsuUH7cVkHzNzykdtnppTzynzEvS8fpsvV68DK41pENgwv+Mk/T/k9EB35A9p9HRF4ia1ql0zktP/4CY+zqJ/EP","w":50,"h":95,"aspect":"fixed","title":"Supplier"},{"xml":"7VdLU6NAEP41VPRgCsnGLY9Csl7ccmvdy56oCXRgdGBwZjDJ/vrteZBkBJUcvGmVBL7u/qafwxDMkmp7K0hT/uQ5sGC2DGaJ4FzZu2qbAGNBFNI8mC2CKArxP4h+vCG9NNKwIQJqNcYgsgYvhLVgkSC6YmgaK7JigCKpdsyKrp5b7Va85rW6kPQfojeocAkVXhHH64bmqnRwiCvP95ISaFEqX9QRIpShW7IhGa0Lb62wp9WQPH9X66pwvzaMFc93PVAMBnbsIyZx+w5rjiqE0aL2CDLMOoi3zVbiNYKV0Vx9sKc5gOSDUewTpMP45kehC/3aacUbT6WvwWCtPicoDQ4VSOO2/zo88mKNSlXhrCwuUcZbxWgNCa9ryHTT647blFTBAzaU1t/geOm+pYwlnHFhKGbX12v8Q1yWpNFq1bbQczglIitpRRTMpqtWIrWU96tHwx3zFxBrxjeorunc9IBQsH1zAg3kxu8WeAVK7A6zYjTmdkr3U6LB73OLEWmfi73pYZ5vhCA7kxmoM8qsYhdHwRo6zYkijqdVPONVw0CB2jUukXc8I+zhmQ3omALYpZEpbVhb0Do12dGsqb4AgwoDlX3zjLO2qp3vNamwlgmq5CAzQRtFed23eeS0VmZdZ2c7L9Q4/nzohg4LXQn5eO0pzc0etRhjIacf8qWWLwpPdD0jAqcWZ0/RE0J43yGPMz0lUM/SpGiwVF6NRzhr20B3dBS6lhhh5bWMNfagjzlspY9XNwNgGnKEAwxegHWW7mGkaZeu47WlEm2mWgFpQ3AHGEflV+SY7iDZ9cvERQ4CU4WvJUpOrNNrLkZW4LaYCYrOurTgQ+zuYy24cJjNcTw5nwzsDlJmjEjXOpMFrr60q6d3muqIsxeS24u14S8Txk0XxeIQhHtjPDuHH5Z3y+TPuJq5CR5Z4a+e/uyeDteCV6NcO33b/XpjfNobI9yUIHRFz8ZPEaNPYHcPPPzMJzYv97/HBebPVJ/q3NIZxsVSk8Z/T5nx48NY1kqFYyB4g2c/k//IP5F1igJky9z5yB3a8MZqdU/uq6x7PHz9GZn3cfgf","w":150,"h":75,"aspect":"fixed","title":"DataElement"},{"xml":"jVTBTuMwEP0aa+FSmUTVnktoucBeyh2ZdKgNY4/rOKT9+x3HThGiQRwix2/ee5kZjyPqxh7vg/L6kXaAol6LuglEMb/ZYwOIopJmJ+o7UVWSH1FtZqI3Y1R6FcDF3wiqLPhQ2ENGMtDFExZAR8tp3d2I+pb6iMZBQ85Bm/wlg4M2EbZetYk/cCWMvRrEhpDCaFGvNpvNilO47bTyiWaP+1TyQoVWG6si1AvlPZpWRUOOibx7Oo1Ux21JQGIWqDv0XCCDJXkIEY6zDRihUv09kIUYTkwZzC7qwljmJkkNZq+L7O8yY6rL+/1Z+tnOVQjqNHYLXGswE6fa9ujNwkEcKLw/7+DDcIOyYx+pJesRIsRcEQceqFW4PeAFjnqZziJ5PhdPOPTGWy6z+y5pCXvrSuZO2QtffiPj4hfeZfNFlqc+VPKyFb285XHg0L+sX0/6Mk6H0pzt+mHdPDEy8zGeyzSxzTzjezryNZCdFYx+ctAQEvXqZ1c072n5Iyo+/SUv8jrrRblH53Fo+y5y+YE8T5+B7jxk00xMxABdj+WMytjwS2ZNu3Itp+3n9R9jX/4O/wE=","w":150,"h":75,"aspect":"fixed","title":"Network Device"},{"xml":"7VZNc5swEP01jNuLh8DkB9TYySWZZpJeevIosAYlApHVEpt/X31hQzED7bHTGXsklvd2365WEkGclKd7ZHXxKDMQQbwL4gSlJDcrTwkIEUQhz4J4G0RRqP9BdDfx9sa+DWuGUNESQuQIn0w04CzOoKgV3gBV9g1RHvVTKphSPA3iTUGl1rq90VNHgCyHSQ3W5AXcgyyBsNWQI8+ocIhbJzMsgOcFDW0IghH/HLpnyj3mZ3fnCE+S68BR2A7ddAwlG0zBg/ql6Xin6zximAONeHrSS8qadLlYa4sIVcqFo5en3KzyOhc1X2eM2EHomroIDclUlrUAAmprn+iDTJl4+RBXMOy1WxzjbV+LJufVvnOqLrMxN5WiKSufUsVKGEPeTIo2hocJOJi6GLserockZJU6ANYojSehQ4dyGn6erec97XWz6jY2UpYGX1vKEt2KGMHfi3X0eYUOZ2VdLfdgWeZUuGUzjRmFfh5EyRxLFRIpA5Uir4nbdK2HgWnCy7jAfQ22Z6eoPvM+3prGhZCYAWopBMjZn1Ri1ONK2ZPK+VhtPXy/CqKNj71Z6ZNr8MIlMdL0+gapP4+erI6OpLaDPaw+/D5/2T3skh8Lesn1TJQsgP4jCx4eUJbz6S7cuf9PnKUnTngsAE39vyxsNMHfzaC3xa3+6SH8alvO/L4/b3fPetz8XNy4/Vs0bRTpvYWyBiQO6nxvd5dmB0RQjSD121XrUJeL137OdI+XzyZ3Kfe/qn4B","w":50,"h":50,"aspect":"fixed","title":"Dataflow"},{"xml":"7Vfdb9owEP9rItaHoZSo2jOkpZrUfWhU2iNyzUHcOXZqOwX++519DpAFlvBeiaD47nefvjs7SZaXu0fDquKbXoFMsocky43Wjt7KXQ5SJpNUrJLsPplMUnySyfwC9zZw04oZUG6IwIQE3pmsgShEsG4vI6FwJbp1f5tkM107KRTkWingXn+KxG0hHCwqxj1+i5EgbS2kzLXUJqjIpvP5fIouzGzBKg8rdxsf8pgZXoiSOcjGrKqk4MwJrRCIq+d9gFow757gkZFkdK1WsIqug3Gwuxh+IMXYH0GX4MweIVuxckVE3FGK0gLEpohiX+6IxiytNwfRYzKnxrB9yBUoLiQBm8g2shJj4bz3AjNDymqnuS4rCQ4chYKMJ82ZXLzJMxj20myCV7esZL0RahlSYbdLu/VArTBW2xXmWtaliu4rVqIPOUJWYLkRVUhzIATNJVP1mnFXGzB2TOh/Fb5qoVxwKSqVsHaI8fRGz2UPfbzoZaqHYsdYoli83lIf3o57dC2DrmGOWoflONTT/1kmRcsrwggCFPeZ3Lb2aLB/LamOM+19v2TZ1r43r7F6kOhYPHDi/p4vs1bx9lqjevW9OkljpffKtPqARNut0atBwjvIRjYu+qSosk/9DXOg3xqVxqlgIPW0MCFPOd18a1egAEgc6Bg4JsCBEWxQ5lvR0B6Pvj7j/4Km3qhrTbIXiJMSuXN8Zm33ZkhKPzW59fz4HhifIy0GPxvdjM4WEbeWS2ZtYymbLX7njdvLEw2dbLy80smGrJ8h8CnFvTiGHU/ItxjH4uHpIX8e0hWx4vMh2I+avqKm07XR5YCsnh9vH4fWx6F15aGVbnFo+mL8NLSRpfgDNLzwZnlHUyv98WuIX+227lF0tmW6Mjckh7/p9/sBcfSO+pvjHI5Tl9fWobjRFd7QBdjDRby5NzdAA7aW8Qobr9b4QqhmFT9cmuXxAynwWt9PfwE=","w":150,"h":75,"aspect":"fixed","title":"IT Service"}]</mxlibrary>');
