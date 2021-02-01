/**
 * Copyright (c) 2006-2020, JGraph Ltd
 * Copyright (c) 2006-2020, Gaudenz Alder
 *
 * Usage: DiagramEditor.editElement(elt) where elt is an img or object with
 * a data URI src or data attribute or an svg node with a content attribute.
 *
 * See https://jgraph.github.io/drawio-integration/javascript.html
 */

// Public global variables
window.MAX_REQUEST_SIZE = window.MAX_REQUEST_SIZE  || 10485760;
window.MAX_AREA = window.MAX_AREA || 15000 * 15000;
window.DRAWIOINTEGRATION_PATH = '../../../../drawio-integration'

// hide header, footer and  glpi_tabs div, for full page drawing pane
function hideGlpi() 
{
	var header = document.getElementById('header');
	if (header) header.style.display = 'none';
	var footer = document.getElementById('footer');
	if (footer) footer.style.display = 'none';
	var page = document.getElementById('page');
	if (page) page.style.display = 'none';
};
// display drawio editor
function showDrawio()
{
	if (typeof module === 'object') {window.module = module; module = undefined;} // to solve error message "jQuery is not defined" (cfr https://stackoverflow.com/questions/45741173/jquery-is-not-defined-within-jquery-ui)
	DiagramEditor.editElement($("input[name='graph']")[0]);
};

function DiagramEditor(config, ui, done)
{
	this.config = (config != null) ? config : this.config;
	this.done = (done != null) ? done : this.done;
	this.ui = (ui != null) ? ui : this.ui;
	var self = this;

	this.handleMessageEvent = function(evt)
	{
		if (self.frame != null && evt.source == self.frame.contentWindow &&
			evt.data.length > 0)
		{
			try
			{
				var msg = JSON.parse(evt.data);

				if (msg != null)
				{
					self.handleMessage(msg);
				}
			}
			catch (e)
			{
				console.error(e);
			}
		}
	};
};

/**
 * Static method to edit the diagram in the given img or object.
 */
DiagramEditor.editElement = function(elt, config, ui, done)
{
	return new DiagramEditor(config, ui, done).editElement(elt);
};

/**
 * Global configuration.
 */
DiagramEditor.prototype.config = null;

/**
 * Protocol and domain to use.
 */
// Modified EFE 20200930 - Build drawDomain dynamically
DiagramEditor.prototype.drawDomain = document.location.protocol + '//' + document.location.hostname + window.location.pathname.split('/').slice(0,4).join('/') + '/drawio/src/main/webapp/';
// End of Modified EFE 20200930 - Build drawDomain dynamically

/**
 * UI theme to be use.
 */
DiagramEditor.prototype.ui = 'min';

/**
 * Format to use.
 */
DiagramEditor.prototype.format = 'xml';

/**
 * Specifies if libraries should be enabled.
 */
DiagramEditor.prototype.libraries = null;

/**
 * CSS style for the iframe.
 */
DiagramEditor.prototype.frameStyle = 'position:absolute;border:0;top:0;left:0;right:0;bottom:0;width:100%;height:100%;';

/**
 * Adds the iframe and starts editing.
 */
