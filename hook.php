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

function plugin_archimap_install() {
   global $DB, $CFG_GLPI;

   include_once (Plugin::getPhpDir("archimap")."/inc/profile.class.php");

   $update=false;
   if ($DB->TableExists("glpi_plugin_archiapp_graphs")) {
      
      $DB->runFile(Plugin::getPhpDir("archimap")."/sql/update-1.0.0.sql");

   }
   if (!$DB->TableExists("glpi_plugin_archimap_graphs")) {

		$DB->runFile(Plugin::getPhpDir("archimap")."/sql/empty-3.1.2.sql");
	}
	else {
		if ($DB->TableExists("glpi_plugin_archimap_graphs") && !$DB->TableExists("glpi_plugin_archimap_configs")) {
			$update=true;
			$DB->runFile(Plugin::getPhpDir("archimap")."/sql/update-3.0.0.sql");
		}
		if ($DB->TableExists("glpi_plugin_archimap_configs")
		&& ($DB->numrows($DB->query("SELECT * from glpi_plugin_archimap_configs where type = 'APP_TOKEN'")) == 0))
			$DB->runFile(Plugin::getPhpDir("archimap")."/sql/update-3.1.0.sql");
        // change path to images as ...archimap/public/drawio-integration/...
        $DB->runFile(Plugin::getPhpDir("archimap")."/sql/update-3.1.1.sql");
	}

   
   if ($DB->TableExists("glpi_plugin_archimap_profiles")) {
   
      $notepad_tables = array('glpi_plugin_archimap_graphs');

      foreach ($notepad_tables as $t) {
         // Migrate data
         if ($DB->FieldExists($t, 'notepad')) {
            $query = "SELECT id, notepad
                      FROM `$t`
                      WHERE notepad IS NOT NULL
                            AND notepad <>'';";
            foreach ($DB->request($query) as $data) {
               $iq = "INSERT INTO `glpi_notepads`
                             (`itemtype`, `items_id`, `content`, `date`, `date_mod`)
                      VALUES ('PluginArchimapGraph', '".$data['id']."',
                              '".addslashes($data['notepad'])."', NOW(), NOW())";
               $DB->queryOrDie($iq, "0.85 migrate notepad data");
            }
            $query = "ALTER TABLE `glpi_plugin_archimap_graphs` DROP COLUMN `notepad`;";
            $DB->query($query);
         }
      }
   }
   
	if ($DB->TableExists("glpi_plugin_archimap_configs")) {
		include (Plugin::getPhpDir("archimap")."/ajax/copystylestodb.php");
	}

   if ($update) {
      $query_="SELECT *
            FROM `glpi_plugin_archimap_profiles` ";
      $result_=$DB->query($query_);
      if ($DB->numrows($result_)>0) {

         while ($data=$DB->fetch_array($result_)) {
            $query="UPDATE `glpi_plugin_archimap_profiles`
                  SET `profiles_id` = '".$data["id"]."'
                  WHERE `id` = '".$data["id"]."';";
            $result=$DB->query($query);

         }
      }

      $query="ALTER TABLE `glpi_plugin_archimap_profiles`
               DROP `name` ;";
      $result=$DB->query($query);

      Plugin::migrateItemType(
         array(2400=>'PluginArchimapGraph'),
         array("glpi_savedsearches", "glpi_savedsearches_users", "glpi_displaypreferences",
               "glpi_documents_items", "glpi_infocoms", "glpi_logs", "glpi_items_tickets"),
         array("glpi_plugin_archimap_graphs_items"));

      Plugin::migrateItemType(
         array(1200 => "PluginAppliancesAppliance",1300 => "PluginWebapplicationsWebapplication"),
         array("glpi_plugin_archimap_graphs_items"));
   }

   PluginArchimapProfile::initProfile();
   PluginArchimapProfile::createFirstAccess($_SESSION['glpiactiveprofile']['id']);
   $migration = new Migration("2.0.0");
   $migration->dropTable('glpi_plugin_archimap_profiles');
   
   return true;
}

