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

		// Parses URL parameters. Supported parameters are:
		// - lang=xy: Specifies the language of the user interface.
		// - touch=1: Enables a touch-style user interface.
		// - storage=local: Enables HTML5 local storage.
		// - chrome=0: Chromeless mode.
/*		var urlParams = {'glpi' : '1',
						'dev' : '0',
//						'test' : '0',
//						'embed' : '0', // suppress menus linked to Google, Dropbox, ...
//						'gapi' : '0', // Disables the Google integration
//						'db' : '0', // Disables the Dropbox integration
//						'od' : '0', // Disables the OneDrive integration
//						'tr' : '0', // Disables the Trello integration
//						'gh' : '0', // Disables the GitHub integration.
//						'gl' : '0', // Disables the GitLab integration.
						'math' : '0', // Disables MathJax support
						'pages' : '1', // makes appear the multipage option
						'nowarn' : '1', // suppress the warning message when leaving the canvas
//						'tr' : '0', // suppress the load of Trello's jquery library, conflicting with the autocomplete"s jquery one
						'spin' : '0',
						'offline' : '0',
						'libraries' : '0',
						'libs' : 'archimate3;bpmn;uml', Specifies the current libraries. Possible keys are allied_telesis, android, archimate, archimate3, arrows2, atlassian, aws3, aws3d, aws4, azure, basic, bootstrap, bpmn, cabinets, cisco, cisco_safe, citrix, clipart, dfd, eip, electrical, er, floorplan, flowchart, gcp2, general, gmdl, ibm, images, infographic, ios, lean_mapping, mockups, mscae, network, office, pid, rack, signs, sitemap, sysml, uml, veeam and webicons.
//						'clibs' : 'sibarchi', //Specifies custom libraries (keys are file IDs or URLs with a U-prefix)
						'splash' : '0', // Does not show the splash screen
						'picker' : '0', // Disables/enables the Google file picker in dialogs
						'browser' : '0', // Disables local storage as a storage location (0) or shows the browser option in the storage dialog (1)
						'createindex' : '0',
						'saveAndExit' : '0'
		};
*/
		/**
		 * URL Parameters and protocol description are here:
		 *
		 * https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported
		 *
		 * Parameters for developers:
		 *
		 * - dev=1: For developers only
		 * - test=1: For developers only
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
		var urlParams = (function()
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
		
// Load saved settings (sidebar libraries, custom libraries, ...), if any
		var mxLoadSettings = true;

// URLs for save and export
//		var EXPORT_URL = '/mxgraph/NewExport';
		window.DRAWIO_WEBAPP = '../public/drawio/src/main/webapp';
		
		// URLs for save and export (from js/mxgraph/Init.js)
		window.EXPORT_URL = window.EXPORT_URL || '/export';
		window.SAVE_URL = window.SAVE_URL || '/save';
		window.OPEN_URL = window.OPEN_URL || '/open';
//		window.RESOURCES_PATH = window.RESOURCES_PATH || window.DRAWIO_WEBAPP + '/resources';
		window.STENCIL_PATH = window.STENCIL_PATH || window.DRAWIO_WEBAPP + '/stencils';
		window.IMAGE_PATH = window.IMAGE_PATH || window.DRAWIO_WEBAPP + '/images';
		window.STYLE_PATH = window.STYLE_PATH || window.DRAWIO_WEBAPP + '/styles';
		window.CSS_PATH = window.CSS_PATH || window.DRAWIO_WEBAPP + '/styles';
		window.OPEN_FORM = window.OPEN_FORM || 'open.html';

		// Paths and files (from js/diagramly/Init.js)
		window.SHAPES_PATH = window.SHAPES_PATH || window.DRAWIO_WEBAPP + '/shapes';
		// Path for images inside the diagram
		window.GRAPH_IMAGE_PATH = window.GRAPH_IMAGE_PATH || window.DRAWIO_WEBAPP + '/img';
		window.ICONSEARCH_PATH = window.ICONSEARCH_PATH || (((navigator.userAgent != null && navigator.userAgent.indexOf('MSIE') >= 0) ||
			urlParams['dev']) && window.location.protocol != 'file:' ? 'iconSearch' : 'https://app.diagrams.net/iconSearch');
		window.TEMPLATE_PATH = window.TEMPLATE_PATH || window.DRAWIO_WEBAPP + '/templates';
		window.NEW_DIAGRAM_CATS_PATH = window.NEW_DIAGRAM_CATS_PATH || window.DRAWIO_WEBAPP + '/newDiagramCats';
		window.PLUGINS_BASE_PATH = window.PLUGINS_BASE_PATH || window.DRAWIO_WEBAPP + '';

		// Directory for i18 files and basename for main i18n file
		window.RESOURCES_PATH = window.RESOURCES_PATH || window.DRAWIO_WEBAPP + '/resources';
		window.RESOURCE_BASE = window.RESOURCE_BASE || RESOURCES_PATH + '/dia';

		// URL for logging
		window.DRAWIO_LOG_URL = window.DRAWIO_LOG_URL || '';

// Modified EFE 20200930
		// GLPI embedding
		window.mxBasePath = window.DRAWIO_WEBAPP + '/mxgraph';
		window.mxLoadStylesheets = false;
		window.REALTIME_URL = window.REALTIME_URL || (window.DRAWIO_WEBAPP + 'cache');
		window.DRAWIOINTEGRATION_PATH = '../public/drawio-integration';
// End of Modified EFE 20200930

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
		
		// Global variable for desktop
// Modified EFE 20200930
//		var mxIsElectron = window && window.process && window.process.type;
		var mxIsElectron = window && window.process && window.process.type || false;
// End of Modified EFE 20200930

		// Redirects page if required
		if (urlParams['dev'] != '1')
		{
			(function()
			{
				var proto = window.location.protocol;
				
				if (!mxIsElectron)
				{
					var host = window.location.host;
		
					// Redirects apex, drive and rt to www
					if (host === 'draw.io' || host === 'rt.draw.io' || host === 'drive.draw.io')
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
		 * Adds meta tag to the page.
		 */
		function mxmeta(name, content, httpEquiv)
		{
			try
			{
				var s = document.createElement('meta');
				
				if (name != null) 
				{
					s.setAttribute('name', name);
				}

				s.setAttribute('content', content);
				
				if (httpEquiv != null) 
				{
					s.setAttribute('http-equiv', httpEquiv);
				}

			  	var t = document.getElementsByTagName('meta')[0];
			  	t.parentNode.insertBefore(s, t);
			}
			catch (e)
			{
				// ignore
			}
		};
		
		/**
		 * Synchronously adds scripts to the page.
		 */
		function mxscript(src, onLoad, id, dataAppKey, noWrite)
		{
			var defer = onLoad == null && !noWrite;
			
//	Added EFE 20200501
			var type = src.substring(src.lastIndexOf('.')+1, src.length) || src;
//			if ((urlParams['dev'] != '1' && typeof document.createElement('canvas').getContext === "function") ||
//				onLoad != null || noWrite)
			if (((urlParams['dev'] != '1' && typeof document.createElement('canvas').getContext === "function") ||
				onLoad != null || noWrite) && type != "css")
//	End of Added EFE 20200501
			{
				var s = document.createElement('script');
				s.setAttribute('type', 'text/javascript');
				s.setAttribute('defer', 'true');
//	Added EFE 20200501
				if (src.substring(0,4) == 'http')
				{
					s.setAttribute('src', src);
				}
				else
				{
					s.setAttribute('src', window.DRAWIO_WEBAPP + '/' + src);
				}
//				s.setAttribute('src', src);
//	End of Added EFE 20200501

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
					var r = false;
				
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
			  	
			  	if (t != null)
			  	{
			  		t.parentNode.insertBefore(s, t);
			  	}
			}
			else
			{
//	Added EFE 20200501
				if (type == 'css')
				{
					var link = document.createElement( "link" );
					link.type = "text/css";
					link.rel = "stylesheet";
					if (src.substring(0,4) == 'http')
					{
						link.href = src;
					}
					else
					{
						link.href = window.DRAWIO_WEBAPP + '/' + src;
					}
					document.getElementsByTagName( "head" )[0].appendChild( link );
				}
				else
				{
					if (src.substring(0,4) == 'http')
					{
						document.write('<script src="' + src + '"' + ((id != null) ? ' id="' + id +'" ' : '') +
						((dataAppKey != null) ? ' data-app-key="' + dataAppKey +'" ' : '') + '></scr' + 'ipt>');
					}
					else
					{
						document.write('<script src="' + window.DRAWIO_WEBAPP + '/' + src + '"' + ((id != null) ? ' id="' + id +'" ' : '') +
						((dataAppKey != null) ? ' data-app-key="' + dataAppKey +'" ' : '') + '></scr' + 'ipt>');
					}
				}
//				document.write('<script src="' + src + '"' + ((id != null) ? ' id="' + id +'" ' : '') +
//					((dataAppKey != null) ? ' data-app-key="' + dataAppKey +'" ' : '') + '></scr' + 'ipt>');
//	End of Added EFE 20200501
			}
		};

		/**
		 * Asynchronously adds scripts to the page.
		 */
		function mxinclude(src)
		{
			var g = document.createElement('script');
			g.type = 'text/javascript';
			g.async = true;
			g.src = src;
			
		    var s = document.getElementsByTagName('script')[0];
		    s.parentNode.insertBefore(g, s);
		};
		
		/**
		 * Adds meta tags with application name (depends on offline URL parameter)
		 */
		(function()
		{
			var name = 'diagrams.net';
			mxmeta('apple-mobile-web-app-title', name);
			mxmeta('application-name', name);

			if (mxIsElectron)
			{
				mxmeta(null, 'default-src \'self\' \'unsafe-inline\'; connect-src \'self\' https://*.draw.io https://fonts.googleapis.com https://fonts.gstatic.com; img-src * data:; media-src *; font-src *; style-src-elem \'self\' \'unsafe-inline\' https://fonts.googleapis.com', 'Content-Security-Policy');
			}
		})();
		
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
			var mxDevUrl = document.location.protocol + '//devhost.jgraph.com/mxgraph2';
			
			// Used to request draw.io sources in dev mode
			var drawDevUrl = document.location.protocol + '//devhost.jgraph.com/drawio/src/main/webapp/';
			
			if (document.location.protocol == 'file:')
			{
				mxDevUrl = '../../../../../mxgraph2';
				drawDevUrl = './';
				
				// Forces includes for dev environment in node.js
				mxForceIncludes = true;
			}

			var geBasePath = mxDevUrl + '/javascript/examples/grapheditor/www/js';
			var mxBasePath = mxDevUrl + '/javascript/src';
			
			mxscript(drawDevUrl + 'js/PreConfig.js');
			mxscript(drawDevUrl + 'js/diagramly/Init.js');
			mxscript(geBasePath + '/Init.js');
			mxscript(mxDevUrl + '/javascript/src/js/mxClient.js');
			
			// Adds all JS code that depends on mxClient. This indirection via Devel.js is
			// required in some browsers to make sure mxClient.js (and the files that it
			// loads asynchronously) are available when the code loaded in Devel.js runs.
			mxscript(drawDevUrl + 'js/diagramly/Devel.js');
			mxscript(drawDevUrl + 'js/PostConfig.js');
		}
		else
		{
			(function()
			{
				var hostName = window.location.hostname;
				
				// Supported domains are *.draw.io and the packaged version in Quip
				var supportedDomain = (hostName.substring(hostName.length - 8, hostName.length) === '.draw.io') ||
					(hostName.substring(hostName.length - 13, hostName.length) === '.diagrams.net');
					(hostName.substring(hostName.length - 17, hostName.length) === '.quipelements.com');
				
				if (!supportedDomain)
				{
					mxscript('js/PreConfig.js');
				}
				
				mxscript('js/app.min.js', function()
				{
					if (!supportedDomain)
					{
						mxscript('js/PostConfig.js');
					}
				});
			})();
		}

		// Electron
		if (mxIsElectron)
		{
			mxscript('js/PreConfig.js');
			mxscript('js/diagramly/DesktopLibrary.js');
			mxscript('js/diagramly/ElectronApp.js');
			mxscript('js/extensions.min.js');
			mxscript('js/stencils.min.js');
			mxscript('js/shapes.min.js');
			mxscript('js/PostConfig.js');
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
