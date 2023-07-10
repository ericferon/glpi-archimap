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
 
include ('../../../../../inc/includes.php');


$forbidden_tables = ['glpi_users', 'glpi_authldaps', 'glpi_authmails', 'glpi_certificates'];
$DB = new DB;

$cells = file_get_contents('php://input');
if (isset($cells)) {
	$cells = json_decode($cells);
} else {
    die("No 'cells' contained in body of POST request 'getcustomproperties'");
}
$data = [];
foreach($cells as $id => $cell) {
	$key = $DB->escape($cell->key);
	$table = $DB->escape($cell->tablename);
	if (isset($cell->jointtables)) {
		$firstword = strtok($cell->jointtables, ' ');
		$jointreservedword = array("LEFT", "INNER", "RIGHT", "JOIN", "NATURAL", "STRAIGHT_JOIN");
		if ( in_array(strtoupper($firstword), $jointreservedword)
            || trim($cell->jointtables) == "") {
			$jointtables = $DB->escape($cell->jointtables);
		} else {
			$jointtables = ", ".$DB->escape($cell->jointtables);
		}
	} else {
		$jointtables = "";
	}
	$jointcolumns = (isset($cell->jointcolumns))? ", ".$DB->escape($cell->jointcolumns) : "";
	$jointcriteria = (isset($cell->jointcriteria))? $DB->escape($cell->jointcriteria) : "";
	if (!in_array(strtolower($table), $forbidden_tables)) {
        $query = "SELECT $table.id as glpi_id $jointcolumns from $table $jointtables \nwhere $table.id = $id $jointcriteria";
//Toolbox::logInFile("getcustomproperties", $query."\n");
//var_dump($query);
        if ($result=$DB->query($query)) {
            $data[$key]=$DB->fetchAssoc($result);
        } 
	} 
}
//var_dump($data);
echo json_encode($data);
?>
