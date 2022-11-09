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
 
define('GLPI_ROOT', '../../../..');
include (GLPI_ROOT . "/inc/includes.php");

$forbidden_tables = ['glpi_users', 'glpi_authldaps', 'glpi_authmails', 'glpi_certificates'];
$DB = new DB;
$tables = file_get_contents('php://input');
if (isset($tables)) {
	$tables = json_decode($tables);
} else {
    die("No query parameters contained in body of POST request 'getconfig'");
}
$datas = [];
foreach($tables as $key => $tablecolumn) {
	$table = "glpi_plugin_archimap_configs";
	$columns = explode(",", str_replace(' ', '', $tablecolumn->column)); // suppress spaces and split on comma
	if (isset($tablecolumn->type))
		$where = "`type` = '".strtok($tablecolumn->type, " (\t")."'"; // take only first word
	else
		$where = "";
	if (isset($tablecolumn->type) && isset($tablecolumn->key)) $where .= " AND ";
	if (isset($tablecolumn->key)) $where .= "`key` = '".strtok($tablecolumn->key, " (\t")."'";
		$query = "SELECT `".implode("`, `", $columns)."` FROM glpi_plugin_archimap_configs".($where?" WHERE ".$where:"")." ORDER BY `".implode("`, `", $columns)."`";
//Toolbox::logInFile("gettables", $query."\n");
//var_dump($query);
		if ($result=$DB->query($query)) {
			if ($DB->numrows($result)>0)
			{	while ($data=$DB->fetchAssoc($result)) {
//Toolbox::logInFile("gettables", print_r($datas,TRUE)."\n");
					$datas[$key][$data[$columns[0]]]=$data;
				}
			}
			else
				$datas[$key]["error"]["msg"]="No data found";
		}
		else {
			$datas[$key]["error"]["msg"]="SQL error";
		}
}
//var_dump($datas);
//Toolbox::logInFile("gettables", print_r($datas,TRUE)."\n");
echo json_encode($datas);
?>