function plugin_archimap_uninstall() {
   global $DB;
   
   include_once (Plugin::getPhpDir("archimap")."/inc/profile.class.php");
   include_once (Plugin::getPhpDir("archimap")."/inc/menu.class.php");
   
	$tables = array("glpi_plugin_archimap_graphs",
					"glpi_plugin_archimap_graphs_items",
					"glpi_plugin_archimap_profiles",
					"glpi_plugin_archimap_states",
					"glpi_plugin_archimap_types",
					"glpi_plugin_archimap_configs");

   foreach($tables as $table)
      $DB->query("DROP TABLE IF EXISTS `$table`;");

	$tables_glpi = array("glpi_displaypreferences",
               "glpi_documents_items",
               "glpi_savedsearches",
               "glpi_logs",
               "glpi_items_tickets",
               "glpi_notepads",
               "glpi_dropdowntranslations");

   foreach($tables_glpi as $table_glpi)
      $DB->query("DELETE FROM `$table_glpi` WHERE `itemtype` LIKE 'PluginArchimap%' ;");

   if (class_exists('PluginDatainjectionModel')) {
      PluginDatainjectionModel::clean(array('itemtype'=>'PluginArchimapGraph'));
   }
   
   //Delete rights associated with the plugin
   $profileRight = new ProfileRight();
   foreach (PluginArchimapProfile::getAllRights() as $right) {
      $profileRight->deleteByCriteria(array('name' => $right['field']));
   }
   PluginArchimapMenu::removeRightsFromSession();
   PluginArchimapProfile::removeRightsFromSession();
   
   return true;
}

function plugin_archimap_postinit() {
   global $PLUGIN_HOOKS;

   $PLUGIN_HOOKS['item_purge']['archimap'] = [];

   foreach (PluginArchimapGraph::getTypes(true) as $type) {

      $PLUGIN_HOOKS['item_purge']['archimap'][$type]
         = array('PluginArchimapGraph_Item','cleanForItem');

      CommonGLPI::registerStandardTab($type, 'PluginArchimapGraph_Item');
   }
}

function plugin_archimap_AssignToTicket($types) {

   if (Session::haveRight("plugin_archimap_open_ticket", READ)) {
      $types['PluginArchimapGraph']=PluginArchimapGraph::getTypeName(2);
   }
   return $types;
}


function plugin_archimap_AssignToTicketDropdown($data) {
   global $DB, $CFG_GLPI;

   if ($data['itemtype'] == 'PluginArchimapGraph') {
      $table = getTableForItemType($data["itemtype"]);
      $rand = mt_rand();
      $field_id = Html::cleanId("dropdown_".$data['myname'].$rand);

      $p = array('itemtype'            => $data["itemtype"],
                 'entity_restrict'     => $data['entity_restrict'],
                 'table'               => $table,
                 'myname'              => $data["myname"]);

      if(isset($data["used"]) && !empty($data["used"])){
         if(isset($data["used"][$data["itemtype"]])){
            $p["used"] = $data["used"][$data["itemtype"]];
         }
      }

      echo Html::jsAjaxDropdown($data['myname'], $field_id,
                                 $CFG_GLPI['root_doc']."/ajax/getDropdownFindNum.php",
                                 $p);
      // Auto update summary of active or just solved tickets
      $params = array('items_id' => '__VALUE__',
                      'itemtype' => $data['itemtype']);

      Ajax::updateItemOnSelectEvent($field_id,"item_ticket_selection_information",
                                    $CFG_GLPI["root_doc"]."/ajax/ticketiteminformation.php",
                                    $params);

   } else if ($data['itemtype'] == 'PluginArchimapGraph_Item') {
      $sql = "SELECT `glpi_plugin_archimap_graphs`.`name`, "
              . "    `items_id`, `itemtype`, `glpi_plugin_archimap_graphs_items`.`id` "
              . " FROM `glpi_plugin_archimap_graphs_items`"
              . " LEFT JOIN `glpi_plugin_archimap_graphs`"
              . "    ON `plugin_archimap_graphs_id` = `glpi_plugin_archimap_graphs`.`id`";

      $result = $DB->query($sql);
      $elements = [];
      while ($res = $DB->fetch_array($result)) {
         $itemtype = $res['itemtype'];
         $item = new $itemtype;
         $item->getFromDB($res['items_id']);
         $elements[$res['name']][$res['id']] = $item->getName();
      }
      Dropdown::showFromArray('items_id', $elements, []);
   }
}


