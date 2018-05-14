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

include ('../../../inc/includes.php');

$plugin = new Plugin();
if ($plugin->isActivated("environment")) {
   Html::header(PluginArchimapGraph::getTypeName(2)
                  ,'',"assets","pluginenvironmentdisplay","archimap");
} else {
   Html::header(PluginArchimapGraph::getTypeName(2), '', "assets","pluginarchimapmenu");
}
$graph = new PluginArchimapGraph();

if ($graph->canView() || Session::haveRight("config", UPDATE)) {
   Search::show('PluginArchimapGraph');
} else {
   Html::displayRightError();
}

Html::footer();

?>