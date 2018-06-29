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

// Init the hooks of the plugins -Needed
function plugin_init_archimap() {
   global $PLUGIN_HOOKS;

   $PLUGIN_HOOKS['csrf_compliant']['archimap'] = true;
   $PLUGIN_HOOKS['change_profile']['archimap'] = array('PluginArchimapProfile', 'initProfile');
   $PLUGIN_HOOKS['assign_to_ticket']['archimap'] = true;
   
   //$PLUGIN_HOOKS['assign_to_ticket_dropdown']['archimap'] = true;
   //$PLUGIN_HOOKS['assign_to_ticket_itemtype']['archimap'] = array('PluginArchimapGraph_Item');
   
   Plugin::registerClass('PluginArchimapGraph', array(
//         'linkgroup_tech_types'   => true,
//         'linkuser_tech_types'    => true,
         'document_types'         => true,
         'ticket_types'           => true,
         'helpdesk_visible_types' => true//,
//         'addtabon'               => 'Supplier'
   ));
   Plugin::registerClass('PluginArchimapProfile',
                         array('addtabon' => 'Profile'));
                         
   //Plugin::registerClass('PluginArchimapGraph_Item',
   //                      array('ticket_types' => true));

      
   if (class_exists('PluginDatabasesDatabase')
   and class_exists('PluginArchimapGraph')) {
//      PluginDatabasesDatabase::registerType('PluginArchimapGraph');
	  PluginArchimapGraph::registerType('PluginDatabasesDatabase');
   }
   if (class_exists('PluginDataflowsDataflow')
   and class_exists('PluginArchimapGraph')) {
//      PluginDataflowssDataflow::registerType('PluginArchimapGraph');
	  PluginArchimapGraph::registerType('PluginDataflowsDataflow');
   }
   if (class_exists('PluginArchiswSwcomponent')
   and class_exists('PluginArchimapGraph')) {
//      PluginDatabasesDatabase::registerType('PluginArchimapGraph');
	  PluginArchimapGraph::registerType('PluginArchiswSwcomponent');
   }
   if (Session::getLoginUserID()) {

      $plugin = new Plugin();
      if (!$plugin->isActivated('environment')
         && Session::haveRight("plugin_archimap", READ)) {

         $PLUGIN_HOOKS['menu_toadd']['archimap'] = array('assets'   => 'PluginArchimapMenu');
      }

      if (Session::haveRight("plugin_archimap", UPDATE)) {
         $PLUGIN_HOOKS['use_massive_action']['archimap']=1;
      }

      if (class_exists('PluginArchimapGraph_Item')) { // only if plugin activated
         $PLUGIN_HOOKS['plugin_datainjection_populate']['archimap'] = 'plugin_datainjection_populate_archimap';
      }

      // End init, when all types are registered
      $PLUGIN_HOOKS['post_init']['archimap'] = 'plugin_archimap_postinit';

      // Import from Data_Injection plugin
      $PLUGIN_HOOKS['migratetypes']['archimap'] = 'plugin_datainjection_migratetypes_archimap';
   }
}

// Get the name and the version of the plugin - Needed
function plugin_version_archimap() {

   return array (
      'name' => _n('Diagram', 'Diagrams', 2, 'archimap'),
      'version' => '2.0.1',
      'author'  => "Eric Feron",
      'license' => 'GPLv2+',
      'homepage'=>'',
      'minGlpiVersion' => '0.90',
   );

}

// Optional : check prerequisites before install : may print errors or add to message after redirect
function plugin_archimap_check_prerequisites() {
   if (version_compare(GLPI_VERSION,'0.90','lt') || version_compare(GLPI_VERSION,'9.3','ge')) {
      _e('This plugin requires GLPI >= 0.90', 'archimap');
      return false;
   }
   return true;
}

// Uninstall process for plugin : need to return true if succeeded : may display messages or add to message after redirect
function plugin_archimap_check_config() {
   return true;
}

function plugin_datainjection_migratetypes_archimap($types) {
   $types[2400] = 'PluginArchimapGraph';
   return $types;
}

?>
