<?php


/**
 * ---------------------------------------------------------------------
 * GLPI - Gestionnaire Libre de Parc Informatique
 * Copyright (C) 2015-2020 Teclib' and contributors.
 *
 * http://glpi-project.org
 *
 * based on GLPI - Gestionnaire Libre de Parc Informatique
 * Copyright (C) 2021 by Eric Feron.
 *
 * ---------------------------------------------------------------------
 *
 * LICENSE
 *
 * This file is part of GLPI.
 *
 * GLPI is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * GLPI is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GLPI. If not, see <http://www.gnu.org/licenses/>.
 * ---------------------------------------------------------------------
 */

define('GLPI_ROOT', '../../../../..');
include (GLPI_ROOT . "/inc/includes.php");

$allowed_dirs = ['archimap/public/drawio-integration/images', 'archimap/public/drawio/src/main/webapp/img'];
if (isset($_GET['dir'])) {
	$dir = $_GET['dir'];
//	check that dir is allowed
	$allowed = FALSE;
	foreach ($allowed_dirs as $allowed_dir)
	{
		if (strpos($dir, $allowed_dir) !== FALSE)
		{	$allowed = TRUE;
			break;
		}
	}
	if ($allowed)
	{
		$rootdir = substr($_SERVER['SCRIPT_FILENAME'], 0, strpos($_SERVER['SCRIPT_FILENAME'], '/archimap'));
		$directories = glob($rootdir.$dir.'/*', GLOB_ONLYDIR);
	}
	else
		die("'dir' parameter of GET request to 'getfile.php' is not allowed");
} else {
    die("No 'dir' parameter in GET request to 'getfile.php'");
}
// get image filenames
$filenames = glob($rootdir.$dir.'/*.{jpeg,jpg,png,gif}', GLOB_BRACE);
// get images
$files = [];
foreach ($filenames as $filename)
{
	$files[] = base64_encode(file_get_contents($filename));
}

$data = ["directories" => $directories,
		"filenames" => $filenames,
		"files" => $files];
echo json_encode($data);
?>
