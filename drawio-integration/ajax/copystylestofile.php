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

//include ('../../../inc/includes.php');

// read output file name from DB (entry STYLEFILE/DESTINATION)
$query = "SELECT `value` FROM `glpi_plugin_archimap_configs` WHERE `type` = 'STYLEFILE' and `key` = 'DESTINATION'";
if ($result=$DB->query($query)) {
	$data=$DB->fetchAssoc($result);
	if (isset($data['value']))
	{
		$filename = "../styles/" . $data['value'];
		$stylesheet = "<mxStylesheet>";
		$query = "SELECT * FROM `glpi_plugin_archimap_configs` WHERE `type` = 'STYLE' ORDER BY `key`";
		if ($result=$DB->query($query))
		{
			$nbstyles = 0;
			while ($data=$DB->fetchAssoc($result)) {
				$stylename = $data['key'];
				$style = htmlspecialchars_decode($data['value']);
				$style = str_replace("<mxStylesheet>", "", $style); // suppress <mxStylesheet> in front of style
				$style = str_replace("</mxStylesheet>", "", $style); // suppress </mxStylesheet> at end of style
				$stylesheet .= $style; // append style to stylesheet
				$nbstyles++;
			}
			$stylesheet .= "</mxStylesheet>"; // close root node
			$stylexml = new SimpleXMLElement($stylesheet);
			$dom = new \DOMDocument('1.0');
			$dom->preserveWhiteSpace = false;
			$dom->formatOutput = true;
			Toolbox::logInfo("putpostconfig : opening file $filename (current working dir :".getcwd().")");
			$dom->loadXML($stylexml->asXML());
			$rc = file_put_contents($filename, $dom->saveXML()); // pretty print into filename
			if ($rc)
				Toolbox::logInfo("putpostconfig : $nbstyles STYLE entries successfully copied into $filename (current working dir :".getcwd().")");
			else
				Toolbox::logError("putpostconfig : $nbstyles STYLE entries failed to be copied into $filename (current working dir :".getcwd().")");
		}
	}
}
?>
