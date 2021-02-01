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

class PluginArchimapGraph_Item extends CommonDBRelation {

   // From CommonDBRelation
   static public $itemtype_1 = "PluginArchimapGraph";
   static public $items_id_1 = 'plugin_archimap_graphs_id';
   static public $take_entity_1 = false ;
    
   static public $itemtype_2 = 'itemtype';
   static public $items_id_2 = 'items_id';
   static public $take_entity_2 = true ;
   
   static $rightname = "plugin_archimap";

   
   /*static function getTypeName($nb=0) {

      if ($nb > 1) {
         return _n('Graph item', 'Graphs items', 2, 'archimap');
      }
      return _n('Graph item', 'Graphs items', 1, 'archimap');
   }*/

   /**
    * Clean table when item is purged
    *
    * @param $item Object to use
    *
    * @return nothing
    **/
   public static function cleanForItem(CommonDBTM $item) {

      $temp = new self();
      $temp->deleteByCriteria(
         array('itemtype' => $item->getType(),
               'items_id' => $item->getField('id'))
      );
   }

   /**
    * Get Tab Name used for itemtype
    *
    * NB : Only called for existing object
    *      Must check right on what will be displayed + template
    *
    * @since version 0.83
    *
    * @param $item            CommonDBTM object for which the tab need to be displayed
    * @param $withtemplate    boolean  is a template object ? (default 0)
    *
    *  @return string tab name
    **/
   public function getTabNameForItem(CommonGLPI $item, $withtemplate=0) {

      if (!$withtemplate) {
         if ($item->getType()=='PluginArchimapGraph'
             && count(PluginArchimapGraph::getTypes(false))) {
            if ($_SESSION['glpishow_count_on_tabs']) {
               return self::createTabEntry(_n('Associated item','Associated items',2), self::countForGraph($item));
            }
            return _n('Associated item','Associated items',2);

         } else if (in_array($item->getType(), PluginArchimapGraph::getTypes(true))
                    && Session::haveRight('plugin_archimap', READ)) {
            if ($_SESSION['glpishow_count_on_tabs']) {
               return self::createTabEntry(PluginArchimapGraph::getTypeName(2), self::countForItem($item));
            }
            return PluginArchimapGraph::getTypeName(2);
         }
      }
      return '';
   }

   /**
    * show Tab content
    *
    * @since version 0.83
    *
    * @param $item                  CommonGLPI object for which the tab need to be displayed
    * @param $tabnum       integer  tab number (default 1)
    * @param $withtemplate boolean  is a template object ? (default 0)
    *
    * @return true
    **/
   public static function displayTabContentForItem(CommonGLPI $item, $tabnum=1, $withtemplate=0) {

      if ($item->getType()=='PluginArchimapGraph') {

         self::showForGraph($item);

      } else if (in_array($item->getType(), PluginArchimapGraph::getTypes(true))) {

         self::showForITem($item);
      }
      return true;
   }

   static function countForGraph(PluginArchimapGraph $item) {

      $types = implode("','", $item->getTypes());
      if (empty($types)) {
         return 0;
      }
      $dbu = new DbUtils();
      return $dbu->countElementsInTable('glpi_plugin_archimap_graphs_items',
                                        ["plugin_archimap_graphs_id" => $item->getID(),
                                         "itemtype"                      => $item->getTypes()
                                        ]);
   }


   static function countForItem(CommonDBTM $item) {

      $dbu = new DbUtils();
      return $dbu->countElementsInTable('glpi_plugin_archimap_graphs_items',
                                        ["itemtype" => $item->getType(),
                                         "items_id" => $item->getID()]);
   }