// Added EFE 20200515 - Get (admin) role as parameter and configure custom libraries and plugins accordingly
DiagramEditor.prototype.editElement = function(elem)
{
	// create the "libraries" object in this.config (see https://desk.draw.io/support/solutions/articles/16000058316)
	this.config = {'libraries' : [ {
									"title": { "main": "Custom"},
									"entries": [ { "id": "glpi",
												"title": { "main": "GLPI"},
												"desc": { "main": "GLPI selected icons"},
												"libs": []
												} ]
									} ]
					};
    // fill in config with libraries from "getlibraries" on central repository
    var getLibraries = function(type, key, libconfig, success, error)
    {
        let tables = {};
        tables['param'] = {'table' : 'glpi_plugin_archimap_configs', 
                    'column' : 'key, value', 
                    'where' : 'type = "LIBXML"' + (key ? ' and `key` = "'+key+'"' : '')};
        var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
				datas = JSON && JSON.parse(xhr.responseText) || $.parseJSON(xhr.responseText);
                success(datas, libconfig);
			}
		};
		xhr.open("POST", "../ajax/getconfig.php", true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.send(JSON.stringify(tables));
    }
    var success = function(repolibs, libconfig)
	{
        var decodeHTML = function (html) {
            var txt = document.createElement('textarea');
            txt.innerHTML = html;
            return txt.value;
        };
        var ExtractTagFromXml = function (xml, tag) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xml,"text/xml");
            if (tag)
            {
                return JSON.parse(xmlDoc.getElementsByTagName(tag)[0].childNodes[0].nodeValue);
            }
            else
            {
                return xmlDoc;
            }
            
        };
        if (repolibs && repolibs['param'])
        {
            var arrayLength = repolibs['param'].length;
            var istart = libconfig.length;
            for (var i = 0 in repolibs['param'])
            {
//              var data = new XMLSerializer().serializeToString(ExtractTagFromXml(decodeHTML(repolibs['param'][i].value)));
                var data = ExtractTagFromXml(decodeHTML(repolibs['param'][i].value), 'mxlibrary');
                libconfig[istart] = 
                    {"title" : {"main" : repolibs['param'][i].key.replace(/_/g, " ")}, // replace underscore by space in file name
					"data" : data};
                istart++;
            }
        }
	};
    var error = function()
    {
        console.log("error during load of repository's libraries");
    };
    var customlibsrepo = getLibraries('LIBXML', null, this.config.libraries[0].entries[0].libs, success, error);
    
    // fill in config with libraries from "drawio-extension/libraries" directory on server
	var customlibsurl = document.location.protocol + '//' + document.location.hostname + window.location.pathname.split('/').slice(0,4).join('/') + '/drawio-integration/libraries/';
    var istart = this.config.libraries[0].entries[0].libs.length;
	for (var i=0; i<customlibs.length; i++)
	{	this.config.libraries[0].entries[0].libs[istart+i] = {"title" : {"main" : customlibs[i].replace(/_/g, " ")}, // replace underscore by space in file name
					"url" : customlibsurl + customlibs[i] + ".xml", "prefetch" : true};
	}
	// add the "plugins" object in this.config (see https://desk.draw.io/support/solutions/articles/16000058316)
	if (user && user.role && user.role.toLowerCase().includes("admin"))
	{	// user role contains "admin"
		this.config.user = user;
		this.config.plugins = 
								[// load plugin needed to autocomplete and to modify graph's display preferences
								'../../../../drawio-integration/ext/jquery/jquery.min.js',
								'../../../../drawio-integration/ext/jquery/jquery-ui-1.12.1.custom.css',
								'../../../../drawio-integration/ext/jquery/jquery-ui-1.12.1.custom.min.js', 
								'../../../../drawio-integration/plugins/autocomplete.js', 
								// load libraries needed by Alpaca
								'../../../../drawio-integration/ext/alpaca/handlebars.min.js', 
//								'//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css', 
								'../../../../drawio-integration/ext/alpaca/bootstrap-3.3.2.min.css', 
								'../../../../drawio-integration/ext/alpaca/bootstrap.min.js', 
								'../../../../drawio-integration/ext/alpaca/alpaca.min.css', 
								'../../../../drawio-integration/ext/alpaca/alpaca.min.js', 
								// load plugin needed to link a library's stencil to a (architecture) repository
								'../../../../drawio-integration/plugins/Repository.js',
								'../../../../drawio-integration/plugins/link2repo.js'];
		this.libraries = true;	// allow libraries creation/modification
	} else
	{	// user role is normal
		this.config.user = user;
								
		this.config.plugins = 	[// load plugin needed to autocomplete and to modify graph's display preferences
                                '../../../../drawio-integration/ext/jquery/jquery.min.js', 
								'../../../../drawio-integration/ext/jquery/jquery-ui-1.12.1.custom.css',
								'../../../../drawio-integration/ext/jquery/jquery-ui-1.12.1.custom.min.js', 
								'../../../../drawio-integration/plugins/autocomplete.js'];
	}
// End of Added EFE 20200515
	var src = this.getElementData(elem);
	this.startElement = elem;
	var fmt = this.format;

	if (src.substring(0, 15) === 'data:image/png;')
	{
		fmt = 'xmlpng';
	}
	else if (src.substring(0, 19) === 'data:image/svg+xml;' ||
		elem.nodeName.toLowerCase() == 'svg')
	{
		fmt = 'xmlsvg';
	}
	else
	{
		fmt = 'xml';
	}

	this.startEditing(src, fmt);

	return this;
};

/**
 * Adds the iframe and starts editing.
 */
DiagramEditor.prototype.getElementData = function(elem)
{
	var name = elem.nodeName.toLowerCase();

// Added EFE 20200512
	if (name == 'input')
	{	if (elem.value != 'undefined')
			return decodeURIComponent(elem.value);
		else
			return "<mxfile><diagram/></mxfile>";
	}
	else
// End of Added EFE 20200512
		return elem.getAttribute((name == 'svg') ? 'content' :
		((name == 'img') ? 'src' : 'data'));
};

