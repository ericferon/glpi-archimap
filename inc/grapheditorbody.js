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
 
/**
 * Main
 */
if (navigator.userAgent != null && navigator.userAgent.toLowerCase().
	indexOf(' electron/') >= 0 && typeof process !== 'undefined' && process.versions.electron < 5)
{
	// Redirects old Electron app to latest version
	var div = document.getElementById('geInfo');
	
	if (div != null)
	{
		div.innerHTML = '<center><h2>You are using an out of date version of this app.<br>Please download the latest version ' +
			'<a href="https://github.com/jgraph/drawio-desktop/releases/latest" target="_blank">here</a>.</h2></center>';
	}
}
else
{
	if (urlParams['dev'] != '1' && typeof document.createElement('canvas').getContext === "function")
	{
//	 Modified EFE 20200930
//		window.addEventListener('load', function()
//		{
			hideGlpi();
			showDrawio();
//		});
//	 End of Modified EFE 20200930
	}
	else
	{
		if (urlParams['dev'])
		{
			var log = log4javascript.getLogger();
			var ajaxAppender = new log4javascript.AjaxAppender("../front/log4js.php");
			log.addAppender(ajaxAppender);
		}
//	 Modified EFE 20200930
		hideGlpi();
		showDrawio();
//	 End of Modified EFE 20200930
	}
}
