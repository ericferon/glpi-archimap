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

class PluginArchimapGraph extends CommonDBTM {

   public $dohistory=true;
   static $rightname = "plugin_archimap";
   protected $usenotepad         = true;
   
// Register other types to be linked to diagrams
   static $types = ['Computer',
                    'NetworkEquipment',
					'Software',
					'Group',
					'Entity',
					'PluginDatabasesDatabase',
                    'PluginDataflowsDataflow',
                    'PluginArchiswSwcomponent',
                    'PluginWebapplicationsWebapplication'];

   static function getTypeName($nb=0) {

      return _n('Diagram', 'Diagrams', $nb, 'archimap');
   }

   function getTabNameForItem(CommonGLPI $item, $withtemplate=0) {

      if ($item->getType()=='Supplier') {
         if ($_SESSION['glpishow_count_on_tabs']) {
            return self::createTabEntry(self::getTypeName(2), self::countForItem($item));
         }
         return self::getTypeName(2);
      }
      return '';
   }


   static function displayTabContentForItem(CommonGLPI $item, $tabnum=1, $withtemplate=0) {

      if ($item->getType()=='Supplier') {
         $self = new self();
         $self->showPluginFromSupplier($item->getField('id'));
      }
      return true;
   }

   static function countForItem(CommonDBTM $item) {

      $dbu = new DbUtils();
      return $dbu->countElementsInTable('glpi_plugin_archimap_graphs',
                                  "`suppliers_id` = '".$item->getID()."'");
   }

   //clean if diagrams are deleted
   function cleanDBonPurge() {

//      $temp = new PluginArchimapGraph_Item();
//      $temp->deleteByCriteria(['plugin_archimap_graphs_id' => $this->fields['id']]);
   }

   function getSearchOptions() {

      $tab                       = [];
      if (version_compare(GLPI_VERSION,'9.3','ge')) return $tab;

      $tab['common']             = self::getTypeName(2);

      $tab[1]['table']           = $this->getTable();
      $tab[1]['field']           = 'name';
      $tab[1]['name']            = __('Name');
      $tab[1]['datatype']        = 'itemlink';
      $tab[1]['itemlink_type']   = $this->getType();

      $tab[2]['table']			 = $this->getTable();
      $tab[2]['field']			 = 'shortdescription';
      $tab[2]['name']            = __('Description');
      $tab[2]['datatype']        = 'text';

      $tab[5]['table']          = 'glpi_plugin_archimap_graphtypes';
      $tab[5]['field']          = 'name';
      $tab[5]['name']           = PluginArchimapGraphtype::getTypeName(1);
      $tab[5]['datatype']       = 'dropdown';

      $tab[7]['table']           = 'glpi_plugin_archimap_graphs_items';
      $tab[7]['field']           = 'items_id';
      $tab[7]['nosearch']        = true;
      $tab[7]['massiveaction']   = false;
      $tab[7]['name']            = _n('Associated item' , 'Associated items', 2);
      $tab[7]['forcegroupby']    = true;
      $tab[7]['joinparams']      = ['jointype' => 'child'];

/*      $tab[5]['table']          = 'glpi_plugin_archimap_graphstates';
      $tab[5]['field']          = 'name';
      $tab[5]['name']           = PluginArchimapGraphstate::getTypeName(1);
      $tab[5]['datatype']       = 'dropdown';
*/
      $tab[11]['table']          = 'glpi_users';
      $tab[11]['field']          = 'name';
      $tab[11]['linkfield']      = 'users_id';
      $tab[11]['name']           = __('Graph Maintainer', 'archimap');
      $tab[11]['datatype']       = 'dropdown';
      $tab[11]['right']          = 'interface';

      $tab[12]['table']          = 'glpi_groups';
      $tab[12]['field']          = 'name';
      $tab[12]['linkfield']      = 'groups_id';
      $tab[12]['name']           = __('Graph Owner', 'archimap');
      $tab[12]['condition']      = '`is_assign`';
      $tab[12]['datatype']       = 'dropdown';

/*      $tab[13]['table']         ='glpi_plugin_archisw_swcomponents';
      $tab[13]['field']         ='name';
      $tab[13]['name']          = PluginArchiswSwcomponent::getTypeName(2)." - ".__('Name');
      $tab[13]['forcegroupby']  = true;
      $tab[13]['datatype']      = 'itemlink';
      $tab[13]['massiveaction'] = false;
      $tab[13]['itemlink_type'] = 'PluginArchiswSwcomponent';
      $tab[13]['joinparams']    = array('beforejoin'
                                                => array('table'      => 'glpi_plugin_archimap_graphs_items',
                                                         'joinparams' => ['jointype' => 'itemtype_item']));
*/
      $tab[14]['table']          = $this->getTable();
      $tab[14]['field']          = 'date_mod';
      $tab[14]['massiveaction']  = false;
      $tab[14]['name']           = __('Last update');
      $tab[14]['datatype']       = 'datetime';

      $tab[30]['table']          = $this->getTable();
      $tab[30]['field']          = 'id';
      $tab[30]['name']           = __('ID');
      $tab[30]['datatype']       = 'number';

      $tab[80]['table']          = 'glpi_entities';
      $tab[80]['field']          = 'completename';
      $tab[80]['name']           = __('Entity');
      $tab[80]['datatype']       = 'dropdown';
      
      $tab[81]['table']       = 'glpi_entities';
      $tab[81]['field']       = 'entities_id';
      $tab[81]['name']        = __('Entity')."-".__('ID');
      
      return $tab;
   }

