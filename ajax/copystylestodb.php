<?php


/**
 * ---------------------------------------------------------------------
 * GLPI - Gestionnaire Libre de Parc Informatique
 * Copyright (C) 2015-2020 Teclib' and contributors.
 *
 * http://glpi-project.org
 *
 * based on GLPI - Gestionnaire Libre de Parc Informatique
 * Copyright (C) 2021 by Eric Feron.
 *
 * ---------------------------------------------------------------------
 *
 * LICENSE
 *
 * This file is part of GLPI.
 *
 * GLPI is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * GLPI is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GLPI. If not, see <http://www.gnu.org/licenses/>.
 * ---------------------------------------------------------------------
 */

//include (GLPI_ROOT . '/inc/includes.php');

// read input file name from DB (entry STYLEFILE/SOURCE)
$query = "SELECT `value` FROM `glpi_plugin_archimap_configs` WHERE `type` = 'STYLEFILE' and `key` = 'SOURCE'";
if ($result=$DB->query($query)) {
	while ($data=$DB->fetchAssoc($result)) {
//var_dump($data);
		$datas[] = $data;
	}
	if (isset($datas['value']))
	{
		$filename = Plugin::getPhpDir("archimap")."/drawio-integration/styles/" . $datas['value'];
		$styles = file_get_contents($filename);
		if ($styles)
		{
			$stylexml = new SimpleXMLElement($styles);
			foreach($stylexml->add as $style) { // find children (first level <add> nodes)
				$stylename = (string)$style['as'];  // get 'as' attribute (stylename)
				$value = '<mxStylesheet>'.PHP_EOL.'\t'.$style->asXML().PHP_EOL.'</mxStylesheet>';

				$query = "INSERT INTO `glpi_plugin_archimap_configs` (`type`, `key`, `value`) VALUES ('STYLE', '$stylename', '$value')";

				if ($result=$DB->query($query)) {
					Toolbox::logInfo("copystylestodb : $stylename successfully inserted");
				}
				else
					Toolbox::logError("copystylestodb : SQL error for inserting $stylename : see files/_log/sql-errors.log");
			}
			$query = "DELETE FROM `glpi_plugin_archimap_configs` WHERE `type` = 'STYLEFILE' and `key` = 'SOURCE'";
			if ($result=$DB->query($query)) 
				Toolbox::logInfo("copystylestodb : $filename successfully copied ; STYLEFILE SOURCE entry suppressed in table glpi_plugin_archimap_configs");
			else
				Toolbox::logError("copystylestodb : STYLEFILE SOURCE entry failed to be suppressed in table glpi_plugin_archimap_configs");
		}
		else
			Toolbox::logError("copystylestodb : error reading file $filename");
	}
}
?>