function plugin_archimap_AssignToTicketDisplay($data) {
   global $DB;

   if ($data['itemtype'] == 'PluginArchimapGraph_Item') {
      $paGraph = new PluginArchimapGraph();
      $item = new PluginArchimapGraph_Item();
      $itemtype = $data['data']['itemtype'];
      $iteminv = new $itemtype;
      $iteminv->getFromDB($data['data']['items_id']);
      $paGraph->getFromDB($data['data']['plugin_archimap_graphs_id']);

      echo "<tr class='tab_bg_1'>";
      if ($data['canedit']) {
         echo "<td width='10'>";
         Html::showMassiveActionCheckBox('Item_Ticket', $data['data']["IDD"]);
         echo "</td>";
      }
      $typename = "<i>".PluginArchimapGraph::getTypeName()."</i><br/>".
              $iteminv->getTypeName();
      echo "<td class='center top' rowspan='1'>".$typename."</td>";
      echo "<td class='center'>";
      echo "<i>".Dropdown::getDropdownName("glpi_entities", $paGraph->fields['entities_id'])."</i>";
      echo "<br/>";
      echo Dropdown::getDropdownName("glpi_entities", $iteminv->fields['entities_id']);
      echo "</td>";

      $linkGraph     = Toolbox::getItemTypeFormURL('PluginArchimapGraph');
      $namelinkGraph = "<a href=\"".$linkGraph."?id=".
              $paGraph->fields['id']."\">".$paGraph->getName()."</a>";
      $link     = Toolbox::getItemTypeFormURL($data['data']['itemtype']);
      $namelink = "<a href=\"".$link."?id=".$data['data']['items_id']."\">".$iteminv->getName()."</a>";
      echo "<td class='center".
               (isset($iteminv->fields['is_deleted']) && $iteminv->fields['is_deleted'] ? " tab_bg_2_2'" : "'");
      echo "><i>".$namelinkGraph."</i><br/>".$namelink;
      echo "</td>";
      echo "<td class='center'><i>".(isset($paGraph->fields["serial"])? "".$paGraph->fields["serial"]."" :"-").
              "</i><br/>".(isset($iteminv->fields["serial"])? "".$iteminv->fields["serial"]."" :"-").
           "</td>";
      echo "<td class='center'>".
             "<i>".(isset($iteminv->fields["otherserial"])? "".$iteminv->fields["otherserial"]."" :"-")."</i><br/>".
             (isset($iteminv->fields["otherserial"])? "".$iteminv->fields["otherserial"]."" :"-")."</td>";
      echo "</tr>";
      return false;
   }
   return true;
}


function plugin_archimap_AssignToTicketGiveItem($data) {
   if ($data['itemtype'] == 'PluginArchimapGraph_Item') {
      $paGraph = new PluginArchimapGraph();
      $paGraph_item = new PluginArchimapGraph_Item();

      $paGraph_item->getFromDB($data['name']);
      $itemtype = $paGraph_item->fields['itemtype'];
      $paGraph->getFromDB($paGraph_item->fields['plugin_archimap_graphs_id']);
      $item = new $itemtype;
      $item->getFromDB($paGraph_item->fields['items_id']);
      return $item->getLink(array('comments' => true))." (".
              $paGraph->getLink(array('comments' => true)).")";
   }
}


// Define dropdown relations
function plugin_archimap_getGraphRelations() {

   $plugin = new Plugin();
   if ($plugin->isActivated("archimap"))
		return array("glpi_plugin_archimap_graphs"=>array("glpi_plugin_archimap_graphs_items"=>"plugin_archimap_graphs_id"),
					 "glpi_plugin_archimap_types"=>array("glpi_plugin_archimap_graphs"=>"plugin_archimap_types_id"),
					 "glpi_plugin_archimap_states"=>array("glpi_plugin_archimap_graphs"=>"plugin_archimap_states_id"),
					 "glpi_entities"=>array("glpi_plugin_archimap_graphs"=>"entities_id"),
					 "glpi_groups"=>array("glpi_plugin_archimap_graphs"=>"groups_id"),
					 "glpi_users"=>array("glpi_plugin_archimap_graphs"=>"users_id")
					 );
   else
      return [];
}

// Define Dropdown tables to be manage in GLPI :
function plugin_archimap_getDropdown() {

   $plugin = new Plugin();
   if ($plugin->isActivated("archimap"))
		return array('PluginArchimapGraphstate'=>PluginArchimapGraphstate::getTypeName(2),
                'PluginArchimapGraphtype'=>PluginArchimapGraphtype::getTypeName(2) //getTypeName(2) does not work
                );
   else
      return [];
}

