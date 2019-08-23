<?php
/*
 -------------------------------------------------------------------------
 Archimap plugin for GLPI
 Copyright (C) 2009-2018 by Eric Feron.
 -------------------------------------------------------------------------

 LICENSE
      
 This file is part of Archimap.

 Archimap is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 at your option any later version.

 Archimap is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Archimap. If not, see <http://www.gnu.org/licenses/>.
 --------------------------------------------------------------------------
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
$first = TRUE;
foreach ($items as $itemtype => $items_id) {
	foreach ($items_id as $item_id) {
		if (!$first)
			$query .= ", ";
		$query .= "( ".$plugin_archimap_graphs_id.",".$item_id.",'".$itemtype."')";
		$first = FALSE;
	}
}
//Toolbox::logInFile("linkgraph", $query."\n");
$result=$DB->query($query);
?>
