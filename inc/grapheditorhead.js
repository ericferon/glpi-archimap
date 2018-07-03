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

// URLs for save and export
//		var EXPORT_URL = '/mxgraph/NewExport';
		var DRAWIO_WEBAPP = '../drawio/src/main/webapp';
		var DRAWIO_GRAPHEDITOR = '../mxgraph';

		// Directory for i18 files and basename for main i18n file
//		window.RESOURCES_PATH = window.RESOURCES_PATH || 'resources';
//		window.RESOURCE_BASE = window.RESOURCE_BASE || RESOURCES_PATH + '/dia';

		// URL for logging
		window.DRAWIO_LOG_URL = window.DRAWIO_LOG_URL || '';
		window.mxBasePath = DRAWIO_WEBAPP;

		// Parses URL parameters. Supported parameters are:
		// - lang=xy: Specifies the language of the user interface.
		// - touch=1: Enables a touch-style user interface.
		// - storage=local: Enables HTML5 local storage.
		// - chrome=0: Chromeless mode.
		var urlParams = {'glpi' : '1',
						'dev' : '0',
						'test' : '0',
						'embed' : '0', // suppress menus linked to Google, Dropbox, ...
						'gapi' : '0',
						'pages' : '1', // makes appear the multipage option
						'nowarn' : '1', // suppress the warning message when leaving the canvas
						'tr' : '0', // suppress the load of Trello's jquery library, conflicting with the autocomplete"s jquery one
						'spin' : '0',
						'offline' : '0',
						'libraries' : '0',
						'createindex' : '0',
						'saveAndExit' : '0'
		};

		// hide header, footer and  glpi_tabs div, for full page drawing pane
		function hideGlpi() 
		{
			var header = document.getElementById('header');
			if (header) header.style.display = 'none';
			var footer = document.getElementById('footer');
			if (footer) footer.style.display = 'none';
			var glpitabs = document.getElementsByClassName('glpi_tabs');
			if (glpitabs) glpitabs[0].style.visibility = 'hidden';
		};
		hideGlpi();
		function showDrawio()
		{
			// show the drawing pane (all divs with class starting with "ge")
			$('*[class^="ge"]').css('display', 'initial');
		};
//		showDrawio();

		/**
		 * URL Parameters and protocol description are here:
		 *
		 * https://support.draw.io/pages/viewpage.action?pageId=12878136
		 *
		 * Parameters for developers:
		 *
		 * - dev=1: For developers only
		 * - test=1: For developers only
		 * - drawdev=1: For developers only
		 * - export=URL for export: For developers only
		 * - ignoremime=1: For developers only (see DriveClient.js). Use Cmd-S to override mime.
		 * - createindex=1: For developers only (see etc/build/README)
		 * - filesupport=0: For developers only (see Editor.js in core)
		 * - savesidebar=1: For developers only (see Sidebar.js)
		 * - pages=1: For developers only (see Pages.js)
		 * - lic=email: For developers only (see LicenseServlet.java)
		 * --
		 * - networkshapes=1: For testing network shapes (temporary)
		 */
/*		var urlParams = (function()
		{
			var result = new Object();
			var params = window.location.search.slice(1).split('&');
			
			for (var i = 0; i < params.length; i++)
			{
				idx = params[i].indexOf('=');
				
				if (idx > 0)
				{
					result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
				}
			}
			
			return result;
		})();
*/
		// Forces CDN caches by passing URL parameters via URL hash
		if (window.location.hash != null && window.location.hash.substring(0, 2) == '#P')
		{
			try
			{
				urlParams = JSON.parse(decodeURIComponent(window.location.hash.substring(2)));
				
				if (urlParams.hash != null)
				{
					window.location.hash = urlParams.hash;
				}
			}
			catch (e)
			{
				// ignore
			}
		}
		
		// Redirects page if required
		if (urlParams['dev'] != '1')
		{
			(function()
			{
				var proto = window.location.protocol;
				
				// Electron protocol is file:
				if (proto != 'file:')
				{
					var host = window.location.host;
		
					// Redirects apex and rt to www
					if (host === 'draw.io' || host === 'rt.draw.io')
					{
						host = 'www.draw.io';
					}
					
					var href = proto + '//' + host + window.location.href.substring(
							window.location.protocol.length +
							window.location.host.length + 2);
		
					// Redirects if href changes
					if (href != window.location.href)
					{
						window.location.href = href;
					}
				}
			})();
		}
		
		/**
		 * Adds meta tags with application name (depends on offline URL parameter)
		 */
		(function()
		{
			function addMeta(name, content)
			{
				try
				{
					var s = document.createElement('meta');
					s.setAttribute('name', name);
					s.setAttribute('content', content);
					
				  	var t = document.getElementsByTagName('meta')[0];
				  	t.parentNode.insertBefore(s, t);
				}
				catch (e)
				{
					// ignore
				}
			};
			
			var name = 'draw.io';

			if (urlParams['offline'] === '1')
			{
				name += ' app';
			}
			
			addMeta('apple-mobile-web-app-title', name);
			addMeta('application-name', name);
		})();