////// SEARCH FUNCTIONS ///////() {

function plugin_archimap_getAddSearchOptions($itemtype) {

   $sopt=[];

   if (in_array($itemtype, PluginArchimapGraph::getTypes(true))) {
      if (Session::haveRight("plugin_archimap", READ)) {

         $sopt[2470]['table']         ='glpi_plugin_archimap_graphs';
         $sopt[2470]['field']         ='name';
         $sopt[2470]['name']          = PluginArchimapGraph::getTypeName(2)." - ".__('Name');
         $sopt[2470]['forcegroupby']  = true;
         $sopt[2470]['datatype']      = 'itemlink';
         $sopt[2470]['massiveaction'] = false;
         $sopt[2470]['itemlink_type'] = 'PluginArchimapGraph';
         $sopt[2470]['joinparams']    = ['beforejoin'
                                                => ['table'      => 'glpi_plugin_archimap_graphs_items',
                                                         'joinparams' => ['jointype' => 'itemtype_item']]];


         $sopt[2471]['table']        = 'glpi_plugin_archimap_graphstates';
         $sopt[2471]['field']        = 'name';
         $sopt[2471]['name']         = PluginArchimapGraph::getTypeName(2)." - ".PluginArchimapGraphstate::getTypeName(1);
         $sopt[2471]['forcegroupby'] = true;
         $sopt[2471]['joinparams']   = ['beforejoin' => [
                                                   ['table'      => 'glpi_plugin_archimap_graphs',
                                                         'joinparams' => $sopt[2470]['joinparams']]]];
         $sopt[2471]['datatype']       = 'dropdown';
         $sopt[2471]['massiveaction']  = false;

         $sopt[2472]['table']        = 'glpi_plugin_archimap_graphtypes';
         $sopt[2472]['field']        = 'name';
         $sopt[2472]['name']         = PluginArchimapGraph::getTypeName(2)." - ".PluginArchimapGraphtype::getTypeName(1);
         $sopt[2472]['forcegroupby'] = true;
         $sopt[2472]['joinparams']   = ['beforejoin' => [
                                                   ['table'      => 'glpi_plugin_archimap_graphs',
                                                         'joinparams' => $sopt[2470]['joinparams']]]];
         $sopt[2472]['datatype']       = 'dropdown';
         $sopt[2472]['massiveaction']  = false;
      }
   }
/*   if ($itemtype == 'Ticket') {
      if (Session::haveRight("plugin_archimap", READ)) {
         $sopt[2414]['table']         = 'glpi_plugin_archimap_graphs';
         $sopt[2414]['field']         = 'name';
         $sopt[2414]['linkfield']     = 'items_id';
         $sopt[2414]['datatype']      = 'itemlink';
         $sopt[2414]['massiveaction'] = false;
         $sopt[2414]['name']          = __('Graph', 'archimap')." - ".
                                        __('Name');
      }
   }
*/
   return $sopt;
}

