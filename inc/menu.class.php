<?php
/*
 * @version $Id: HEADER 15930 2011-10-30 15:47:55Z tsmr $
 -------------------------------------------------------------------------
 archimap plugin for GLPI
 Copyright (C) 2009-2016 by the archimap Development Team.

 https://github.com/InfotelGLPI/archimap
 -------------------------------------------------------------------------

 LICENSE
      
 This file is part of archimap.

 archimap is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 archimap is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with archimap. If not, see <http://www.gnu.org/licenses/>.
 --------------------------------------------------------------------------
 */
 
class PluginArchimapMenu extends CommonGLPI {
   static $rightname = 'plugin_archimap';

   static function getMenuName() {
      return _n('Diagram', 'Diagrams', 2, 'archimap');
   }

   static function getMenuContent() {
      global $CFG_GLPI;

      $menu                                           = array();
      $menu['title']                                  = self::getMenuName();
      $menu['page']                                   = "/plugins/archimap/front/graph.php";
      $menu['links']['search']                        = PluginArchimapGraph::getSearchURL(false);
      if (PluginArchimapGraph::canCreate()) {
         $menu['links']['add']                        = PluginArchimapGraph::getFormURL(false);
      }

      return $menu;
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