<?php
/*
 -------------------------------------------------------------------------
 Archimap plugin for GLPI
 Copyright (C) 2009-2021 by Eric Feron.
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
 
define('GLPI_ROOT', '../../../../..');
include (GLPI_ROOT . "/inc/includes.php");

$DB = new DB;
$keys = file_get_contents('php://input');
if (isset($keys)) {
	$keys = json_decode($keys);
} else {
    die("No 'keys' contained in body of POST request 'getconfig'");
}
$datas = [];
$nbstyles = 0;
foreach($keys as $key => $typevalue) {
	$type = $typevalue->type;
	$value = $typevalue->value;
    $query = "INSERT INTO glpi_plugin_archimap_configs (type, `key`, value ) VALUES ('$type', '$key', '$value');";
//Toolbox::logInFile("gettables", "putconfig ".$query."\n");
//var_dump($query);
    $result=$DB->query($query);
	$datas[$key] = $DB->insertId();
    if ($type == 'STYLE') $nbstyles++;
}
//var_dump($result);
echo json_encode($datas);
// if one key = STYLE, write all styles into a file
if ($nbstyles)
{
	include (Plugin::getPhpDir("archimap")."/drawio-integration/ajax/copystylestofile.php"); // copy STYLE entries into file
}
?>
