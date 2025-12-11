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

if (strpos($_SERVER['PHP_SELF'],"dropdownTypeArchimap.php")) {
   $AJAX_INCLUDE=1;
   if (version_compare(GLPI_VERSION,'10.0','le')) include (GLPI_ROOT . "/inc/includes.php");
   header("Content-Type: text/html; charset=UTF-8");
   Html::header_nocache();
}

Session::checkCentralAccess();

// Make a select box
if (isset($_POST["graphtype"]) && is_numeric($_POST["graphtype"])) {
   $used = [];

   // Clean used array
   if (isset($_POST['used']) && is_array($_POST['used']) && (count($_POST['used']) > 0) && array_filter($_POST['used'], 'is_numeric')) {
      $query = "SELECT `id`
                FROM `glpi_plugin_archimap_graphs`
                WHERE `id` IN (".implode(',',$_POST['used']).")
                      AND `plugin_archimap_graphtypes_id` = '".$_POST["graphtype"]."'";

      foreach ($DB->request($query) AS $data) {
         $used[$data['id']] = $data['id'];
      }
   }

    if (isset($_POST['myname']) && preg_match('/^[a-zA-Z0-9_]+$/',$_POST['myname'])
   && isset($_POST['entity']) && (empty($_POST['entity']) || is_numeric($_POST['entity']))
   && isset($_POST['rand']) && is_numeric($_POST['rand']))
      Dropdown::show('PluginArchimapGraph',
                  ['name'      => $_POST['myname'],
					'used'      => $used,
					'width'     => '50%',
					'entity'    => $_POST['entity'],
					'rand'      => $_POST['rand'],
					'condition' => ["glpi_plugin_archimap_graphs.plugin_archimap_graphtypes_id"=>$_POST["graphtype"]]]);

}

?>
