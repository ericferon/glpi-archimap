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
include ('../../../inc/includes.php');


$DB = new DB;
//header("Content-Type: text/html; charset=UTF-8");
if (isset($_GET['table'])) {
	$table = $DB->escape(utf8_decode($_GET['table']));
} else {
    die("No 'table' parameter");
}
if (isset($_GET['jointtables'])) {
	$firstword = strtok($_GET['jointtables'], ' ');
	$jointreservedword = array("LEFT", "INNER", "RIGHT", "JOIN", "NATURAL", "STRAIGHT_JOIN");
	if ( in_array(strtoupper($firstword), $jointreservedword) ) {
		$jointtables = $DB->escape(utf8_decode($_GET['jointtables']));
	} else {
		$jointtables = ", ".$DB->escape(utf8_decode($_GET['jointtables']));
	}
} else {
    die("No 'jointtables' parameter");
}
if (isset($_GET['jointcolumns'])) {
	$jointcolumns = ", ".$DB->escape(utf8_decode($_GET['jointcolumns']));
} else {
    die("No 'jointcolumns' parameter");
}
if (isset($_GET['id'])) {
    $id = $DB->escape(utf8_decode($_GET['id']));
} else {
    die("No 'id' parameter");
}
if (isset($_GET['jointcriteria'])) {
    $jointcriteria = $DB->escape(urldecode($_GET['jointcriteria']));
} else {
    $jointcriteria = "";
}
$query = "SELECT $table.id as glpi_id $jointcolumns from $table $jointtables \nwhere $table.id = $id $jointcriteria";
//var_dump($query);
if ($result=$DB->query($query)) {
	$data=$DB->fetch_assoc($result);
} 
//var_dump($data);
echo json_encode($data);
?>