   // search fields from GLPI 9.3 on
   function rawSearchOptions() {

      $tab = [];
      if (version_compare(GLPI_VERSION,'9.2','le')) return $tab;

      $tab[] = [
         'id'   => 'common',
         'name' => self::getTypeName(2)
      ];

      $tab[] = [
         'id'            => '1',
         'table'         => $this->getTable(),
         'field'         => 'name',
         'name'          => __('Name'),
         'datatype'      => 'itemlink',
         'itemlink_type' => $this->getType()
      ];

      $tab[] = [
         'id'       => '2',
         'table'    => $this->getTable(),
         'field'    => 'shortdescription',
         'name'     => __('Description'),
         'datatype' => 'text'
      ];

      $tab[] = [
         'id'       => '5',
         'table'    => 'glpi_plugin_archimap_graphtypes',
         'field'    => 'name',
         'name'     => PluginArchimapGraphtype::getTypeName(1),
         'datatype' => 'dropdown'
      ];

      $tab[] = [
         'id'       => '6',
         'table'    => 'glpi_plugin_archimap_graphstates',
         'field'    => 'name',
         'name'     => PluginArchimapGraphstate::getTypeName(1),
         'datatype' => 'dropdown'
      ];

      $tab[] = [
         'id'        => '11',
         'table'     => 'glpi_users',
         'field'     => 'name',
         'linkfield' => 'users_id',
         'name'      => __('Graph Maintainer','archimap'),
         'datatype'  => 'dropdown',
         'right'     => 'interface'
      ];

      $tab[] = [
         'id'        => '12',
         'table'     => 'glpi_groups',
         'field'     => 'name',
         'linkfield' => 'groups_id',
         'name'      => __('Graph Owner','archimap'),
         'condition' => '`is_assign`',
         'datatype'  => 'dropdown'
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
         'id'            => '71',
         'table'         => 'glpi_plugin_archimap_graphs_items',
         'field'         => 'items_id',
         'nosearch'      => true,
         'massiveaction' => false,
         'name'          => _n('Associated item', 'Associated items', 2),
         'forcegroupby'  => true,
         'joinparams'    => [
            'jointype' => 'child'
         ]
      ];

      $tab[] = [
         'id'            => '72',
         'table'         => $this->getTable(),
         'field'         => 'id',
         'name'          => __('ID'),
         'datatype'      => 'number'
      ];

      $tab[] = [
         'id'       => '80',
         'table'    => 'glpi_entities',
         'field'    => 'completename',
         'name'     => __('Entity'),
         'datatype' => 'dropdown'
      ];

      $tab[] = [
         'id'    => '81',
         'table' => 'glpi_entities',
         'field' => 'entities_id',
         'name'  => __('Entity') . "-" . __('ID')
      ];

      return $tab;
   }

