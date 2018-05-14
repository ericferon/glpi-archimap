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

if (!defined('GLPI_ROOT')) {
   die("Sorry. You can't access directly to this file");
}

class PluginArchimapDiagram extends CommonDBChild {

   static $rightname = "plugin_archimap";

   // From CommonDBChild
   static public $itemtype = 'PluginArchimapGraph';
   static public $items_id = 'plugin_archimap_graph_id';

   static function getTypeName($nb=0) {

      return _n('Drawing Pane','Drawing Pane',$nb, 'archimap');
   }

   function getTabNameForItem(CommonGLPI $item, $withtemplate=0) {

      if ($item->getType()=='PluginArchimapGraph') {
         return self::getTypeName(2);
      }
      return '';
   }
   
   static function displayTabContentForItem(CommonGLPI $item, $tabnum=1, $withtemplate=0) {
      global $CFG_GLPI;

      if ($item->getType()=='PluginArchimapGraph') {
         $self = new self();

//         $self->showDiagrams($item);
         $self->showForm($item);
      }
      return true;
   }

   function post_getEmpty () {
//      $this->fields["port"]='0';
   }

   function prepareInputForAdd($input) {
      // Not attached to reference -> not added
      if (!isset($input['plugin_archimap_graph_id'])
            || $input['plugin_archimap_graph_id'] <= 0) {
         return false;
      }
      return $input;
   }

   function showForm (CommonGLPI $item, $options=array()) {

      if (!$this->canView()) return false;

      //hidden field for diagram representation in xml
//      echo "<tr><td>graph content</td><td>";
//      Html::autocompletionTextField($item,"graph",array('size' => "20"));
      Html::autocompletionTextField($item,"id",array('size' => "20", 'option' => "type='hidden'"));
      Html::autocompletionTextField($item,"name",array('size' => "20", 'option' => "type='hidden'"));
      Html::autocompletionTextField($item,"graph",array('size' => "20", 'option' => "type='hidden'"));
//      echo "</td></tr>";

	  echo "<div class=\"geEditor\" style=\"position:relative;width:100%;overflow:hidden;cursor:default;margin-left:auto;margin-right:auto;\">\n";
	  echo "<link rel=\"stylesheet\" type=\"text/css\" href=\"../drawio/src/main/webapp/styles/grapheditor.css\">\n";
	  echo "<script type=\"text/javascript\" src=\"../inc/grapheditorhead.js\"></script>\n";
	  echo "<div><h2 id=\"geStatus\">loading mxgraph ...</h2><p>Please ensure JavaScript is enabled.</p></div>\n";
	  echo "<script type=\"text/javascript\" src=\"../drawio/src/main/webapp/js/app.min.js\"></script>\n";
	  echo "<script type=\"text/javascript\" src=\"../inc/grapheditorbody.js\"></script>\n";
	  echo "</div>\n";
//	  echo "<div id=\"geFooter\" style=\"visibility:hidden;overflow:hidden;margin-right:170px;height:100%;\">";
//	  echo "</div>\n";


      $options['candel'] = false;
//      $this->showFormButtons($options);

      return true;
   }

}

?>