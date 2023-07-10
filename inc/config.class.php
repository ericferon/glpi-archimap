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

if (!defined('GLPI_ROOT')) {
   die("Sorry. You can't access directly to this file");
}

class PluginArchimapConfig extends CommonDBTM {

   public $dohistory=true;
   static $rightname = "plugin_archimap_configuration";
   protected $usenotepad         = true;
   
   static function getTypeName($nb=0) {

      return __('Diagrams configuration', "archimap");
   }

   // search fields from GLPI 9.3 on
   function rawSearchOptions() {

      $tab = [];
//      if (version_compare(GLPI_VERSION,'9.2','le')) return $tab;

      $tab[] = [
         'id'   => 'common',
         'name' => self::getTypeName(2)
      ];

      $tab[] = [
         'id'       => '1',
         'table'    => $this->getTable(),
         'field'    => 'type',
         'name'     => __('Type'),
         'datatype'      => 'itemlink',
         'itemlink_type' => $this->getType()
      ];

      $tab[] = [
         'id'            => '2',
         'table'         => $this->getTable(),
         'field'         => 'key',
         'name'          => __('Key'),
         'datatype'		 => 'text'
      ];

      $tab[] = [
         'id'            => '16',
         'table'         => $this->getTable(),
         'field'         => 'date_mod',
         'massiveaction' => false,
         'name'          => __('Last update'),
         'datatype'      => 'datetime'
      ];

      $tab[] = [
         'id'            => '72',
         'table'         => $this->getTable(),
         'field'         => 'id',
         'name'          => __('ID'),
         'datatype'      => 'number'
      ];

      return $tab;
   }

   //define header form
   function defineTabs($options=[]) {

      $ong = [];
      $this->addDefaultFormTab($ong);
//      $this->addStandardTab('PluginArchimapConfig', $ong, $options);
      $this->addStandardTab('Log', $ong, $options);

      return $ong;
   }

   /*
    * Return the SQL command to retrieve linked object
    *
    * @return a SQL command which return a set of (itemtype, items_id)
    */
/*   function getSelectLinkedItem () {
      return "SELECT `itemtype`, `items_id`
              FROM `glpi_plugin_archimap_graphs_items`
              WHERE `plugin_archimap_graphs_id`='" . $this->fields['id']."'";
   }
*/
   function showForm ($ID, $options=[]) {

      $this->initForm($ID, $options);
      $this->showFormHeader($options);

      echo "<tr class='tab_bg_1'>";
      //type
      echo "<td>".__('Type')."</td>";
      echo "<td>";
//      Dropdown::show('PluginArchimapConfigtype', ['value' => $this->fields['plugin_archimap_configtypes_id']]);
      echo Html::input('type',['value' => $this->fields['type'], 'id' => "type" , 'size' => 50]);
      echo "</td>";
      //key
      echo "<td>".__('Key')."</td>";
      echo "<td>";
      echo Html::input('key',['value' => $this->fields['key'], 'id' => "key" , 'size' => 50]);
      echo "</td>";
	  echo "</tr>";
	  
      echo "<tr class='tab_bg_1'>";
      //short description of diagrams
      echo "<td>".__('Value', 'archimap')."</td>";
      echo "<td colspan='3'>";
      echo "<textarea cols='100' rows='1' name='value'>".$this->fields["value"]."</textarea>";
      echo "</td>";
	  echo "</tr>";
	  

      $this->showFormButtons($options);

      return true;
   }

   /**
    * @since version 0.85
    *
    * @see CommonDBTM::getSpecificMassiveActions()
   **/
   function getSpecificMassiveActions($checkitem=NULL) {
      $isadmin = static::canUpdate();
      $actions = parent::getSpecificMassiveActions($checkitem);

      if ($_SESSION['glpiactiveprofile']['interface'] == 'central') {
         if ($isadmin) {
            $actions['PluginArchimapGraph'.MassiveAction::CLASS_ACTION_SEPARATOR.'duplicate'] = _x('button', 'Duplicate');

         }
      }
      return $actions;
   }
   
   /**
    * @since version 0.85
    *
    * @see CommonDBTM::showMassiveActionsSubForm()
   **/
   static function showMassiveActionsSubForm(MassiveAction $ma) {

      switch ($ma->getAction()) {
         case "duplicate" :
		    $options = [];
			$options['value'] = 1;
			$options['min'] = 1;
			$options['max'] = 20;
			$options['unit'] = "times";
            Dropdown::showNumber('repeat', $options);
            echo Html::submit(_x('button','Post'), ['name' => 'massiveaction']);
            return true;
            break;
    }
      return parent::showMassiveActionsSubForm($ma);
   }
   
   
   /**
    * @since version 0.85
    *
    * @see CommonDBTM::processMassiveActionsForOneItemtype()
   **/
   static function processMassiveActionsForOneItemtype(MassiveAction $ma, CommonDBTM $item,
                                                       array $ids) {
      global $DB;
      
      $graph_item = new PluginArchimapGraph_Item();
      
      switch ($ma->getAction()) {

            case "duplicate" :
            $input = $ma->getInput();
            if ($item->getType() == 'PluginArchimapConfig') {
            foreach ($ids as $id) {
				  $success = [];
				  $failure = [];
                  $item->getFromDB($id);
				  $values = $item->fields;
				  $key = $values["key"];

                  unset($values["id"]);
				  for ($i = 1 ; $i <= $input['repeat'] ; $i++) {
					$values["key"] = $key . " (Copy $i)";

					if ($item->add($values)) {
						$success[] = $id;
					} else {
						$failure[] = $id;
					}
				  }
				  if ($success) {
				    $ma->itemDone('PluginArchimapConfig', $id, MassiveAction::ACTION_OK);
				  }
				  if ($failure) {
					$ma->itemDone('PluginArchimapConfig', $id, MassiveAction::ACTION_KO);
				  }
               }
            }
            return;

      }
      parent::processMassiveActionsForOneItemtype($ma, $item, $ids);
   }
}

?>