   //define header form
   function defineTabs($options=[]) {

      $ong = [];
      $this->addDefaultFormTab($ong);
      $this->addStandardTab('PluginArchimapDiagram', $ong, $options);
      $this->addStandardTab('PluginArchimapGraph_Item', $ong, $options);
//      $this->addStandardTab('PluginArchimapScript', $ong, $options);
//      $this->addStandardTab('Ticket', $ong, $options);
//      $this->addStandardTab('Item_Problem', $ong, $options);
//      $this->addStandardTab('Document_Item', $ong, $options);
      $this->addStandardTab('Notepad', $ong, $options);
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

      $rand = mt_rand();
      $this->initForm($ID, $options);
      $this->showFormHeader($options);

      echo "<tr class='tab_bg_1'>";
      //name of diagrams
      echo "<td>".__('Name')."</td>";
      echo "<td>";
      echo Html::input('name',['value' => $this->fields['name'], 'id' => "name" /*, 'size' => 50*/]);
      echo "</td>";
      //type
      echo "<td>".__('Type').": </td>";
      echo "<td>";
      Dropdown::show('PluginArchimapGraphtype', ['value' => $this->fields['plugin_archimap_graphtypes_id']]);
      echo "</td>";
	  echo "</tr>";
	  
      echo "<tr class='tab_bg_1'>";
      //short description of diagrams
      echo "<td>".__('Short description', 'archimap')."</td>";
      echo "<td colspan='3'>";
      echo Html::input('shortdescription',['value' => $this->fields['shortdescription'], 'id' => "shortdescription", 'option' => 'style="width:100%"']);
      echo "</td>";
	  echo "</tr>";
	  
      echo "<tr class='tab_bg_1'>";
      //data owner
      echo "<td>".__('Graph Owner', 'archimap')."</td><td>";
      Group::dropdown(['name'      => 'groups_id', 
                        'value'     => $this->fields['groups_id'], 
                        'entity'    => $this->fields['entities_id'], 
                        'condition' => ['is_assign' => 1]
                        ]);
      echo "</td>";
      //technical maintainer
      echo "<td>".__('Graph Maintainer', 'archimap')."</td><td>";
      User::dropdown(['name' => "users_id", 'value' => $this->fields["users_id"], 'entity' => $this->fields["entities_id"], 'right' => 'interface']);
      echo "</td>";
      echo "</tr>";
	  
      echo "<tr class='tab_bg_1'>";
      //data owner
      echo "<td>".__('Status')."</td><td>";
      Dropdown::show('PluginArchimapGraphstate', ['value' => $this->fields['plugin_archimap_graphstates_id']]);
      echo "</td>";
      echo "</tr>";

      $this->showFormButtons($options);

      return true;
   }
   