   function getFromDBbyGraphsAndItem($plugin_archimap_graphs_id,$items_id,$itemtype) {
      global $DB;

      $query = "SELECT * FROM `".$this->getTable()."` " .
         "WHERE `plugin_archimap_graphs_id` = '" . $plugin_archimap_graphs_id . "'
         AND `itemtype` = '" . $items_id . "'
         AND `items_id` = '" . $itemtype . "'";
      if ($result = $DB->query($query)) {
         if ($DB->numrows($result) != 1) {
            return false;
         }
         $this->fields = $DB->fetchAssoc($result);
         if (is_array($this->fields) && count($this->fields)) {
            return true;
         } else {
            return false;
         }
      }
      return false;
   }

   function addItem($values) {

      $this->add(array('plugin_archimap_graphs_id'=>$values["plugin_archimap_graphs_id"],
                        'items_id'=>$values["items_id"],
                        'itemtype'=>$values["itemtype"]));

   }

   function deleteItemByGraphsAndItem($plugin_archimap_graphs_id,$items_id,$itemtype) {

      if ($this->getFromDBbyGraphsAndItem($plugin_archimap_graphs_id,$items_id,$itemtype)) {
         $this->delete(array('id'=>$this->fields["id"]));
      }
   }

   /**
    * @since version 0.84
   **/
   function getForbiddenStandardMassiveAction() {

      $forbidden   = parent::getForbiddenStandardMassiveAction();
      $forbidden[] = 'update';
      return $forbidden;
   }
   /**
    * Show items links to a graph
    *
    * @since version 0.84
    *
    * @param $graph PluginArchimapGraph object
    *
    * @return nothing (HTML display)
    **/
   public static function showForGraph(PluginArchimapGraph $graph) {
      global $DB;

      $instID = $graph->fields['id'];
      if (!$graph->can($instID, READ))   return false;

      $rand=mt_rand();

      $canedit=$graph->can($instID, UPDATE);

      $query = "SELECT DISTINCT `itemtype`
             FROM `glpi_plugin_archimap_graphs_items`
             WHERE `plugin_archimap_graphs_id` = '$instID'
             ORDER BY `itemtype`
             LIMIT ".count(PluginArchimapGraph::getTypes(true));

      $result = $DB->query($query);
      $number = $DB->numrows($result);

      if (Session::isMultiEntitiesMode()) {
         $colsup=1;
      } else {
         $colsup=0;
      }

      if ($canedit) {
         echo "<div class='firstbloc'>";
         echo "<form method='post' name='archimap_form$rand' id='archimap_form$rand'
         action='".Toolbox::getItemTypeFormURL("PluginArchimapGraph")."'>";

         echo "<table class='tab_cadre_fixe'>";
         echo "<tr class='tab_bg_2'><th colspan='".($canedit?(5+$colsup):(4+$colsup))."'>".
            __('Add an item')."</th></tr>";

         echo "<tr class='tab_bg_1'><td colspan='".(3+$colsup)."' class='center'>";
         echo "<input type='hidden' name='plugin_archimap_graphs_id' value='$instID'>";
         Dropdown::showSelectItemFromItemtypes(array('items_id_name' => 'items_id',
                                                     'itemtypes'     => PluginArchimapGraph::getTypes(true),
                                                     'entity_restrict'
                                                                     => ($graph->fields['is_recursive']
                                                        ? getSonsOf('glpi_entities',
                                                                    $graph->fields['entities_id'])
                                                        : $graph->fields['entities_id']),
                                                     'checkright'
                                                                     => true,
                                               ));
         echo "</td>";
         echo "<td colspan='2' class='tab_bg_2'>";
         echo "<input type='submit' name='additem' value=\""._sx('button','Add')."\" class='submit'>";
         echo "</td></tr>";
         echo "</table>" ;
         Html::closeForm();
         echo "</div>" ;
      }

      echo "<div class='spaced'>";
      if ($canedit && $number) {
         Html::openMassiveActionsForm('mass'.__CLASS__.$rand);
         $massiveactionparams = [];
         Html::showMassiveActions($massiveactionparams);
      }
      echo "<table class='tab_cadre_fixe'>";
      echo "<tr>";

      if ($canedit && $number) {
         echo "<th width='10'>".Html::getCheckAllAsCheckbox('mass'.__CLASS__.$rand)."</th>";
      }

      echo "<th>".__('Type')."</th>";
      echo "<th>".__('Name')."</th>";
      if (Session::isMultiEntitiesMode())
         echo "<th>".__('Entity')."</th>";
      echo "<th>".__('Serial number')."</th>";
      echo "<th>".__('Inventory number')."</th>";
      echo "</tr>";

      for ($i=0 ; $i < $number ; $i++) {
         $itemType=$DB->result($result, $i, "itemtype");

         if (!($item = getItemForItemtype($itemType))) {
            continue;
         }

         if ($item->canView()) {
            $column="name";
            $itemTable = getTableForItemType($itemType);

            $query = "SELECT `".$itemTable."`.*,
                             `glpi_plugin_archimap_graphs_items`.`id` AS items_id,
                             `glpi_entities`.`id` AS entity "
               ." FROM `glpi_plugin_archimap_graphs_items`, `".$itemTable
               ."` LEFT JOIN `glpi_entities` ON (`glpi_entities`.`id` = `".$itemTable."`.`entities_id`) "
               ." WHERE `".$itemTable."`.`id` = `glpi_plugin_archimap_graphs_items`.`items_id`
                AND `glpi_plugin_archimap_graphs_items`.`itemtype` = '$itemType'
                AND `glpi_plugin_archimap_graphs_items`.`plugin_archimap_graphs_id` = '$instID' "
               . getEntitiesRestrictRequest(" AND ",$itemTable,'','',$item->maybeRecursive());

            if ($item->maybeTemplate()) {
               $query.=" AND `".$itemTable."`.`is_template` = '0'";
            }
            $query.=" ORDER BY `glpi_entities`.`completename`, `".$itemTable."`.`$column`";

            if ($result_linked=$DB->query($query)) {
               if ($DB->numrows($result_linked)) {

                  Session::initNavigateListItems($itemType,PluginArchimapGraph::getTypeName(2)." = ".$graph->fields['name']);

                  while ($data=$DB->fetchAssoc($result_linked)) {

                     $item->getFromDB($data["id"]);

                     Session::addToNavigateListItems($itemType,$data["id"]);

                     $ID="";

                     if ($_SESSION["glpiis_ids_visible"]||empty($data["name"]))
                        $ID= " (".$data["id"].")";

                     $link=Toolbox::getItemTypeFormURL($itemType);
                     $name= "<a href=\"".$link."?id=".$data["id"]."\">"
                        .$data["name"]."$ID</a>";

                     echo "<tr class='tab_bg_1'>";

                     if ($canedit) {
                        echo "<td width='10'>";
                        Html::showMassiveActionCheckBox(__CLASS__, $data["items_id"]);
                        echo "</td>";
                     }
                     echo "<td class='center'>".$item::getTypeName(1)."</td>";

                     echo "<td class='center' ".(isset($data['is_deleted'])&&$data['is_deleted']?"class='tab_bg_2_2'":"").
                        ">".$name."</td>";

                     if (Session::isMultiEntitiesMode())
                        echo "<td class='center'>".Dropdown::getDropdownName("glpi_entities",$data['entity'])."</td>";

                     echo "<td class='center'>".(isset($data["serial"])? "".$data["serial"]."" :"-")."</td>";
                     echo "<td class='center'>".(isset($data["otherserial"])? "".$data["otherserial"]."" :"-")."</td>";

                     echo "</tr>";
                  }
               }
            }
         }
      }
      echo "</table>";

      if ($canedit && $number) {
         $paramsma['ontop'] =false;
         Html::showMassiveActions($paramsma);
         Html::closeForm();
      }
      echo "</div>";
   }

