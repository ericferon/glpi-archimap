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

include ('../../../inc/includes.php');

if (!isset($_GET["id"])) $_GET["id"] = "";
if (!isset($_GET["withtemplate"])) $_GET["withtemplate"] = "";
$graph=new PluginArchimapGraph();
$graph_item=new PluginArchimapGraph_Item();

if (isset($_POST["add"])) {

   $graph->check(-1, CREATE,$_POST);
   $newID=$graph->add($_POST);
   if ($_SESSION['glpibackcreated']) {
      Html::redirect($graph->getFormURL()."?id=".$newID);
   }
   Html::back();

} else if (isset($_POST["delete"])) {

   $graph->check($_POST['id'], DELETE);
   $graph->delete($_POST);
   $graph->redirectToList();

} else if (isset($_POST["restore"])) {

   $graph->check($_POST['id'], PURGE);
   $graph->restore($_POST);
   $graph->redirectToList();

} else if (isset($_POST["purge"])) {

   $graph->check($_POST['id'], PURGE);
   $graph->delete($_POST,1);
   $graph->redirectToList();

} else if (isset($_POST["update"])) {

   $graph->check($_POST['id'], UPDATE);
   $graph->update($_POST);
   Html::back();

} else if (isset($_POST["additem"])) {

   if (!empty($_POST['itemtype'])&&$_POST['items_id']>0) {
      $graph_item->check(-1, UPDATE, $_POST);
      $graph_item->addItem($_POST);
   }
   Html::back();

} else if (isset($_POST["deleteitem"])) {

   foreach ($_POST["item"] as $key => $val) {
         $input = array('id' => $key);
         if ($val==1) {
            $graph_item->check($key, UPDATE);
            $graph_item->delete($input);
         }
      }
   Html::back();

} else if (isset($_POST["deletegraphs"])) {

   $input = array('id' => $_POST["id"]);
   $graph_item->check($_POST["id"], UPDATE);
   $graph_item->delete($input);
   Html::back();

} else {

   $graph->checkGlobal(READ);

   Html::header(PluginArchimapGraph::getTypeName(2), '', "assets",
                   "pluginarchimapmenu");
   $graph->display($_GET);

   Html::footer();
}

?>