   /**
    * Make a select box for link diagram
    *
    * Parameters which could be used in options array :
    *    - name : string / name of the select (default is plugin_archimap_graphtypes_id)
    *    - entity : integer or array / restrict to a defined entity or array of entities
    *                   (default -1 : no restriction)
    *    - used : array / Already used items ID: not to display in dropdown (default empty)
    *
    * @param $options array of possible options
    *
    * @return nothing (print out an HTML select box)
   **/
   static function dropdownGraph($options=[]) {
      global $DB, $CFG_GLPI;


      $p['name']    = 'plugin_archimap_graphs_id';
      $p['entity']  = '';
      $p['used']    = [];
      $p['display'] = true;

      if (is_array($options) && count($options)) {
         foreach ($options as $key => $val) {
            $p[$key] = $val;
         }
      }

      $where = " WHERE `glpi_plugin_archimap_graphs`.`is_deleted` = '0' ".
                       getEntitiesRestrictRequest("AND", "glpi_plugin_archimap_graphs", '', $p['entity'], true);

      $p['used'] = array_filter($p['used']);
      if (count($p['used'])) {
         $where .= " AND `id` NOT IN (0, ".implode(",",$p['used']).")";
      }

      $query = "SELECT *
                FROM `glpi_plugin_archimap_graphtypes`
                WHERE `id` IN (SELECT DISTINCT `plugin_archimap_graphtypes_id`
                               FROM `glpi_plugin_archimap_graphs`
                             $where)
                ORDER BY `name`";
      $result = $DB->query($query);

      $values = [0 => Dropdown::EMPTY_VALUE];

      while ($data = $DB->fetchAssoc($result)) {
         $values[$data['id']] = $data['name'];
      }
      $rand = mt_rand();
      $out  = Dropdown::showFromArray('_graphtype', $values, ['width'   => '30%',
                                                                     'rand'    => $rand,
                                                                     'display' => false]);
      $field_id = Html::cleanId("dropdown__graphtype$rand");

      $params   = ['graphtype' => '__VALUE__',
                        'entity' => $p['entity'],
                        'rand'   => $rand,
                        'myname' => $p['name'],
                        'used'   => $p['used']];

      $out .= Ajax::updateItemOnSelectEvent($field_id,"show_".$p['name'].$rand,
                                            Plugin::getWebDir("archimap")."/ajax/dropdownTypeArchimap.php",
                                            $params, false);
      $out .= "<span id='show_".$p['name']."$rand'>";
      $out .= "</span>\n";

      $params['graphtype'] = 0;
      $out .= Ajax::updateItem("show_".$p['name'].$rand,
                               Plugin::getWebDir("archimap")."/ajax/dropdownTypeArchimap.php",
                               $params, false);
      if ($p['display']) {
         echo $out;
         return $rand;
      }
      return $out;
   }

   /**
    * For other plugins, add a type to the linkable types
    *
    * @since version 1.3.0
    *
    * @param $type string class name
   **/
   static function registerType($type) {
      if (!in_array($type, self::$types)) {
         self::$types[] = $type;
      }
   }


   /**
    * Type than could be linked to a Rack
    *
    * @param $all boolean, all type, or only allowed ones
    *
    * @return array of types
   **/
   static function getTypes($all=false) {

      if ($all) {
         return self::$types;
      }

      // Only allowed types
      $types = self::$types;

      foreach ($types as $key => $type) {
         if (!class_exists($type)) {
            continue;
         }

         $item = new $type();
         if (!$item->canView()) {
            unset($types[$key]);
         }
      }
      return $types;
   }