   /**
   * Show graphs associated to an item
   *
   * @since version 0.84
   *
   * @param $item            CommonDBTM object for which associated graphs must be displayed
   * @param $withtemplate    (default '')
   **/
   static function showForItem(CommonDBTM $item, $withtemplate='') {
      global $DB, $CFG_GLPI;

      $ID = $item->getField('id');

      if ($item->isNewID($ID)) {
         return false;
      }
      if (!Session::haveRight('plugin_archimap', READ)) {
         return false;
      }

      if (!$item->can($item->fields['id'], READ)) {
         return false;
      }

      if (empty($withtemplate)) {
         $withtemplate = 0;
      }

      $canedit       =  $item->canadditem('PluginArchimapGraph');
      $rand          = mt_rand();
      $is_recursive  = $item->isRecursive();

      $query = "SELECT `glpi_plugin_archimap_graphs_items`.`id` AS assocID,
                       `glpi_entities`.`id` AS entity,
                       `glpi_plugin_archimap_graphs`.`name` AS assocName,
                       `glpi_plugin_archimap_graphs`.*
                FROM `glpi_plugin_archimap_graphs_items`
                LEFT JOIN `glpi_plugin_archimap_graphs`
                 ON (`glpi_plugin_archimap_graphs_items`.`plugin_archimap_graphs_id`=`glpi_plugin_archimap_graphs`.`id`)
                LEFT JOIN `glpi_entities` ON (`glpi_plugin_archimap_graphs`.`entities_id`=`glpi_entities`.`id`)
                WHERE `glpi_plugin_archimap_graphs_items`.`items_id` = '$ID'
                      AND `glpi_plugin_archimap_graphs_items`.`itemtype` = '".$item->getType()."' ";

      $query .= getEntitiesRestrictRequest(" AND","glpi_plugin_archimap_graphs",'','',true);

      $query .= " ORDER BY `assocName`";

      $result = $DB->query($query);
      $number = $DB->numrows($result);
      $i      = 0;

      $graphs      = [];
      $graph       = new PluginArchimapGraph();
      $used          = [];
      if ($numrows = $DB->numrows($result)) {
         while ($data = $DB->fetchAssoc($result)) {
            $graphs[$data['assocID']] = $data;
            $used[$data['id']] = $data['id'];
         }
      }

      if ($canedit && $withtemplate < 2) {
         // Restrict entity for knowbase
         $entities = "";
         $entity   = $_SESSION["glpiactive_entity"];

         if ($item->isEntityAssign()) {
            /// Case of personal items : entity = -1 : create on active entity (Reminder case))
            if ($item->getEntityID() >=0 ) {
               $entity = $item->getEntityID();
            }

            if ($item->isRecursive()) {
               $entities = getSonsOf('glpi_entities',$entity);
            } else {
               $entities = $entity;
            }
         }
         $limit = getEntitiesRestrictRequest(" AND ","glpi_plugin_archimap_graphs",'',$entities,true);
         $q = "SELECT COUNT(*)
               FROM `glpi_plugin_archimap_graphs`
               WHERE `is_deleted` = '0'
               $limit";

         $result = $DB->query($q);
         $nb     = $DB->result($result,0,0);

         echo "<div class='firstbloc'>";


         if (Session::haveRight('plugin_archimap', READ)
             && ($nb > count($used))) {
            echo "<form name='graph_form$rand' id='graph_form$rand' method='post'
                   action='".Toolbox::getItemTypeFormURL('PluginArchimapGraph')."'>";
            echo "<table class='tab_cadre_fixe'>";
            echo "<tr class='tab_bg_1'>";
            echo "<td colspan='4' class='center'>";
            echo "<input type='hidden' name='entities_id' value='$entity'>";
            echo "<input type='hidden' name='is_recursive' value='$is_recursive'>";
            echo "<input type='hidden' name='itemtype' value='".$item->getType()."'>";
            echo "<input type='hidden' name='items_id' value='$ID'>";
            if ($item->getType() == 'Ticket') {
               echo "<input type='hidden' name='tickets_id' value='$ID'>";
            }
            
            PluginArchimapGraph::dropdownGraph(array('entity' => $entities ,
                                                     'used'   => $used));

            echo "</td><td class='center' width='20%'>";
            echo "<input type='submit' name='additem' value=\"".
                     _sx('button', 'Associate a graph', 'archimap')."\" class='submit'>";
            echo "</td>";
            echo "</tr>";
            echo "</table>";
            Html::closeForm();
         }

         echo "</div>";
      }

      echo "<div class='spaced'>";
      if ($canedit && $number && ($withtemplate < 2)) {
         Html::openMassiveActionsForm('mass'.__CLASS__.$rand);
         $massiveactionparams = array('num_displayed'  => $number);
         Html::showMassiveActions($massiveactionparams);
      }
      echo "<table class='tab_cadre_fixe'>";

      echo "<tr>";
      if ($canedit && $number && ($withtemplate < 2)) {
         echo "<th width='10'>".Html::getCheckAllAsCheckbox('mass'.__CLASS__.$rand)."</th>";
      }
      echo "<th>".__('Name')."</th>";
      if (Session::isMultiEntitiesMode()) {
         echo "<th>".__('Entity')."</th>";
      }
//      echo "<th>".PluginArchimapGraphState::getTypeName(1)."</th>";
      echo "<th>".PluginArchimapGraphType::getTypeName(1)."</th>";
      echo "<th>".__('Graph Owner', 'archimap')."</th>";
      echo "<th>".__('Graph Maintainer', 'archimap')."</th>";
      echo "</tr>";
      $used = [];

      if ($number) {

         Session::initNavigateListItems('PluginArchimapGraph',
                           //TRANS : %1$s is the itemtype name,
                           //        %2$s is the name of the item (used for headings of a list)
                                        sprintf(__('%1$s = %2$s'),
                                                $item->getTypeName(1), $item->getName()));


         foreach  ($graphs as $data) {
            $graphID        = $data["id"];
            $link             = NOT_AVAILABLE;

            if ($graph->getFromDB($graphID)) {
               $link         = $graph->getLink();
            }

            Session::addToNavigateListItems('PluginArchimapGraph', $graphID);

            $used[$graphID]   = $graphID;
            $assocID             = $data["assocID"];

            echo "<tr class='tab_bg_1".($data["is_deleted"]?"_2":"")."'>";
            if ($canedit && ($withtemplate < 2)) {
               echo "<td width='10'>";
               Html::showMassiveActionCheckBox(__CLASS__, $data["assocID"]);
               echo "</td>";
            }
            echo "<td class='center'>$link</td>";
            if (Session::isMultiEntitiesMode()) {
               echo "<td class='center'>".Dropdown::getDropdownName("glpi_entities", $data['entities_id']).
                    "</td>";
            }
//            echo "<td>".Dropdown::getDropdownName("glpi_plugin_archimap_graphstates",$data["plugin_archimap_graphstates_id"])."</td>";
            echo "<td>".Dropdown::getDropdownName("glpi_plugin_archimap_graphtypes",$data["plugin_archimap_graphtypes_id"])."</td>";
            echo "<td>".Dropdown::getDropdownName("glpi_groups",$data["groups_id"])."</td>";
            echo "<td>";
            echo "<a href=\"".$CFG_GLPI["root_doc"]."/front/group.form.php?id=".$data["groups_id"]."\">";
            echo Dropdown::getDropdownName("glpi_users",$data["users_id"]);
            if ($_SESSION["glpiis_ids_visible"] == 1 )
               echo " (".$data["users_id"].")";
            echo "</a></td>";
            echo "</tr>";
            $i++;
         }
      }


      echo "</table>";
      if ($canedit && $number && ($withtemplate < 2)) {
         $massiveactionparams['ontop'] = false;
         Html::showMassiveActions($massiveactionparams);
         Html::closeForm();
      }
      echo "</div>";
   }
}

?>