function plugin_archimap_giveItem($type,$ID,$data,$num) {
   global $DB;

   $searchopt=&Search::getOptions($type);
   $table=$searchopt[$ID]["table"];
   $field=$searchopt[$ID]["field"];

   switch ($table.'.'.$field) {
      case "glpi_plugin_archimap_graphs_items.items_id" :
         $query_device = "SELECT DISTINCT `itemtype`
                     FROM `glpi_plugin_archimap_graphs_items`
                     WHERE `plugin_archimap_graphs_id` = '".$data['id']."'
                     ORDER BY `itemtype`";
         $result_device = $DB->query($query_device);
         $number_device = $DB->numrows($result_device);
         $y = 0;
         $out='';
         $graphs=$data['id'];
         if ($number_device>0) {
            for ($i=0 ; $i < $number_device ; $i++) {
               $column = "name";
               $itemtype = $DB->result($result_device, $i, "itemtype");

               if (!class_exists($itemtype)) {
                  continue;
               }
               $item = new $itemtype();
               if ($item->canView()) {
                  $table_item = getTableForItemType($itemtype);

                  $query = "SELECT `".$table_item."`.*, `glpi_plugin_archimap_graphs_items`.`id` AS items_id, `glpi_entities`.`id` AS entity "
                  ." FROM `glpi_plugin_archimap_graphs_items`, `".$table_item
                  ."` LEFT JOIN `glpi_entities` ON (`glpi_entities`.`id` = `".$table_item."`.`entities_id`) "
                  ." WHERE `".$table_item."`.`id` = `glpi_plugin_archimap_graphs_items`.`items_id`
                  AND `glpi_plugin_archimap_graphs_items`.`itemtype` = '$itemtype'
                  AND `glpi_plugin_archimap_graphs_items`.`plugin_archimap_graphs_id` = '".$graphs."' "
                  . getEntitiesRestrictRequest(" AND ",$table_item,'','',$item->maybeRecursive());

                  if ($item->maybeTemplate()) {
                     $query.=" AND `".$table_item."`.`is_template` = '0'";
                  }
                  $query.=" ORDER BY `glpi_entities`.`completename`, `".$table_item."`.`$column`";

                  if ($result_linked = $DB->query($query))
                     if ($DB->numrows($result_linked)) {
                        $item = new $itemtype();
                        while ($data = $DB->fetchAssoc($result_linked)) {
                           if ($item->getFromDB($data['id'])) {
                              $out .= $item::getTypeName(1)." - ".$item->getLink()."<br>";
                           }
                        }
                     } else
                        $out.= ' ';
               } else
                  $out.=' ';
            }
         }
         return $out;
         break;

      case 'glpi_plugin_archimap_graphs.name':
         if ($type == 'Ticket') {
            $graphs_id = [];
            if ($data['raw']["ITEM_$num"] != '') {
               $graphs_id = explode('$$$$', $data['raw']["ITEM_$num"]);
            } else {
               $graphs_id = explode('$$$$', $data['raw']["ITEM_".$num."_2"]);
            }
            $ret = [];
            $paGraph = new PluginArchimapGraph();
            foreach ($graphs_id as $ap_id) {
               $paGraph->getFromDB($ap_id);
               $ret[] = $paGraph->getLink();
            }
            return implode('<br>', $ret);
         }
         break;

   }
   return "";
}

////// SPECIFIC MODIF MASSIVE FUNCTIONS ///////

function plugin_archimap_MassiveActions($type) {

    $plugin = new Plugin();
    if ($plugin->isActivated('archimap')) {
        if (in_array($type,PluginArchimapGraph::getTypes(true))) {
            return ['PluginArchimapGraph'.MassiveAction::CLASS_ACTION_SEPARATOR.'plugin_archimap_add_item' =>
                                                              __('Associate to the diagram', 'archimap')];
        }
    }
    return [];
}

/*
function plugin_archimap_MassiveActionsDisplay($options=[]) {

   $graph=new PluginArchimapGraph;

   if (in_array($options['itemtype'], PluginArchimapGraph::getTypes(true))) {

      $graph->dropdownDataflows("plugin_archimap_graphs_id");
      echo "<input type=\"submit\" name=\"massiveaction\" class=\"submit\" value=\""._sx('button', 'Post')."\" >";
   }
   return "";
}

function plugin_archimap_MassiveActionsProcess($data) {

   $res = array('ok' => 0,
            'ko' => 0,
            'noright' => 0);

   $graph_item = new PluginArchimapGraph_Item();

   switch ($data['action']) {

      case "plugin_archimap_add_item":
         foreach ($data["item"] as $key => $val) {
            if ($val == 1) {
               $input = array('plugin_archimap_graphs_id' => $data['plugin_archimap_graphs_id'],
                              'items_id'      => $key,
                              'itemtype'      => $data['itemtype']);
               if ($graph_item->can(-1,'w',$input)) {
                  if ($graph_item->can(-1,'w',$input)) {
                     $graph_item->add($input);
                     $res['ok']++;
                  } else {
                     $res['ko']++;
                  }
               } else {
                  $res['noright']++;
               }
            }
         }
         break;
   }
   return $res;
}
*/
function plugin_datainjection_populate_graphs() {
   global $INJECTABLE_TYPES;
   $INJECTABLE_TYPES['PluginArchimapGraphInjection'] = 'archimap';
}

