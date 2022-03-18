<?php
/*
 -------------------------------------------------------------------------
 Archimap plugin for GLPI
 Copyright (C) 2009-2021 by Eric Feron.
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

   function showForm (CommonGLPI $item, $options=[]) {

      if (!$this->canView()) return false;

//      echo "<tr><td>graph content</td><td>";
//      Html::autocompletionTextField($item,"graph",array('size' => "20"));
		Html::autocompletionTextField($item,"id",array('size' => "20", 'option' => "type='hidden'"));
		Html::autocompletionTextField($item,"name",array('size' => "20", 'option' => "type='hidden'"));
		Html::autocompletionTextField($item,"graph",array('size' => "20", 'option' => "type='hidden'"));
//      echo "</td></tr>";
//		get list of file names in drawio-integration/libraries to upload custom libraries
		$customlibs = [];
		$customlibslist = glob(Plugin::getPhpDir("archimap").'/drawio-integration/libraries/*.xml');
		if ($customlibslist) {
			foreach ($customlibslist as $filename) 
			{	$p = pathinfo($filename);
				$customlibs[] = $p['filename'];
			}
		}

//		echo "<script type=\"text/javascript\">$('*[class^=\"ge\"]').css('display', 'inherit');</script>\n";
//		create a "user" javascript object for passing GLPI user name, role and language
		echo "<script>if (typeof module === 'object') {window.module = module; module = undefined;}</script>\n"; // to solve error message "jQuery is not defined" (cfr https://stackoverflow.com/questions/45741173/jquery-is-not-defined-within-jquery-ui)
		echo "<script type=\"text/javascript\">window.plugin_rootdir = '".Plugin::getPhpDir("archimap")."';</script>\n"; // plugin's root dir
		echo "<script type=\"text/javascript\">var user = {}; user.name = '".$_SESSION['glpiname']."'; user.role = '".$_SESSION['glpiactiveprofile']['name']."'; user.language = '".$_SESSION['glpilanguage']."'; user.user_token = '".User::getToken($_SESSION['glpiID'], 'api_token')."';</script>\n"; // get active profile name (e.g "super-admin", ...)
//		create a "customlibs" javascript object for passing an array of custom libraries
		echo "<script type=\"text/javascript\">var customlibs = ".json_encode($customlibs).";</script>\n"; // get list of file names in drawio-integration/libraries to upload custom libraries
		echo "<div class=\"geEditor\" style=\"position:relative;width:100%;overflow;cursor:default;margin-left:auto;margin-right:auto;\">\n";
		echo "<link rel=\"stylesheet\" type=\"text/css\" href=\"../drawio/src/main/webapp/styles/grapheditor.css\">\n";

		echo "<script type=\"text/javascript\" src=\"../inc/grapheditorhead.js\"></script>\n";
		echo "<div><p>Please ensure JavaScript is enabled.</p><button type=\"button\" onclick=\"hideGlpi();showDrawio()\">".__('Load diagram', 'archimap')."</button></div>\n";
//		echo "<script type=\"text/javascript\" src=\"../drawio/src/main/webapp/js/log4javascript/log4javascript.js\"></script>\n";
		echo "<script type=\"text/javascript\" src=\"../drawio-integration/diagram-editor.js\"></script>\n";
		echo "<script type=\"text/javascript\" src=\"../inc/grapheditorbody.js\"></script>\n";
		echo "</div>\n";

		require_once Plugin::getPhpDir("archimap")."/drawio-integration/ext/js-fileexplorer/server-side-helpers/file_explorer_fs_helper.php";

		$options = array(
		"base_url" => Plugin::getWebDir("archimap")."/drawio-integration/images/",
		"protect_depth" => 1,  // Protects base directory + additional directory depth.
		"recycle_to" => "Recycle Bin",
		"temp_dir" => "/tmp",
		"dot_folders" => false,  // .git, .svn, .DS_Store
		"allowed_exts" => ".jpg, .jpeg, .png, .gif, .svg, .txt",
		"allow_empty_ext" => false,
		"thumbs_dir" => Plugin::getPhpDir("archimap")."/drawio-integration/images",
		"thumbs_url" => Plugin::getWebDir("archimap")."/drawio-integration/images/",
//		"thumb_create_url" => "https://localhost/fileexplorer?action=file_explorer_thumbnail&xsrftoken=qwerasdf",
		"refresh" => true,
		"rename" => false,
		"file_info" => false,
		"load_file" => false,
		"save_file" => false,
		"new_folder" => false,
		"new_file" => ".txt",
		"upload" => true,
		"upload_limit" => 20000000,  // -1 for unlimited or an integer
		"download" => false, //"user123-" . date("Y-m-d_H-i-s") . ".zip",
		"download_module" => "",  // Server handler for single-file downloads:  "" (none), "sendfile" (Apache), "accel-redirect" (Nginx)
		"download_module_prefix" => "",  // A string to prefix to the filename.  (For URI /protected access mapping for a Nginx X-Accel-Redirect to the system root)
		"copy" => false,
		"move" => false,
		"recycle" => false,
		"delete" => false
	);

		FileExplorerFSHelper::HandleActions("file_explorer_refresh", "file_explorer_", Plugin::getPhpDir("archimap")."/drawio-integration/images", $options);


//      $options['candel'] = false;
//      $this->showFormButtons($options);

      return true;
   }

}

?>
