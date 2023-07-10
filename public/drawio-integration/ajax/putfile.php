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

if (isset($_GET['dir'])) {
	$dir = $_GET['dir'];
	if (strpos($dir,'.') !== false)
		die("No '.' allowed in 'dir' parameter of POST request 'putfile'");
} else {
    die("No 'dir' parameter in POST request 'putfile'");
}
if (isset($_GET['filename'])) {
	$filename = rawurldecode($_GET['filename']);
	if (strpos($filename,'.') !== false)
		die("No '.' allowed in 'filename' parameter of POST request 'putfile'");
} else {
    die("No 'filename' parameter in POST request 'putfile'");
}
if (isset($_GET['extension'])) {
//	$extension = rawurldecode($_GET['extension']);
    $extension = preg_replace("/[^a-zA-Z]+/", "", rawurldecode($_GET['extension']));
    if (!in_array(strtolower($extension), [ 'jpg', 'jpeg', 'gif', 'png' ])) {
        die("invalid 'extension' parameter in POST request 'putfile'");
    }
} else {
    die("No 'extension' parameter in POST request 'putfile'");
}
$data = file_get_contents('php://input');
// check and suppress "data:image/png;base64,", at the start of the data
if (preg_match('/^data:image\/(\w+);base64,/', $data, $type)) {
    $data = substr($data, strpos($data, ',') + 1);
    $type = strtolower($type[1]); // jpg, png, gif

    if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
        die("invalid image type in POST body 'putfile'");
    }
    $data = str_replace( ' ', '+', $data );
    $data = base64_decode($data);

    if ($data === false) {
        die("base64_decode failed in POST body 'putfile'");
    }
} else {
    die("POST body 'putfile' did not match with image data");
}

file_put_contents("img.{$type}", $data);
if (file_put_contents(getcwd().'/../'.$dir.'/'.$filename.'.'.$extension, $data) === false)
{
	header('HTTP/1.1 500 Internal Server Error saving file '.getcwd().'/../'.$dir.'/'.$filename.$extension);
} else {
	header('HTTP/1.1 200 OK');
	Toolbox::logInFile('putfile', getcwd().'/../'.$dir.'/'.$filename.'.'.$extension." saved\n");
}
?>
