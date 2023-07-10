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
 
class PluginArchimapConfigMenu extends CommonGLPI {
   static $rightname = 'plugin_archimap_configuration';

   static function getMenuName() {
      return _n('Diagram Configuration', 'Diagrams configuration', 2, 'archimap');
   }

   static function getMenuContent() {
      global $CFG_GLPI;

      $menu                                           = [];
      $menu['title']                                  = self::getMenuName();
      $menu['page']                                   = "/".Plugin::getWebDir('archimap', false)."/front/config.php";
      $menu['links']['search']                        = PluginArchimapConfig::getSearchURL(false);
      if (PluginArchimapConfig::canCreate()) {
         $menu['links']['add']                        = PluginArchimapConfig::getFormURL(false);
		}
		$menu['icon'] = self::getIcon();

      return $menu;
	}

	static function getIcon() {
		return "fas fa-object-group";
	}

   static function removeRightsFromSession() {
      if (isset($_SESSION['glpimenu']['config']['types']['PluginArchimapConfigMenu'])) {
         unset($_SESSION['glpimenu']['config']['types']['PluginArchimapConfigMenu']); 
      }
      if (isset($_SESSION['glpimenu']['config']['content']['pluginarchimapconfigmenu'])) {
         unset($_SESSION['glpimenu']['config']['content']['pluginarchimapconfigmenu']); 
      }
   }
}
