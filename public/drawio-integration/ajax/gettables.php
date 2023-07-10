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

$forbidden_tables = ['glpi_users', 'glpi_authldaps', 'glpi_authmails', 'glpi_certificates'];
$DB = new DB;
$tables = file_get_contents('php://input');
if (isset($tables)) {
	$tables = json_decode($tables);
} else {
    die("No 'tables' contained in body of POST request 'gettables'");
}
$datas = [];
foreach($tables as $key => $tablecolumn) {
	$table = $tablecolumn->table;
	$column = $tablecolumn->column;
	$columncount = substr_count($column, ",") + 1;
	if (!in_array(strtolower($table), $forbidden_tables)) {
		$query = "SELECT DISTINCT $column FROM $table";
//Toolbox::logInFile("gettables", $query."\n");
//var_dump($query);
		if ($result=$DB->query($query)) {
			while ($data=$DB->fetchAssoc($result)) {
				$datas[$key][]=$columncount == 1 ? $data[$column]: $data;
			}
		}
	} 
}
//Toolbox::logInFile("gettables", print_r($datas,TRUE)."\n");
//var_dump($datas);
echo json_encode($datas);
?>