/*
function plugin_archimap_addSelect($type,$id,$num) {

   $searchopt = &Search::getOptions($type);
   $table = $searchopt[$id]["table"];
   $field = $searchopt[$id]["field"];
//echo "add select : ".$table.".".$field."<br/>";
   switch ($type) {

      case 'Ticket':

         if ($table.".".$field == "glpi_plugin_archimap_graphs.name") {
            return " GROUP_CONCAT(DISTINCT `glpi_plugin_archimap_graphs`.`id` SEPARATOR '$$$$') AS ITEM_$num, "
                    . " GROUP_CONCAT(DISTINCT `glpi_plugin_archimap_graphs_bis`.`id` SEPARATOR '$$$$') AS ITEM_".$num."_2,";
         }
         break;
   }
}



function plugin_archimap_addLeftJoin($itemtype,$ref_table,$new_table,$linkfield,&$already_link_tables) {

   switch ($itemtype) {

      case 'Ticket':
         return " LEFT JOIN `glpi_plugin_archimap_graphs` AS glpi_plugin_archimap_graphs
            ON (`glpi_items_tickets`.`items_id` = `glpi_plugin_archimap_graphs`.`id`
                  AND `glpi_items_tickets`.`itemtype`='PluginArchimapGraph')

         LEFT JOIN `glpi_plugin_archimap_graphs_items`
            ON (`glpi_items_tickets`.`items_id` = `glpi_plugin_archimap_graphs_items`.`id`
                  AND `glpi_items_tickets`.`itemtype`='PluginArchimapGraph_Item')
         LEFT JOIN `glpi_plugin_archimap_graphs` AS glpi_plugin_archimap_graphs_bis
            ON (`glpi_plugin_archimap_graphs_items`.`plugin_archimap_graphs_id` = `glpi_plugin_archimap_graphs_bis`.`id`)";
         break;

   }
   return "";
}



function plugin_archimap_addWhere($link,$nott,$type,$id,$val,$searchtype) {

   $searchopt = &Search::getOptions($type);
   $table = $searchopt[$id]["table"];
   $field = $searchopt[$id]["field"];

   switch ($type) {

      case 'Ticket':
         if ($table.".".$field == "glpi_plugin_archimap_graphs.name") {
            $out = '';
            switch ($searchtype) {
               case "contains" :
                  $SEARCH = Search::makeTextSearch($val, $nott);
                  break;

               case "equals" :
                  if ($nott) {
                     $SEARCH = " <> '$val'";
                  } else {
                     $SEARCH = " = '$val'";
                  }
                  break;

               case "notequals" :
                  if ($nott) {
                     $SEARCH = " = '$val'";
                  } else {
                     $SEARCH = " <> '$val'";
                  }
                  break;

            }
            if (in_array($searchtype, array('equals', 'notequals'))) {
               if ($table != getTableForItemType($type) || $type == 'States') {
                  $out = " $link (`glpi_plugin_archimap_graphs`.`id`".$SEARCH;
               } else {
                  $out = " $link (`glpi_plugin_archimap_graphs`.`$field`".$SEARCH;
               }
               if ($searchtype=='notequals') {
                  $nott = !$nott;
               }
               // Add NULL if $val = 0 and not negative search
               // Or negative search on real value
               if ((!$nott && $val==0) || ($nott && $val != 0)) {
                  $out .= " OR `glpi_plugin_archimap_graphs`.`id` IS NULL";
               }
//               $out .= ')';
               $out1 = $out;
               $out = str_replace(" ".$link." (", " ".$link." ", $out);
            } else {
               $out = Search::makeTextCriteria("`glpi_plugin_archimap_graphs`.".$field,$val,$nott,$link);
               $out1 = $out;
               $out = preg_replace("/^ $link/", $link.' (', $out);
            }
            $out2 = $out." OR ";
            $out2 .= str_replace("`glpi_plugin_archimap_graphs`",
                                 "`glpi_plugin_archimap_graphs_bis`", $out1)." ";
            $out2 = str_replace("OR   AND", "OR", $out2);
            $out2 = str_replace("OR   OR", "OR", $out2);
            $out2 = str_replace("AND   OR", "OR", $out2);
            $out2 = str_replace("OR  AND", "OR", $out2);
            $out2 = str_replace("OR  OR", "OR", $out2);
            $out2 = str_replace("AND  OR", "OR", $out2);
            return $out2.")";
         }
         break;
   }
}
*/

?>
