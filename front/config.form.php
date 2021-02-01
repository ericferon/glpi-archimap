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

include ("../../../inc/includes.php");

$config = new PluginArchimapConfig();

if (isset($_POST["add"])) {

   $config->check(-1, CREATE,$_POST);
   $newID=$config->add($_POST);
   if ($_SESSION['glpibackcreated']) {
      Html::redirect($config->getFormURL()."?id=".$newID);
   }
   Html::back();

} else if (isset($_POST["delete"])) {

   $config->check($_POST['id'], DELETE);
   $config->delete($_POST);
   $config->redirectToList();

} else if (isset($_POST["restore"])) {

   $config->check($_POST['id'], PURGE);
   $config->restore($_POST);
   $config->redirectToList();

} else if (isset($_POST["purge"])) {

   $config->check($_POST['id'], PURGE);
   $config->delete($_POST,1);
   $config->redirectToList();

} else if (isset($_POST['update'])) {
   $config->check($_POST['id'], UPDATE);
   $config->update($_POST);
   Html::back();
} else {

   $config->checkGlobal(READ);

   Html::header(PluginArchimapConfig::getTypeName(2), '', "config", "pluginarchimapconfigmenu");
   $config->display($_GET);

   Html::footer();
}
