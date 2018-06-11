<?php
/*
 * @version $Id: HEADER 2011-03-12 18:01:26 tsmr $
 -------------------------------------------------------------------------
 GLPI - Gestionnaire Libre de Parc Informatique
 Copyright (C) 2003-2010 by the INDEPNET Development Team.

 http://indepnet.net/   http://glpi-project.org
 -------------------------------------------------------------------------

 LICENSE

 This file is part of GLPI.

 GLPI is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 GLPI is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with GLPI; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 --------------------------------------------------------------------------
// ----------------------------------------------------------------------
// Original Author of file: Eric Feron
// Purpose of file: plugin archimap v1.0.0 - GLPI 0.80
// ----------------------------------------------------------------------
*/
define('GLPI_ROOT', '../../..');
include (GLPI_ROOT . "/inc/includes.php");

$DB = new DB;
//header("Content-Type: text/html; charset=UTF-8");
if (isset($_GET['plugin_archimap_graphs_id'])) {
	$plugin_archimap_graphs_id = $DB->escape(utf8_decode($_GET['plugin_archimap_graphs_id']));
} else {
    die("No 'plugin_archimap_graphs_id' parameter");
}
if (isset($_GET['items'])) {
$items = json_decode(stripslashes(urldecode($_GET['items'])));
} else {
    die("No 'items' parameter");
}
$query = "INSERT IGNORE glpi_plugin_archimap_graphs_items (plugin_archimap_graphs_id,items_id,itemtype) values";
foreach ($items as $itemtype => $items_id) {
	$first = TRUE;
	foreach ($items_id as $item_id) {
		if (!$first)
			$query .= ", ";
		$query .= "( ".$plugin_archimap_graphs_id.",".$item_id.",'".$itemtype."')";
		$first = FALSE;
	}
}
$result=$DB->query($query);
?>
