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
 
class PluginArchimapMenu extends CommonGLPI {
   static $rightname = 'plugin_archimap';

   static function getMenuName() {
      return _n('Diagram', 'Diagrams', 2, 'archimap');
   }

   static function getMenuContent() {
      global $CFG_GLPI;

      $menu                                           = [];
      $menu['title']                                  = self::getMenuName();
      $menu['page']                                   = '/'.Plugin::getWebDir('archimap', false)."/front/graph.php";
      $menu['links']['search']                        = PluginArchimapGraph::getSearchURL(false);
      if (PluginArchimapGraph::canCreate()) {
         $menu['links']['add']                        = PluginArchimapGraph::getFormURL(false);
		}
		$menu['icon'] = self::getIcon();

      return $menu;
	}

	static function getIcon() {
		return "fas fa-object-group";
	}

   static function removeRightsFromSession() {
      if (isset($_SESSION['glpimenu']['assets']['types']['PluginArchimapMenu'])) {
         unset($_SESSION['glpimenu']['assets']['types']['PluginArchimapMenu']); 
      }
      if (isset($_SESSION['glpimenu']['assets']['content']['pluginarchimapmenu'])) {
         unset($_SESSION['glpimenu']['assets']['content']['pluginarchimapmenu']); 
      }
   }
}