/**
 * Adds the iframe and starts editing.
 */
DiagramEditor.prototype.setElementData = function(elem, data)
{
	var name = elem.nodeName.toLowerCase();

// Added EFE 20200512
	if (name == 'input')
		elem.value = encodeURIComponent(data);
	else
// End of Added EFE 20200512
	if (name == 'svg')
	{
		elem.outerHTML = atob(data.substring(data.indexOf(',') + 1));
	}
	else
	{
		elem.setAttribute((name == 'img') ? 'src' : 'data', data);
	}

	return elem;
};

/**
 * Starts the editor for the given data.
 */
DiagramEditor.prototype.startEditing = function(data, format, title)
{
	if (this.frame == null)
	{
		window.addEventListener('message', this.handleMessageEvent);
		this.format = (format != null) ? format : this.format;
		this.title = (title != null) ? title : this.title;
		this.data = data;

		this.frame = this.createFrame(
			this.getFrameUrl(),
			this.getFrameStyle());
		document.body.appendChild(this.frame);
		this.setWaiting(true);
	}
};

/**
 * Updates the waiting cursor.
 */
DiagramEditor.prototype.setWaiting = function(waiting)
{
	if (this.startElement != null)
	{
		// Redirect cursor to parent for SVG and object
		var elt = this.startElement;
		var name = elt.nodeName.toLowerCase();
		
		if (name == 'svg' || name == 'object')
		{
			elt = elt.parentNode;
		}
		
		if (elt != null)
		{
			if (waiting)
			{
				this.frame.style.pointerEvents = 'none';
				this.previousCursor = elt.style.cursor;
				elt.style.cursor = 'wait';
			}
			else
			{
				elt.style.cursor = this.previousCursor;
				this.frame.style.pointerEvents = '';
			}
		}
	}
};

/**
 * Updates the waiting cursor.
 */
DiagramEditor.prototype.setActive = function(active)
{
	if (active)
	{
		this.previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}
	else
	{
		document.body.style.overflow = this.previousOverflow;
	}
};

/**
 * Removes the iframe.
 */
DiagramEditor.prototype.stopEditing = function()
{
	if (this.frame != null)
	{
		window.removeEventListener('message', this.handleMessageEvent);
		document.body.removeChild(this.frame);
// Added EFE 20201117 // bug : suppress also the HTML element
		this.frame.remove();
// End of Added EFE 20201117
		this.setActive(false);
		this.frame = null;
	}
};

/**
 * Send the given message to the iframe.
 */
DiagramEditor.prototype.postMessage = function(msg)
{
	if (this.frame != null)
	{
		this.frame.contentWindow.postMessage(JSON.stringify(msg), '*');
	}
};

/**
 * Returns the diagram data.
 */
DiagramEditor.prototype.getData = function()
{
	return this.data;
};

/**
 * Returns the title for the editor (from hidden field "name").
 */
DiagramEditor.prototype.getTitle = function()
{
// Changed EFE 200200507
//	return this.title;
	return document.getElementsByName("name")[0];
;
};

/**
 * Returns the CSS style for the iframe.
 */
DiagramEditor.prototype.getFrameStyle = function()
{
	return this.frameStyle + ';left:' +
		document.body.scrollLeft + 'px;top:' +
		document.body.scrollTop + 'px;';
};

/**
 * Returns the URL for the iframe.
 */
DiagramEditor.prototype.getFrameUrl = function()
{
// Added EFE 20200715 - Set url parameters to configure drawio (see https://www.diagrams.net/doc/faq/supported-url-parameters.html)
//	cors=http://localhost
	var url = this.drawDomain + '?embed=1&proto=json&spin=1&libs=archimate3;bpmn;uml&math=0&splash=0';
    var cors = encodeURIComponent(document.location.protocol + '//' + document.location.hostname);
    url += '&cors=' + cors;
	if (this.config.user && this.config.user.language)
	{
		url += '&lang=' + this.config.user.language.substring(0,2);
//		window.mxLanguage = this.config.user.language;
	}
// End of Added EFE 20200715

	if (this.ui != null)
	{
		url += '&ui=' + this.ui;
	}

	if (this.libraries != null)
	{
		url += '&libraries=1';
	}

	if (this.config != null)
	{
		url += '&configure=1';
	}

	return url;
};

/**
 * Creates the iframe.
 */
DiagramEditor.prototype.createFrame = function(url, style)
{
	var frame = document.createElement('iframe');
	frame.setAttribute('frameborder', '0');
	frame.setAttribute('style', style);
	frame.setAttribute('src', url);

	return frame;
};

