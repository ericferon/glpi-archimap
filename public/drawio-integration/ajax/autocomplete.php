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

$DB = new DB;
//header("Content-Type: text/html; charset=UTF-8");
if (isset($_GET['test'])) { // return query string as result
	$test = TRUE;
	$test = utf8_decode($_GET['test']) == "" || filter_var(utf8_decode($_GET['test']),FILTER_VALIDATE_BOOLEAN);
} else {
	$test = FALSE;
}
if (isset($_GET['table'])) {
	$table = $DB->escape(utf8_decode($_GET['table']));
} else {
    die("No 'table' parameter");
}
if (isset($_GET['columns'])) {
	$columns = $DB->escape(utf8_decode($_GET['columns']));
	$columns = str_replace(' ', '', $columns); // suppress whitespaces
	$columns_arr = explode(',', $columns);
} else {
    die("No 'columns' parameter");
}
if (isset($_GET['jointtables']) && $_GET['jointtables'] != '') {
	$firstword = strtok($_GET['jointtables'], ' ');
	$jointreservedword = array("LEFT", "INNER", "RIGHT", "JOIN", "NATURAL", "STRAIGHT_JOIN");
	if ( in_array(strtoupper($firstword), $jointreservedword) ) {
		$jointtables = $DB->escape(utf8_decode($_GET['jointtables']));
	} else {
		$jointtables = ", ".$DB->escape(utf8_decode($_GET['jointtables']));
	}
} else {
    $jointtables = "";
}
if (isset($_GET['jointcolumns']) && $_GET['jointcolumns'] != '') {
	$jointcolumns = ", ".$DB->escape(utf8_decode($_GET['jointcolumns']));
} else {
    $jointcolumns = "";
}
if (isset($_GET['jointcriteria'])) {
    $jointcriteria = $DB->escape(urldecode($_GET['jointcriteria']));
} else {
    $jointcriteria = "";
}
if (isset($_GET['term'])) {
    $term = $DB->escape(utf8_decode($_GET['term']));
} else {
    $term = "";
}
if (isset($_GET['othercriteria'])) {
    $othercriteria = stripslashes(htmlspecialchars_decode(urldecode($_GET['othercriteria'])));
    if ($othercriteria)
		$othercriteria = " AND (".$othercriteria.")";
} else {
    $othercriteria = "";
}
if (isset($_GET['ordercriteria'])) {
    $ordercriteria = stripslashes(htmlspecialchars_decode(urldecode($_GET['ordercriteria'])));
	$ordercriteria = (strtoupper(substr($ordercriteria, 0, 9)) == 'ORDER BY ') ? $ordercriteria : 'ORDER BY '.$ordercriteria ;
} else {
    $ordercriteria = "";
}
$query = "SELECT $table.id $jointcolumns from $table $jointtables where (";
$or = "";
foreach ($columns_arr as $column) {
	if (strpos($column,".") !== false) {
		// table is present in column name
		$query .= $or.$column." like '%".$term."%' ";
	} else {
		// no table in column name -> add it
		$query .= $or.$table.".".$column." like '%".$term."%' ";
	}
	$or = " OR ";
}
$query .= ") ".$jointcriteria." ".$othercriteria." ".$ordercriteria;
//$query = preg_replace('/[[:^print:]]/', '', $query); // remove non-printable characters
$query = preg_replace('/;/', '', $query); // remove ';' to mitigate sql injection
//var_dump($query);
if ($test) {
	$datas[] = $query;
	$query .= " LIMIT 5";
}
if ($result=$DB->query($query)) {
	while ($data=$DB->fetchAssoc($result)) {
//var_dump($data);
		$datas[] = $data;
	}
} 
//var_dump($datas);
//if (!$test) {
	if (isset($datas))
		echo json_encode($datas);
	else
		echo json_encode('');
//} else
//		echo json_encode($query);
?>
