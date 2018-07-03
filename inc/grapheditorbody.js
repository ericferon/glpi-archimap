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
		 * Synchronously adds scripts to the page.
		 */
		function mxscript(src, onLoad, id, dataAppKey, noWrite)
		{
			if (onLoad != null || noWrite)
			{
				var s = document.createElement('script');
				s.setAttribute('type', 'text/javascript');
				s.setAttribute('src', src);
				var r = false;
				
				if (id != null)
				{
					s.setAttribute('id', id);
				}
				
				if (dataAppKey != null)
				{
					s.setAttribute('data-app-key', dataAppKey);
				}
				
				if (onLoad != null)
				{
					s.onload = s.onreadystatechange = function()
					{
						if (!r && (!this.readyState || this.readyState == 'complete'))
						{
				      		r = true;
				      		onLoad();
						}
				  	};
				}
			  	
			  	var t = document.getElementsByTagName('script')[0];
			  	t.parentNode.insertBefore(s, t);
			}
			else
			{
//	Added EFE 20180524
//				document.write('<script src="' + src + '"' + ((id != null) ? ' id="' + id +'" ' : '') +
				document.write('<script src="' + DRAWIO_WEBAPP + '/' + src + '"' + ((id != null) ? ' id="' + id +'" ' : '') +
//	End of Added EFE 20180524
					((dataAppKey != null) ? ' data-app-key="' + dataAppKey +'" ' : '') + '></scr' + 'ipt>');
			}
		};

		/**
		 * Asynchronously adds scripts to the page.
		 */
/*		function mxinclude(src)
		{
			var g = document.createElement('script'); g.type = 'text/javascript'; g.async = true; g.src = src;
		    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(g, s);
		};
		
		// Checks for local storage
		var isLocalStorage = false;
		
		try
		{
			isLocalStorage = urlParams['local'] != '1' && typeof(localStorage) != 'undefined';
		}
		catch (e)
		{
			// ignored
		}

		var t0 = new Date();

		// Changes paths for local development environment
		if (urlParams['dev'] == '1')
		{
			// Used to request grapheditor/mxgraph sources in dev mode
//			var mxDevUrl = document.location.protocol + '//devhost.jgraph.com/mxgraph2';
// Changed EFE 20180319
			var mxDevUrl = DRAWIO_GRAPHEDITOR;
// End of Changed EFE 20180319
			
			if (document.location.protocol == 'file:')
			{
				mxDevUrl = '../../mxgraph2';
				
				// Forces includes for dev environment in node.js
				mxForceIncludes = true;
			}

			var geBasePath = mxDevUrl + '/javascript/examples/grapheditor/www/js';
			var mxBasePath = mxDevUrl + '/javascript/src';
			
			// Used to request draw.io sources in dev mode
// Changed EFE 20180319
			var drawDevUrl = DRAWIO_WEBAPP + '/';
// End of Changed EFE 20180319

			if (urlParams['drawdev'] == '1')
			{
				drawDevUrl = document.location.protocol + '//drawhost.jgraph.com/';
			}
			
			mxscript(drawDevUrl + 'js/diagramly/Init.js');
			mxscript(geBasePath + '/Init.js');
			mxscript(mxDevUrl + '/javascript/src/js/mxClient.js');
			
			// Adds all JS code that depends on mxClient. This indirection via Devel.js is
			// required in some browsers to make sure mxClient.js (and the files that it
			// loads asynchronously) are available when the code loaded in Devel.js runs.
			mxscript(drawDevUrl + 'js/diagramly/Devel.js');
		}
		else
		{
			mxscript(DRAWIO_WEBAPP + '/js/app.min.js');
		}
*/
		// Electron
		if (window && window.process && window.process.type)
		{
			mxscript(DRAWIO_WEBAPP + '/js/diagramly/ElectronApp.js');
		}
		
		// Adds basic error handling
		window.onerror = function()
		{
			var status = document.getElementById('geStatus');
			
			if (status != null)
			{
				status.innerHTML = 'Page could not be loaded. Please try refreshing.';
			}
		};
/**
 * Main
 */
if (urlParams['dev'])
{
	var log = log4javascript.getLogger();
	var ajaxAppender = new log4javascript.AjaxAppender("../front/log4js.php");
	log.addAppender(ajaxAppender);
}
	App.main();