/**
 * Sets the status of the editor.
 */
DiagramEditor.prototype.setStatus = function(messageKey, modified)
{
	this.postMessage({action: 'status', messageKey: messageKey, modified: modified});
};

/**
 * Handles the given message.
 */
DiagramEditor.prototype.handleMessage = function(msg)
{
	if (msg.event == 'configure')
	{
		this.configureEditor();
	}
	else if (msg.event == 'init')
	{
		this.initializeEditor();
	}
	else if (msg.event == 'autosave')
	{
		this.save(msg.xml, true, this.startElement);
	}
	else if (msg.event == 'export')
	{
		this.save(msg.data, false, this.startElement);
		this.stopEditing();
	}
	else if (msg.event == 'save')
	{
    console.log('DiagramEditor save event', msg.event, msg.exit);
		if (msg.exit)
		{
			msg.event = 'exit';
    console.log('DiagramEditor save&exit event', msg.event, msg.exit);
		}
		else
		{
// Added EFE 20200512
			if (this.format == 'xml' && (msg.modified || msg.modified === undefined))
			{
				this.save(msg.xml, false, this.startElement);
			}
// End of Added EFE 20200512
			this.setStatus('allChangesSaved', false);
		}
	}

	if (msg.event == 'exit')
	{
		if (this.format != 'xml' && !msg.modified)
		{
			this.postMessage({action: 'export', format: this.format,
				xml: msg.xml, spinKey: 'export'});
		}
		else
		{
			if (msg.modified)
				this.save(msg.xml, false, this.startElement);
			this.stopEditing(msg);
		}
// Added EFE 20200512
		// come back on the first tab of GLPI
		// remove iframes
		var iframe = document.getElementsByTagName('iframe');
		while (iframe && iframe.length>0)
		{
			iframe[0].remove();
		}
		// display back the header, footer and page HTML elements
		var header = document.getElementById('header');
		if (header) header.style.display = 'inline';
		var footer = document.getElementById('footer');
		if (footer && footer.style) footer.style.display = 'inline';
		var page = document.getElementById('page');
		if (page) page.style.display = 'inline';
		$('a[title="Diagram"]')[0].click();	
		// add event on 2nd tab to show full screen drawing pane
		document.querySelector('a[title="Drawing Pane"]').addEventListener("click",(function() {hideGlpi();showDrawio()}));
// End of Added EFE 20200512
	}
};

/**
 * Posts configure message to editor.
 */
DiagramEditor.prototype.configureEditor = function()
{
	this.postMessage({action: 'configure', config: this.config});
};

/**
 * Posts load message to editor.
 */
DiagramEditor.prototype.initializeEditor = function()
{
	this.postMessage({action: 'load',autosave: 1, saveAndExit: '1',
		modified: 'unsavedChanges', xml: this.getData(),
		title: this.getTitle()});
	this.setWaiting(false);
	this.setActive(true);
};

/**
 * Saves the given data.
 */
DiagramEditor.prototype.save = function(data, draft, elt)
{
	if (elt != null && !draft)
	{
		this.setElementData(elt, data);
		this.done(data, draft, elt);
	}
};

/**
 * Invoked after save.
 */
DiagramEditor.prototype.done = function(data, draft, elt)
{
	// hook for subclassers
					var diagramid = document.getElementsByName("id")[0];
					if (diagramid) {
						// When pressing the "Save" button of the drawing pane, load the hidden field "graph" with the diagram 
						// this field will be saved in GLPI DB with the other fields of the form)
//						var inputgraph = document.getElementsByName("graph")[0];
						var token = document.getElementsByName("_glpi_csrf_token")[0];
						elt.value = encodeURIComponent(data);
						if (elt.value.length < MAX_REQUEST_SIZE)
						{
							this.setStatus('saved');
//							update graph in DB
							var xhr = new XMLHttpRequest();
							xhr.onreadystatechange = function() {
								if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
//									data = JSON && JSON.parse(xhr.responseText) || $.parseJSON(xhr.responseText);
//									this.setStatus('', false);
								}
								else if (xhr.readyState == 4) {
//									this.setStatus('errorSavingFile', true);
								}	
							}; 
							xhr.open("POST", "../ajax/updategraph.php", false);
							xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
							xhr.send("update=Save&id="+ diagramid.value + '&graph=' + elt.value);
//							if (exit)
//							{
//								this.ui.actions.get('exit').funct();
//							}
                    console.log('really saved !');
						}
						else
						{
							this.setStatus('drawingTooLarge', true);
						}
					} 
};