   function showPluginFromSupplier($ID,$withtemplate='') {
      global $DB,$CFG_GLPI;

      $item = new Supplier();
      $canread = $item->can($ID,READ);
      $canedit = $item->can($ID,UPDATE);

      $query = "SELECT `glpi_plugin_archimap_graphs`.* "
        ."FROM `glpi_plugin_archimap_graphs` "
        ." LEFT JOIN `glpi_entities` ON (`glpi_entities`.`id` = `glpi_plugin_archimap_graphs`.`entities_id`) "
        ." WHERE `suppliers_id` = '$ID' "
        . getEntitiesRestrictRequest(" AND ","glpi_plugin_archimap_graphs",'','',$this->maybeRecursive());
      $query.= " ORDER BY `glpi_plugin_archimap_graphs`.`name` ";

      $result = $DB->query($query);
      $number = $DB->numrows($result);

      if (Session::isMultiEntitiesMode()) {
         $colsup=1;
      } else {
         $colsup=0;
      }

      if ($withtemplate!=2) echo "<form method='post' action=\"".Plugin::getPhpDir("archimap")."/front/graph.form.php\">";

      echo "<div align='center'><table class='tab_cadre_fixe'>";
      echo "<tr><th colspan='".(4+$colsup)."'>"._n('Graph associated', 'Graphs associated', 2, 'archimap')."</th></tr>";
      echo "<tr><th>".__('Name')."</th>";
      if (Session::isMultiEntitiesMode())
         echo "<th>".__('Entity')."</th>";
//      echo "<th>".PluginArchimapGraphCategory::getTypeName(1)."</th>";
      echo "<th>".__('Type')."</th>";
      echo "<th>".__('Comments')."</th>";

      echo "</tr>";

      while ($data=$DB->fetch_array($result)) {

         echo "<tr class='tab_bg_1".($data["is_deleted"]=='1'?"_2":"")."'>";
         if ($withtemplate!=3 && $canread && (in_array($data['entities_id'],$_SESSION['glpiactiveentities']) || $data["is_recursive"])) {
            echo "<td class='center'><a href='".Plugin::getPhpDir("archimap")."/front/graph.form.php?id=".$data["id"]."'>".$data["name"];
         if ($_SESSION["glpiis_ids_visible"]) echo " (".$data["id"].")";
            echo "</a></td>";
         } else {
            echo "<td class='center'>".$data["name"];
            if ($_SESSION["glpiis_ids_visible"]) echo " (".$data["id"].")";
            echo "</td>";
         }
         echo "</a></td>";
         if (Session::isMultiEntitiesMode())
            echo "<td class='center'>".Dropdown::getDropdownName("glpi_entities",$data['entities_id'])."</td>";
         echo "<td>".Dropdown::getDropdownName("glpi_plugin_archimap_graphtypes",$data["plugin_archimap_graphtypes_id"])."</td>";
         echo "<td>".Dropdown::getDropdownName("glpi_plugin_archimap_servertypes",$data["plugin_archimap_servertypes_id"])."</td>";
         echo "<td>".$data["comment"]."</td></tr>";
      }
      echo "</table></div>";
      Html::closeForm();
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
            $actions['PluginArchimapGraph'.MassiveAction::CLASS_ACTION_SEPARATOR.'install']    = _x('button', 'Associate');
            $actions['PluginArchimapGraph'.MassiveAction::CLASS_ACTION_SEPARATOR.'uninstall'] = _x('button', 'Dissociate');
            $actions['PluginArchimapGraph'.MassiveAction::CLASS_ACTION_SEPARATOR.'duplicate'] = _x('button', 'Duplicate');

            if (Session::haveRight('transfer', READ)
                     && Session::isMultiEntitiesMode()
            ) {
               $actions['PluginArchimapGraph'.MassiveAction::CLASS_ACTION_SEPARATOR.'transfer'] = __('Transfer');
            }
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
         case 'plugin_archimap_add_item':
            self::dropdownGraph([]);
            echo "&nbsp;".
                 Html::submit(_x('button','Post'), ['name' => 'massiveaction']);
            return true;
            break;
         case "install" :
            Dropdown::showSelectItemFromItemtypes(array('items_id_name' => 'item_item',
                                                        'itemtype_name' => 'typeitem',
                                                        'itemtypes'     => self::getTypes(true),
                                                        'checkright'
                                                                        => true,
                                                  ));
            echo Html::submit(_x('button', 'Post'), ['name' => 'massiveaction']);
            return true;
            break;
         case "uninstall" :
            Dropdown::showSelectItemFromItemtypes(array('items_id_name' => 'item_item',
                                                        'itemtype_name' => 'typeitem',
                                                        'itemtypes'     => self::getTypes(true),
                                                        'checkright'
                                                                        => true,
                                                  ));
            echo Html::submit(_x('button', 'Post'), ['name' => 'massiveaction']);
            return true;
            break;
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
         case "transfer" :
            Dropdown::show('Entity');
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
         case "plugin_archimap_add_item":
            $input = $ma->getInput();
            foreach ($ids as $id) {
               $input = array('plugin_archimap_graphtypes_id' => $input['plugin_archimap_graphtypes_id'],
                                 'items_id'      => $id,
                                 'itemtype'      => $item->getType());
               if ($graph_item->can(-1,UPDATE,$input)) {
                  if ($graph_item->add($input)) {
                     $ma->itemDone($item->getType(), $id, MassiveAction::ACTION_OK);
                  } else {
                     $ma->itemDone($item->getType(), $ids, MassiveAction::ACTION_KO);
                  }
               } else {
                  $ma->itemDone($item->getType(), $ids, MassiveAction::ACTION_KO);
               }
            }

            return;
         case "transfer" :
            $input = $ma->getInput();
            if ($item->getType() == 'PluginArchimapGraph') {
            foreach ($ids as $key) {
                  $item->getFromDB($key);
                  $type = PluginArchimapGraphtype::transfer($item->fields["plugin_archimap_graphtypes_id"], $input['entities_id']);
                  if ($type > 0) {
                     $values["id"] = $key;
                     $values["plugin_archimap_Graphtypes_id"] = $type;
                     $item->update($values);
                  }

                  unset($values);
                  $values["id"] = $key;
                  $values["entities_id"] = $input['entities_id'];

                  if ($item->update($values)) {
                     $ma->itemDone($item->getType(), $key, MassiveAction::ACTION_OK);
                  } else {
                     $ma->itemDone($item->getType(), $key, MassiveAction::ACTION_KO);
                  }
               }
            }
            return;

         case 'install' :
            $input = $ma->getInput();
            foreach ($ids as $key) {
               if ($item->can($key, UPDATE)) {
                  $values = ['plugin_archimap_graphs_id' => $key,
                                 'items_id'      => $input["item_item"],
                                 'itemtype'      => $input['typeitem']];
                  if ($graph_item->add($values)) {
                     $ma->itemDone($item->getType(), $key, MassiveAction::ACTION_OK);
                  } else {
                     $ma->itemDone($item->getType(), $key, MassiveAction::ACTION_KO);
                  }
               } else {
                  $ma->itemDone($item->getType(), $key, MassiveAction::ACTION_NORIGHT);
                  $ma->addMessage($item->getErrorMessage(ERROR_RIGHT));
               }
            }
            return;
            
         case 'uninstall':
            $input = $ma->getInput();
            foreach ($ids as $key) {
               if ($val == 1) {
                  if ($graph_item->deleteItemByGraphsAndItem($key,$input['item_item'],$input['typeitem'])) {
                     $ma->itemDone($item->getType(), $key, MassiveAction::ACTION_OK);
                  } else {
                     $ma->itemDone($item->getType(), $key, MassiveAction::ACTION_KO);
                  }
               }
            }
            return;

         case "duplicate" :
            $input = $ma->getInput();
            if ($item->getType() == 'PluginArchimapGraph') {
            foreach ($ids as $key) {
				  $success = [];
				  $failure = [];
                  $item->getFromDB($key);
				  $values = $item->fields;
				  $name = $values["name"];

                  unset($values["id"]);
				  for ($i = 1 ; $i <= $input['repeat'] ; $i++) {
					$values["name"] = $name . " (Copy $i)";

					$newid = $item->add($values); // copy and save the (new) id
					if ($newid) { 
						$item->link($newid, $values["graph"], " "); // link the new diagram with graph elements
						$success[] = $key;
					} else {
						$failure[] = $key;
					}
				  }
				  if ($success) {
				    $ma->itemDone('PluginArchimapGraph', $key, MassiveAction::ACTION_OK);
				  }
				  if ($failure) {
					$ma->itemDone('PluginArchimapGraph', $key, MassiveAction::ACTION_KO);
				  }
               }
            }
            return;

      }
      parent::processMassiveActionsForOneItemtype($ma, $item, $ids);
   }
   function link($ID, $newgraph, $oldgraph=NULL) {
		global $DB;
		// analyze new version
		libxml_use_internal_errors(true);
		$newxml=simplexml_load_string(htmlspecialchars_decode(stripslashes(rawurldecode($newgraph)))); //parse the decoded and stripped xml representing a graph
		foreach( libxml_get_errors() as $error ) {
			Toolbox::logInFile('graph', 'error='.print_r($error));
		}
		$newelements = [];
		foreach($newxml->diagram as $newdiagram) {
			$diagram = urldecode(zlib_decode(base64_decode($newdiagram, TRUE))); // decode the base64, decompress (inflate) and url-decode the diagram
			$diagramxml = simplexml_load_string($diagram); // load the xml into a structure
			foreach($diagramxml->xpath('//Array[@autocompleteobject]') as $customelement) { // find elements with 'autocompleteobject' in customproperties
               $itemtype = (string)$customelement['autocompleteobject']; // get the 'autocompleteobject' attribute
               $item_id = (string)$customelement['glpi_id']; // get the 'glpi_id' attribute
               if (!empty($itemtype) && !empty($item_id))
                  isset($newelements[$itemtype][$item_id])? $newelements[$itemtype][$item_id] += 1 : $newelements[$itemtype][$item_id] = 0;
               $itemtype = "";
               $item_id ="";
			}
		}
		// analyze previous version (still present in DB)
		if (!$oldgraph)
			$oldgraph = $this->fields['graph'];
		$oldxml=simplexml_load_string(htmlspecialchars_decode(stripslashes(rawurldecode($oldgraph)))); //parse the decoded and stripped xml representing a graph
		foreach( libxml_get_errors() as $error ) {
			Toolbox::logInFile('graph', 'error='.print_r($error));
		}
		$oldelements = [];
		if ($oldxml)
		{
			foreach($oldxml->diagram as $olddiagram) {
				$diagram = urldecode(zlib_decode(base64_decode($olddiagram, TRUE))); // decode the base64, decompress (inflate) and url-decode the diagram
				$diagramxml = simplexml_load_string($diagram); // load the xml into a structure
				foreach($diagramxml->xpath('//Array[@autocompleteobject]') as $customelement) { // find elements with 'autocompleteobject' in customproperties
                     $itemtype = (string)$customelement['autocompleteobject']; // get the 'autocompleteobject' attribute
                     $item_id = (string)$customelement['glpi_id']; // get the 'glpi_id' attribute
                     if (!empty($itemtype) && !empty($item_id))
                        isset($oldelements[$itemtype][$item_id])? $oldelements[$itemtype][$item_id] += 1 : $oldelements[$itemtype][$item_id] = 0;
                     $itemtype = "";
                     $item_id ="";
				}
			}
			// look for deleted elements and delete them in table glpi_plugin_archimap_graphs_items
			foreach($oldelements as $itemtype => $arr_id) { // loop through oldelements
				$itemlist = "";
				$query = "delete from glpi_plugin_archimap_graphs_items where plugin_archimap_graphs_id = ".$ID/*$this->fields['id']*/." and itemtype = '".$itemtype."' and items_id in (" ;
					foreach($arr_id as $item_id => $count) {
					if (!isset($newelements[$itemtype][$item_id])) { // if it doesn't exist in newelement
						$itemlist .= $item_id.","; // it is added to the list of elements to be suppressed
					}
				}
				if (strlen($itemlist) > 1) {
					$itemlist = substr($itemlist, 0, -1); // remove last comma
					$query .= $itemlist.")";
					$result=$DB->query($query);
				}
			}
		}
		// look for new elements and add them in table glpi_plugin_archimap_graphs_items
		foreach($newelements as $itemtype => $arr_id) { // loop through newelements
			$itemlist = "";
			$query = "INSERT IGNORE glpi_plugin_archimap_graphs_items (plugin_archimap_graphs_id,items_id,itemtype) values ";
			foreach($arr_id as $item_id => $count) {
				if (!isset($oldelements[$itemtype][$item_id])) { // if it doesn't exist in oldelement
					if ($item_id)
						$itemlist .= "(".$ID/*$this->fields['id']*/.",".$item_id.",'".$itemtype."'),"; // add it to the list of elements to be inserted
				}
			}
			if (strlen($itemlist) > 1) {
				$itemlist = substr($itemlist, 0, -1); // remove last comma
				$query .= $itemlist;
				$result=$DB->query($query);
			}
		}
	}
}

?>
