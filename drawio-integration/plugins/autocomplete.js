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
window.DRAWIOINTEGRATION_PATH = '../../../../drawio-integration';
window.EXPORT_URL = 'https://convert.diagrams.net/node/export';
window.ROOT_PATH = window.location.protocol + '//' + window.location.hostname;
window.ROOT_PATH += (window.location.port && window.location.port != "") ? ':' + window.location.port : '';
window.ROOT_PATH += window.location.pathname.substring(0,(window.location.pathname.indexOf('/marketplace')>=0?window.location.pathname.indexOf('/marketplace'):window.location.pathname.indexOf('/plugins')));
// Append port number if different from empty string
Draw.loadPlugin(function(editorUi)
{
	console.log('entering autocomplete plugin', editorUi);
	window.appUi = editorUi;
// Adds resource for plugin
	mxResources.add(window.DRAWIOINTEGRATION_PATH + '/resources/archi');
	
// Load diagram, refresh custom properties and adapt menus --------------------------------------------------------------------------------------------------------------------------------------------------------
// Load custom stylesheets (css)
	mxUtils.getAll([window.DRAWIOINTEGRATION_PATH + '/styles/archimap.xml'], function(xhr)
	{
		var node = mxUtils.parseXml(xhr[0].getText()).documentElement;
		var stylesheet = editorUi.editor.graph.getStylesheet()
		if (node != null && stylesheet != null)
		{
			var dec = new mxCodec(node.ownerDocument);
			var customstyles = dec.decode(node);
			// Add custom styles to current stylesheet
			for (var key in customstyles.styles)
			{
				// copy style in stylesheet
				stylesheet.styles[key] = customstyles.styles[key];
				// mark it as "customstyle"
				stylesheet.styles[key].customstyle = true;
			}
		}
	}, function(xhr)
	{
		var st = document.getElementById('geStatus');
		
		if (st != null)
		{
			st.innerHTML = 'Error loading custom styles. <a>Please try refreshing.</a>';
			
			// Tries reload with default resources in case any language resources were not available
			st.getElementsByTagName('a')[0].onclick = function()
			{
				mxLanguage = 'en';
				doLoad(mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
						mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage));
			};
		}
	});

// Load CSS classes from central repository
	EditorUi.prototype.loadStylesFromRepository = function()
	{
		var repository = new Repository(this);
		repository.getStyles('STYLE', null, mxUtils.bind(this, function(req)
		{
			var decodeHTML = function (html) {
				var txt = document.createElement('textarea');
				txt.innerHTML = html;
				return txt.value;
			};
			var customstyles = (JSON && JSON.parse(req.request.responseText)) || $.parseJSON(req.request.responseText);
			if (customstyles['param'])
			{
				var stylesheet = this.editor.graph.getStylesheet()
				for (var i = 0 in customstyles['param'])
				{
					var node = mxUtils.parseXml(decodeHTML(customstyles['param'][i].value)).documentElement;
					var dec = new mxCodec(node.ownerDocument);
					var customstyle = dec.decode(node);
					if (customstyle && customstyle.styles)
					{	// copy style in stylesheet
						stylesheet.styles[customstyles['param'][i].key] = customstyle.styles[customstyles['param'][i].key];
						// mark it as "customstyle"
						if (stylesheet.styles[customstyles['param'][i].key])
							stylesheet.styles[customstyles['param'][i].key].customstyle = true;
					}
				}
			}
			this.refreshCellStyle(this.editor);
		}), 
		mxUtils.bind(this, function(message)
		{
			editorUi.showError(mxResources.get('error'), message, mxResources.get('ok'), null);
		}));
	}
	editorUi.loadStylesFromRepository();

	EditorUi.prototype.refreshCellStyle = function(thisEditor)
	{
		if (thisEditor && thisEditor.graph && thisEditor.graph.model && thisEditor.graph.model.cells)
		{
			for (let i in thisEditor.graph.model.cells)
			{
				thisCell = thisEditor.graph.model.cells[i];
				var thisState = thisEditor.graph.getView().getState(thisCell);
				if (thisCell.customproperties && thisCell.customproperties['autocompletecssclass'])
				{
					// Build the list of CSS classes and assign them to the cell
					var cssclassname = thisCell.customproperties['autocompletecssclass'].split("+")
					var style = thisEditor.graph.model.getStyle(thisCell);
					// remove old stylenames
					style = mxUtils.removeAllStylenames(style);
					var classlist = "";
					for (j = 0; j < cssclassname.length ; j++)
					{
						// If the customproperty "autocompletcssclass" exists, add current value of "autocompletcssclass" to the element's class
						if (thisCell.customproperties[cssclassname[j]])
							classlist += (typeof(thisCell.customproperties[cssclassname[j]]) == 'string') ? thisCell.customproperties[cssclassname[j]].replace(/ /g,"_") : thisCell.customproperties[cssclassname[j]];
						else
						// Otherwise, add simply the symbol as string
							classlist += cssclassname[j].replace(/'/g,"");
					}
					if (mxClient.IS_GC || mxClient.IS_SF)
						thisEditor.graph.model.setStyle(thisCell, style + ';dummy;' + classlist);
					else
						thisEditor.graph.model.setStyle(thisCell, style + ';' + classlist);
//											thisCell.class = classlist.replace(/;/g," ");
					thisCell.customproperties['autocompleteaddedclass'] = classlist;
				}
			}
		}
	}

// Add "New inventory entry" menu to cell
	EditorUi.prototype.addNewInventoryEntry = function()
	{
		var uiCreatePopupMenu = editorUi.menus.createPopupMenu;
		editorUi.menus.createPopupMenu = function(menu, cell, evt)
		{
			if (editorUi.editor.graph.getSelectionCount() == 1)
			{
				var cell = editorUi.editor.graph.getSelectionCell();
				// add the menu 'inventory' if the cell can be linked to a repository and the current user is authorized to use the API
				if (cell.customproperties && window.config.user.app_token && window.config.user.session_token)
				{
		
					menu.addItem((cell.customproperties.glpi_id ? mxResources.get('inventoryUpdate') : mxResources.get('inventoryCreate')), null, mxUtils.bind(this, function()
						{
							var div = document.createElement('div');
							var count = (cell.customproperties.autocompletejointcolumns.match(/,/g) || []).length + 1; // count the number of comma in autocompletecolumns : this number (+ 1) is the number of lines in the form
							var dlg = new NewInventoryDialog(editorUi, cell);
							editorUi.showDialog(dlg.container, 1000, (count+1)*50+25, true, true, null, false, false);  // the form's height is the number of lines * 50 pixels + the line for form's buttons
							mxEvent.consume(evt);
						}));
					menu.addSeparator();
				}
				uiCreatePopupMenu.apply(this, arguments);
			}
		};
	}
	editorUi.addNewInventoryEntry();

	//	Display custom properties with alpacajs, based on configuration files located in drawio-integration/ext/alpaca
	function indexOfArrayWithObjectAttribute(arr, key, searchKey) {
		var found = -1
		arr.forEach((obj, index) => {if (obj[key].includes(searchKey)) {found = index}});
		return found;
	}
	
	var NewInventoryDialog = function (editorUi, cell)
	{
		var div = document.createElement('div');
		div.style.overflowX = 'visible';
		div.style.overflowY = 'auto';
		div.id = 'alpaca';
		// alpaca
		if (mxClient.language)
		{	
			$.alpaca.setDefaultLocale(mxClient.language);
			var language = mxClient.language;
		}
		else
		{	
			$.alpaca.setDefaultLocale('en-US');
			var language = 'en-US'
		}
		// Add dynamic fields with alpaca.org
		var schema = {	"type" : "object",
						"properties" : []
					};
		var options = {	"fields" : [],
						"form" : {},
						"view" : 'bootstrap-edit-horizontal'}
		// create a form field for each element of the "autocompletejointcolumns" customproperty, if filled, or the autocompletecolumns property otherwise
		var columns = cell.customproperties.autocompletejointcolumns ? cell.customproperties.autocompletejointcolumns.split(',') : cell.customproperties.autocompletecolumns.split(',');
		columns.forEach((column, index) => {columns[index] = column.trim()}); // trim
		var tablefields = {};
		for (var i = 0; i < columns.length; i++)
		{
			var asarray = columns[i].split(' as '); // asarray contains the full column name at index 0 and the "as" name at index 1 (if it exists)
			var tablecolumnarray = asarray[0].split('.'); // tablecolumnarray contains the table name at index 0 and the column name at index 1, if the table name exists ; otherwise, the column name is at index 0
			columns[i] = {	"table" : tablecolumnarray.length == 2 ? tablecolumnarray[0].trim() : cell.customproperties.autocompletetable,
							"column" : tablecolumnarray.length == 2 ? tablecolumnarray[1].trim() : tablecolumnarray[0].trim(),
							"as" : asarray[1] ? asarray[1].trim() : (tablecolumnarray.length == 2 ? tablecolumnarray[1].trim() : tablecolumnarray[0].trim())
						};
			tablefields[i] = {	"table" : cell.customproperties.autocompletetable,
								"where" : columns[i].table == cell.customproperties.autocompletetable ? // if table is the main one
											"Field = '" + columns[i].column + "'" // look for the field properties
											: 
											"Field = '" + columns[i].table.replace('glpi_','') + "_id'" // otherwise, look for the foreign key field properties
							}
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
				datas = JSON && JSON.parse(xhr.responseText) || $.parseJSON(xhr.responseText);
				for (var key in datas)
				{
					var data = datas[key];
					schema.properties[key] = {	"title" : columns[key].as ? columns[key].as : columns[key].column, // the "as" name, otherwise the column name
												"type" : (data['Key'] == 'MUL' && data['Type'].includes('int') ? "select" : // identify dropdown elements
														data['Type'].includes('int') ? "number" :
														(data['Type'].includes('date') ? "date" :
															"string")
														)
												};
				}
				// get list of values for foreign keys
				var foreigntables = {};
				schema.properties.forEach( (element, index) => {if (element.type == 'select') 
																{
																	foreigntables[index] = {"table" : columns[index].table,
																							"column" : 'id, ' + columns[index].column
																	};
																	element.type = 'number'; // change 'select' type into 'number' (to see only 1 list element)
																}
																options.fields[index] = {};
															}
										);
				var xhr2 = new XMLHttpRequest();
				xhr2.onreadystatechange = function() {
					if (xhr2.readyState == 4 && (xhr2.status == 200 || xhr2.status == 0)) {
						// for each foreign key ...
						datas = JSON && JSON.parse(xhr2.responseText) || $.parseJSON(xhr2.responseText);
						// fill in schema with enumeration keys and options with enumeration labels
						for (var key in datas)
						{
							var data = datas[key];
							schema.properties[key].enum = [];
							options.fields[key] = {"type" : 'select',
											"optionLabels" : []};
							for (var i = 0; i < data.length; i++)
							{
								schema.properties[key].enum[i] = data[i].id/*.toString()*/;
								options.fields[key].optionLabels[i] = data[i][columns[key].column];
							}
						}
						// fill in  form data with current customproperties (if there are)
						var formdata = {};
						if (cell.customproperties['glpi_id'])
						{
							for (var i in schema.properties) {
								options.fields[i] && options.fields[i]["optionLabels"] ? // if a dropdown list exists
															formdata[i] = schema.properties[i].enum[options.fields[i].optionLabels.indexOf(cell.customproperties[schema.properties[i].title])] // find index of this value in the list optionLabels and take the "enum" at this index
															:
															formdata[i] = cell.customproperties[schema.properties[i].title];
							}
						}
						// get value typed in cell and fill form with it
						var currentdata = typeof cell.value === 'string' ? cell.value.split(/<br>|\n+/) : cell.value.attributes.getNamedItem('label').nodeValue.split('\n');
						for (var i = 0; i < currentdata.length; i++)
						{
							// get property displayed from graph display preferences
							custompropertyname = editorUi.editor.graph.preferences[cell.customproperties.stencil] ? editorUi.editor.graph.preferences[cell.customproperties.stencil].values[i] : 'name';
							// find position in form field sequence
							var j = indexOfArrayWithObjectAttribute(columns, 'as', custompropertyname);
							options.fields[j] && options.fields[j]["optionLabels"] ? // if a dropdown list exists
															formdata[j] = schema.properties[j].enum[options.fields[j].optionLabels.indexOf(currentdata[i])] // find index of this value in the list optionLabels and take the "enum" at this index
															:
															formdata[j] = currentdata[i];
						}
						options.form = {
								"buttons" : {
									"cancel" : {
										"title" : mxResources.get('cancel'),
										"click" : function() {
											editorUi.hideDialog();
										}
									},
									"ok" : {
										"title" : mxResources.get('save'),
										"click" : function() {
											// save form values to cell's customproperties and to xhr3 body
											let formvalues = this.getValue();
											var items = {"input" : {} };
											for (let i in formvalues) {
												if (options.fields[i]["optionLabels"]) { // if a dropdown list exists
													items.input[columns[i].table.replace('glpi_','') + "_id"] = formvalues[i];
													cell.customproperties[columns[i].as] = options.fields[i].optionLabels[schema.properties[i].enum.indexOf(formvalues[i])] // find index of this value in the list "enum"" and take the "optionLabels" at this index;
												} else { // if plain text
													items.input[columns[i].column] = formvalues[i];
													cell.customproperties[columns[i].as] = formvalues[i];
												}
											}
											var xhr3 = new XMLHttpRequest();
											xhr3.onreadystatechange = function() {
												if (xhr3.readyState == 4 && (xhr3.status == 200 || xhr3.status == 201 || xhr3.status == 0)) {
													datas = JSON && JSON.parse(xhr3.responseText) || $.parseJSON(xhr3.responseText);
													if (!cell.customproperties.glpi_id)  // if glpi_id does not exist, get it from the "POST" response
														cell.customproperties.glpi_id = datas.id;
													// update cell's label'
													var newLabel = '';
													if (editorUi.editor.graph.preferences[cell.customproperties.stencil])
													{
														for (ivalue in editorUi.editor.graph.preferences[cell.customproperties.stencil].values)
														{
															var customproperty = editorUi.editor.graph.preferences[cell.customproperties.stencil].values[ivalue];
															// compose the new label from each customproperty, separated by a newline
															if (cell.customproperties[customproperty])
															{
																if (newLabel != '')
																	newLabel += '\n';
																newLabel += cell.customproperties[customproperty];
															}
														}
													}
													else
														newLabel = cell.customproperties['name'];
													editorUi.editor.graph.cellLabelChanged(cell, newLabel, false);
													editorUi.hideDialog();
													// Build the list of CSS classes and assign them to the cell
													if (cell.customproperties['autocompletecssclass'])
													{
														var cssclassname = cell.customproperties['autocompletecssclass'].split("+")
														var style = editorUi.editor.graph.model.getStyle(cell);
														// remove old stylenames
														style = mxUtils.removeAllStylenames(style);
														var classlist = "";
														for (j = 0; j < cssclassname.length ; j++)
														{
															// If the customproperty "autocompletcssclass" exists, add current value of "autocompletcssclass" to the element's class
															if (cell.customproperties[cssclassname[j]])
																classlist += (typeof(cell.customproperties[cssclassname[j]]) == 'string') ? cell.customproperties[cssclassname[j]].replace(/ /g,"_") : cell.customproperties[cssclassname[j]];
															else
															// Otherwise, add simply the symbol as string
																classlist += cssclassname[j].replace(/'/g,"");
														}
														if (mxClient.IS_GC || mxClient.IS_SF)
															editorUi.editor.graph.model.setStyle(cell, style + ';dummy;' + classlist);
														else
															editorUi.editor.graph.model.setStyle(cell, style + ';' + classlist);
														cell.class = classlist.replace(/;/g," ");
														var thisState = editorUi.editor.graph.getView().getState(cell);
														thisState.shape.node.className.baseVal = classlist.replace(/;/g," ");
														cell.customproperties['autocompleteaddedclass'] = classlist;
													}
												}
												else if (xhr3.readyState == 4 && (xhr3.status == 400 || xhr3.status == 401))
												{
													datas = JSON && JSON.parse(xhr3.responseText) || $.parseJSON(xhr3.responseText);
													// no authorization
													editorUi.hideDialog();
//													editorUi.showError(mxResources.get('error'), datas.message);
													editorUi.editor.setStatus('<span class="geStatusAlert" style="margin-left:8px;">' + mxUtils.htmlEntities(mxResources.get('error') + ' : ' + (datas.message || datas.join(' '))) + '</span>');
												}
											};
											if (cell.customproperties.glpi_id)
												// update
												xhr3.open("PUT", window.ROOT_PATH + "/apirest.php/" + cell.customproperties.autocompleteobject + "/" + cell.customproperties.glpi_id, true);
											else
												// create
												xhr3.open("POST", window.ROOT_PATH + "/apirest.php/" + cell.customproperties.autocompleteobject + "/", true);
											xhr3.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
											xhr3.setRequestHeader("Session-Token", window.config.user.session_token);
											xhr3.setRequestHeader("App-Token", window.config.user.app_token);
											xhr3.send(JSON.stringify(items));
 										}
									}
								}
						}
						$(document).ready(function() {
							$('#alpaca').alpaca( {
								'schema' : schema,
								'data' : formdata,
								'options' : options,
							});
						});
					}
				}
				xhr2.open("POST", window.DRAWIOINTEGRATION_PATH + "/ajax/gettables.php", true);
				xhr2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xhr2.send(JSON.stringify(foreigntables));
			}
		}; 
		xhr.open("POST", window.DRAWIOINTEGRATION_PATH + "/ajax/showcolumns.php", true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.send(JSON.stringify(tablefields));
	
		this.container = div;
	};


	// Load custom libraries in sidebar -----------------------------------------------------------------------------------
	// Add custom libraries as customstencils in sidebar object. So they can be retrieved in refreshCustomProperties.
	if (editorUi.sidebar.customEntries != null)
		{
			editorUi.sidebar.customstencils = [];
			
			for (var i = 0; i < editorUi.sidebar.customEntries.length; i++)
			{
				var section = editorUi.sidebar.customEntries[i];
				
				for (var j = 0; j < section.entries.length; j++)
				{
					var entry = section.entries[j];
					
					for (var k = 0; k < entry.libs.length; k++)
					{
						(mxUtils.bind(this, function(lib)
						{
							var data = null;
							var error = null;
							var cells = null;
							var shape = null;
							var name = null;
							
								if (lib.data != null)
								{
//									var doc = lib.data.getDocumentElement();
//									var doc = mxUtils.parseXml(lib.data);
//									if (doc.documentElement.nodeName == 'mxlibrary')
									{
//										data = JSON.parse(mxUtils.getTextContent(doc.documentElement));
                                        data = lib.data;

										for (var l = 0; l<data.length; l++)
										{
											cells = editorUi.stringToCells(Graph.decompress(data[l].xml));
											// only for vertices (not edges) with customproperties
											if (/*!cells[0].edge &&*/ cells[0].customproperties)
											{
												name = (cells[0].customproperties.stencil ? cells[0].customproperties.stencil : data[l].title);
												// add the cell as customstencil in sidebar
												editorUi.sidebar.customstencils[name] = cells[0];
												// create an entry starting with "STYLE_" in mxConstants, to accept it in stylesheet xml file (f.i archimap.xml)
												let styles = {};
												for (let entry of cells[0].style.split(";")) {
													let [key, value] = entry.split("=");
													styles[key] = value;
												}
												if (styles['shape'])
													mxConstants['STYLE_'+name.substr(name.lastIndexOf(".") + 1)] = styles['shape'];
											}
										}
									}
								}
								else if (lib.url != null)
								{
									var url = lib.url;
									
									if (!editorUi.editor.isCorsEnabledForUrl(url))
									{
										url = PROXY_URL + '?url=' + encodeURIComponent(url);
									}
									
									editorUi.editor.loadUrl(url, mxUtils.bind(this, function(temp)
									{
										try
										{
											var doc = mxUtils.parseXml(temp);
											
											if (doc.documentElement.nodeName == 'mxlibrary')
											{
												data = JSON.parse(mxUtils.getTextContent(doc.documentElement));

												for (var l = 0; l<data.length; l++)
												{
													var cells = editorUi.stringToCells(Graph.decompress(data[l].xml));
													// only for vertices (not edges) with customproperties
													if (!cells[0].edge && cells[0].customproperties)
													{
														name = (cells[0].customproperties.stencil ? cells[0].customproperties.stencil : data[l].title);
														editorUi.sidebar.customstencils[name] = cells[0];
														// create an entry starting with "STYLE_<last part of stencil name>" in mxConstants, containing the shape name (f.i mxgraph.archimate3.application), to accept it in stylesheet xml file (f.i archimap.xml)
														let styles = {};
														for (let entry of cells[0].style.split(";")) {
															let [key, value] = entry.split("=");
															styles[key] = value;
														}
														if (styles['shape'])
															mxConstants['STYLE_'+name.substr(name.lastIndexOf(".") + 1)] = styles['shape'];
													}
												}
											}
											else
											{
												error = mxResources.get('notALibraryFile');
											}
										}
										catch (e)
										{
											error = mxResources.get('error') + ': ' + e.message;
										}
									}), mxUtils.bind(this, function(e)
									{
										error = (e != null && e.message != null) ? e.message : e;
									}));
								}
								else
								{
									error = mxResources.get('invalidInput');
									barrier();
								}
						}))(entry.libs[k]);
					}
				}
			}
		}

/**
 * Update the displayed container.
 */
EditorUi.prototype.updateTabContainer = function()
{
	if (this.tabContainer != null && this.pages != null)
	{
		var graph = this.editor.graph;
		var wrapper = document.createElement('div');
		wrapper.style.position = 'relative';
		wrapper.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		wrapper.style.verticalAlign = 'top';
		wrapper.style.height = this.tabContainer.style.height;
		wrapper.style.whiteSpace = 'nowrap';
		wrapper.style.overflow = 'hidden';
		wrapper.style.fontSize = '13px';
		
		// Allows for negative left margin of first tab
		wrapper.style.marginLeft = '30px';
		
		// Automatic tab width to match available width
		// TODO: Fix tabWidth in chromeless mode
		var btnWidth = (this.editor.isChromelessView()) ? 29 : 59;
		var tabWidth = Math.min(140, Math.max(20, (this.tabContainer.clientWidth - btnWidth) / this.pages.length) + 1);
		var startIndex = null;

		for (var i = 0; i < this.pages.length; i++)
		{
			// Install drag and drop for page reorder
			(mxUtils.bind(this, function(index, tab)
			{
				if (this.pages[index] == this.currentPage)
				{
					tab.className = 'geActivePage';
					tab.style.backgroundColor = (uiTheme == 'dark') ? '#2a2a2a' : '#fff';
				}
				else
				{
					tab.className = 'geInactivePage';
				}
				
				tab.setAttribute('draggable', 'true');
				
				mxEvent.addListener(tab, 'dragstart', mxUtils.bind(this, function(evt)
				{
					if (graph.isEnabled())
					{
						// Workaround for no DnD on DIV in FF
						if (mxClient.IS_FF)
						{
							// LATER: Check what triggers a parse as XML on this in FF after drop
							evt.dataTransfer.setData('Text', '<diagram/>');
						}
						
						startIndex = index;
					}
					else
					{
						// Blocks event
						mxEvent.consume(evt);
					}
				}));
				
				mxEvent.addListener(tab, 'dragend', mxUtils.bind(this, function(evt)
				{
					startIndex = null;
					evt.stopPropagation();
					evt.preventDefault();
				}));
				
				mxEvent.addListener(tab, 'dragover', mxUtils.bind(this, function(evt)
				{
					if (startIndex != null)
					{
						evt.dataTransfer.dropEffect = 'move';
					}
					
					evt.stopPropagation();
					evt.preventDefault();
				}));
				
				mxEvent.addListener(tab, 'drop', mxUtils.bind(this, function(evt)
				{
					if (startIndex != null && index != startIndex)
					{
						// LATER: Shift+drag for merge, ctrl+drag for clone 
						this.movePage(startIndex, index);
					}

					evt.stopPropagation();
					evt.preventDefault();
				}));
				
				wrapper.appendChild(tab);
			}))(i, this.createTabForPage(this.pages[i], tabWidth, this.pages[i] != this.currentPage, i + 1));
		}
		
		this.tabContainer.innerHTML = '';
		this.tabContainer.appendChild(wrapper);
		
		// Adds floating menu with all pages and insert option
		var menutab = this.createPageMenuTab();
		this.tabContainer.appendChild(menutab);
		var insertTab = null;
		
		// Not chromeless and not read-only file
		if (this.isPageInsertTabVisible())
		{
			insertTab = this.createPageInsertTab();
			this.tabContainer.appendChild(insertTab);
		}

		if (wrapper.clientWidth > this.tabContainer.clientWidth - btnWidth)
		{
			if (insertTab != null)
			{
				insertTab.style.position = 'absolute';
				insertTab.style.right = '0px';
				wrapper.style.marginRight = '30px';
			}
			
			var temp = this.createControlTab(4, '&nbsp;&#10094;&nbsp;');
			temp.style.position = 'absolute';
			temp.style.right = (this.editor.chromeless) ? '29px' : '55px';
			temp.style.fontSize = '13pt';
			
			this.tabContainer.appendChild(temp);
			
			var temp2 = this.createControlTab(4, '&nbsp;&#10095;');
			temp2.style.position = 'absolute';
			temp2.style.right = (this.editor.chromeless) ? '0px' : '29px';
			temp2.style.fontSize = '13pt';
			
			this.tabContainer.appendChild(temp2);
			
			// TODO: Scroll to current page
			var dx = Math.max(0, this.tabContainer.clientWidth - ((this.editor.chromeless) ? 86 : 116));
			wrapper.style.width = dx + 'px';
			
			var fade = 50;
			
			mxEvent.addListener(temp, 'click', mxUtils.bind(this, function(evt)
			{
				wrapper.scrollLeft -= Math.max(20, dx - 20);
				mxUtils.setOpacity(temp, (wrapper.scrollLeft > 0) ? 100 : fade);
				mxUtils.setOpacity(temp2, (wrapper.scrollLeft < wrapper.scrollWidth - wrapper.clientWidth) ? 100 : fade);
				mxEvent.consume(evt);
			}));
		
			mxUtils.setOpacity(temp, (wrapper.scrollLeft > 0) ? 100 : fade);
			mxUtils.setOpacity(temp2, (wrapper.scrollLeft < wrapper.scrollWidth - wrapper.clientWidth) ? 100 : fade);

			mxEvent.addListener(temp2, 'click', mxUtils.bind(this, function(evt)
			{
				wrapper.scrollLeft += Math.max(20, dx - 20);
				mxUtils.setOpacity(temp, (wrapper.scrollLeft > 0) ? 100 : fade);
				mxUtils.setOpacity(temp2, (wrapper.scrollLeft < wrapper.scrollWidth - wrapper.clientWidth) ? 100 : fade);
				mxEvent.consume(evt);
			}));
		}
// Added EFE 20201123
		this.loadStylesFromRepository();
		this.refreshCustomProperties(this.editor);
// End of Added EFE 20201123
	}
};

//	Refresh cells customproperties from the stencil
	EditorUi.prototype.refreshCustomProperties = function (thisEditor)
	{
		if (thisEditor && thisEditor.graph && thisEditor.graph.model && thisEditor.graph.model.cells)
		{
				var thisCells = thisEditor.graph.model.cells;
				var glpiCells = {};
				for (var key in thisCells)
				{
					thisCell = thisCells[key];
					if (thisCell.customproperties)
					{
						var tablename = thisCell.customproperties.autocompletetable || null;
						if (tablename)
						{
							var id = thisCell.customproperties.glpi_id;
							var stencilName = thisCell.customproperties.stencil;
							// temporary : replace stencil sw_component by appli
							if (stencilName && stencilName == "mxgraph.glpi.sw_component") {
								console.log(thisCell.customproperties.name+'(id '+id+') : stencil '+stencilName+' changed to mxgraph.glpi.appli');
								stencilName = "mxgraph.glpi.appli";
								thisCell.customproperties.stencil = stencilName;
								thisEditor.modified = true;
							}
							// temporary : replace stencil orthogonalEdgeStyle by dataflow
							if (stencilName && stencilName == "mxgraph.glpi.orthogonalEdgeStyle") {
								console.log(thisCell.customproperties.name+'(id '+id+') : stencil '+stencilName+' changed to mxgraph.glpi.dataflow');
								stencilName = "mxgraph.glpi.dataflow";
								thisCell.customproperties.stencil = stencilName;
								thisEditor.modified = true;
							}
							if (id) {
								var stencil = (stencilName) ? editorUi.sidebar.customstencils[stencilName.replace(/ /g,"_").toLowerCase()] : null;
								var jointtables = thisCell.customproperties.autocompletejointtables || '';
								var jointcolumns = thisCell.customproperties.autocompletejointcolumns || tablename+'.id as glpi_id';
								var jointcriteria = thisCell.customproperties.autocompletejointcriteria || '';
								if (stencil && stencil.customproperties) {
									// temporary : to bypass shape inexistence in style
									if (thisEditor.graph.model.getStyle(thisCell).search('shape=') == -1)
									{
										var style = thisEditor.graph.model.getStyle(thisCell);
										thisEditor.graph.model.setStyle(thisCell, 'shape='+stencilName.replace(/ /g,"_")+';'+style);
										thisEditor.modified = true;
									}
									for (customproperty in stencil.customproperties)
									{
										if (typeof stencil.customproperties[customproperty] != "function"
										&& typeof stencil.customproperties[customproperty] != "object"
										&& typeof stencil.customproperties[customproperty] != "undefined"
										&& thisCell.customproperties[customproperty] != stencil.customproperties[customproperty])
										{
											thisCell.customproperties[customproperty] = stencil.customproperties[customproperty];
											thisEditor.modified = true;
										}
									}
									if (stencil.customproperties['autocompletejointtables'])
										jointtables = stencil.customproperties['autocompletejointtables'];
									if (stencil.customproperties['autocompletejointcolumns'])
										jointcolumns = stencil.customproperties['autocompletejointcolumns'];
									if (stencil.customproperties['autocompletejointcriteria'])
										jointcriteria = stencil.customproperties['autocompletejointcriteria'];
								}
								glpiCells[id] = {};
								glpiCells[id].key = key;
								glpiCells[id].tablename = tablename;
								glpiCells[id].jointtables = jointtables;
								glpiCells[id].jointcolumns = jointcolumns;
								glpiCells[id].jointcriteria = jointcriteria;
							}
						}
					}
				}
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
						datas = JSON && JSON.parse(xhr.responseText) || $.parseJSON(xhr.responseText);
						for (var key in datas)
						{
							var data = datas[key];
							thisCell = thisCells[key];
							var thisState = thisEditor.graph.getView().getState(thisCell);
/*							// Build the list of CSS classes and assign them to the cell
							if (thisCell.customproperties['autocompletecssclass'])
							{
								var cssclassname = thisCell.customproperties['autocompletecssclass'].split("+")
								var style = thisEditor.graph.model.getStyle(thisCell);
								// remove old stylenames
								style = mxUtils.removeAllStylenames(style);
								var classlist = "";
								for (j = 0; j < cssclassname.length ; j++)
								{
									// If the customproperty "autocompletcssclass" exists, add current value of "autocompletcssclass" to the element's class
									if (thisCell.customproperties[cssclassname[j]])
										classlist += (typeof(thisCell.customproperties[cssclassname[j]]) == 'string') ? thisCell.customproperties[cssclassname[j]].replace(/ /g,"_") : thisCell.customproperties[cssclassname[j]];
									else
									// Otherwise, add simply the symbol as string
										classlist += cssclassname[j].replace(/'/g,"");
								}
								thisEditor.graph.model.setStyle(thisCell, style + ';;' + classlist);
								thisCell.customproperties['autocompleteaddedclass'] = classlist;
							}
*/							// retrieve label displayed as graph's preference
							var ipreference = thisCell.customproperties['stencil'];
							for (var i in data)
							{
								if (data.hasOwnProperty(i)) 
								{
									data[i] = (data[i]) ? data[i] : "";
									if (thisCell.customproperties[i] == "undefined" || thisCell.customproperties[i] != data[i])
									{
										var newLabel = (i == 'name') ? data[i] : '';
										if (thisCell.customproperties['name'])
										{
//											newLabel = data[i];
											console.log(thisCell.customproperties['name']+' : '+i+' modified :'+thisCell.customproperties[i]+'<-'+data[i]+';');
										}
										thisCell.customproperties[i] = data[i];
										thisEditor.modified = true;
										// Build the list of CSS classes and assign them to the cell
										if (thisCell.customproperties['autocompletecssclass'])
										{
											var cssclassname = thisCell.customproperties['autocompletecssclass'].split("+")
											var style = thisEditor.graph.model.getStyle(thisCell);
											// remove old stylenames
											style = mxUtils.removeAllStylenames(style);
											var classlist = "";
											for (j = 0; j < cssclassname.length ; j++)
											{
												// If the customproperty "autocompletcssclass" exists, add current value of "autocompletcssclass" to the element's class
												if (thisCell.customproperties[cssclassname[j]])
													classlist += (typeof(thisCell.customproperties[cssclassname[j]]) == 'string') ? thisCell.customproperties[cssclassname[j]].replace(/ /g,"_") : thisCell.customproperties[cssclassname[j]];
												else
												// Otherwise, add simply the symbol as string
													classlist += cssclassname[j].replace(/'/g,"");
											}
											if (mxClient.IS_GC || mxClient.IS_SF)
												thisEditor.graph.model.setStyle(thisCell, style + ';dummy;' + classlist);
											else
												thisEditor.graph.model.setStyle(thisCell, style + ';' + classlist);
											thisCell.class = classlist.replace(/;/g," ");
											thisState.shape.node.className.baseVal = classlist.replace(/;/g," ");
											thisCell.customproperties['autocompleteaddedclass'] = classlist;
										}
										// update displayed value (the label), in case of change
										if (thisEditor.graph.preferences 
										&& thisEditor.graph.preferences[ipreference]
										&& thisEditor.graph.preferences[ipreference].values.indexOf(i) >= 0)
										{
											// look for a label preference according to the cell's stencil
											if (thisEditor.graph.preferences[ipreference].description
											&& thisEditor.graph.preferences[ipreference].description.substring(0,5).toLowerCase() == 'label')
											{
												var newLabel = '';
												for (ivalue in thisEditor.graph.preferences[ipreference].values)
												{
													var customproperty = thisEditor.graph.preferences[ipreference].values[ivalue];
													// compose the new label from each customproperty, separated by a newline
													if (thisCell.customproperties[customproperty])
													{
														if (newLabel != '')
															newLabel += '\n';
														newLabel += thisCell.customproperties[customproperty];
													}
												}
											}
										}
										if (newLabel)
										{
											thisEditor.graph.cellLabelChanged(thisCell, newLabel,false);
										}
									}
								}
							}
						}
						if (thisEditor.modified)
						{
							editorUi.actions.get('save').funct();
						}
					}
				}; 
				xhr.open("POST", window.DRAWIOINTEGRATION_PATH + "/ajax/getcustomproperties.php", true);
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xhr.send(JSON.stringify(glpiCells));
		}
	}


//	Add 'display' preferences menu to 'diagram' menu
	editorUi.actions.addAction('displaypreferences', function()
	{
		editorUi.showDialog(new DisplayPreferencesDialog(editorUi).container, 1000, 900, true, false, null, false, false, true);
	});
// Inspired from drawio/src/main/webapp/js/diagramly/Menu.js : overload the function displaying the "extras" menu
	// Extras menu is labelled preferences but keeps ID for extensions
	editorUi.menus.put('extras', new Menu(mxUtils.bind(this, function(menu, parent)
	{
// Added EFE 20201020
		editorUi.menus.addMenuItem(menu, 'displaypreferences', parent);
// End of Added EFE 20201020
		if (urlParams['embed'] != '1')
		{
			editorUi.menus.addSubmenu('theme', menu, parent);
		}
			
		var langMenu = editorUi.menus.get('language');
		if (langMenu != null)
		{
			editorUi.menus.addSubmenu('language', menu, parent);
		}
			
		editorUi.menus.addSubmenu('units', menu, parent);
		menu.addSeparator(parent);
		editorUi.menus.addMenuItems(menu, ['scrollbars', 'tooltips', 'ruler'], parent);
            
//		if (urlParams['embed'] != '1' && (isLocalStorage || mxClient.IS_CHROMEAPP))
		{
			editorUi.menus.addMenuItems(menu, ['-', 'search', 'scratchpad', '-'/*, 'showStartScreen'*/], parent);
		}

		if (!editorUi.isOfflineApp() && isLocalStorage)
		{
	       	editorUi.menus.addMenuItem(menu, 'plugins', parent);
		}

		menu.addSeparator(parent);
       	editorUi.menus.addMenuItem(menu, 'drawConfig', parent);
		
		// Adds trailing separator in case new plugin entries are added
		menu.addSeparator(parent);
       })));

// Inspired from drawio/src/main/webapp/js/diagramly/Menu.js : create the function displaying the "embed" menu
	editorUi.menus.put('embed', new Menu(mxUtils.bind(editorUi.menus, function(menu, parent)
	{
		var file = editorUi.getCurrentFile();
		
		if (file != null && (file.getMode() == App.MODE_GOOGLE ||
			file.getMode() == App.MODE_GITHUB) && /(\.png)$/i.test(file.getTitle()))
		{
			editorUi.menus.addMenuItems(menu, ['liveImage', '-'], parent);
		}
			
		editorUi.menus.addMenuItems(menu, ['embedImage', 'embedSvg', '-', 'embedHtml'], parent);
			
		if (!navigator.standalone && !editorUi.isOffline())
		{
			editorUi.menus.addMenuItems(menu, ['embedIframe'], parent);
		}

		if (urlParams['embed'] != '1' && !editorUi.isOffline())
		{
			editorUi.menus.addMenuItems(menu, ['-', 'googleDocs', 'googleSlides', 'googleSheets', '-', 'microsoftOffice'], parent);
		}
	})));

// Inspired from drawio/src/main/webapp/js/diagramly/Minimal.js : overload the function displaying the "diagram" menu (to add the 'embed' menu)
    editorUi.menus.put('diagram', new Menu(mxUtils.bind(editorUi.menus, function(menu, parent)
	{
		var file = editorUi.getCurrentFile();
       	editorUi.menus.addSubmenu('extras', menu, parent, mxResources.get('preferences'));
		menu.addSeparator(parent);
			
		if (mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
		{
			editorUi.menus.addMenuItems(menu, ['new', 'open', '-', 'synchronize',
					'-', 'save', 'saveAs', '-'], parent);
		}
		else if (urlParams['embed'] == '1')
		{
			editorUi.menus.addMenuItems(menu, ['-', 'save'], parent);

			if (urlParams['saveAndExit'] == '1')
			{
				editorUi.menus.addMenuItems(menu, ['saveAndExit'], parent);
			}
				
			menu.addSeparator(parent);
		}
		else
		{
	       	editorUi.menus.addMenuItems(menu, ['new'], parent);
			editorUi.menus.addSubmenu('openFrom', menu, parent);
			
			if (isLocalStorage)
			{
				editorUi.menus.addSubmenu('openRecent', menu, parent);
			}
				
			menu.addSeparator(parent);
				
			if (file != null && file.constructor == DriveFile)
			{
				editorUi.menus.addMenuItems(menu, ['share'], parent);
			}
				
			if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
				file != null && file.constructor != LocalFile)
			{
				editorUi.menus.addMenuItems(menu, ['synchronize'], parent);
			}
				
			menu.addSeparator(parent);
			editorUi.menus.addSubmenu('save', menu, parent);
		}
			
		editorUi.menus.addSubmenu('exportAs', menu, parent);
			    
		if (mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
		{
           	editorUi.menus.addMenuItems(menu, ['import'], parent);
		}
		else
		{
			editorUi.menus.addSubmenu('importFrom', menu, parent);
		}

// Added EFE 20201020 : add menu 'embed' (for Iframe export)
		editorUi.menus.addSubmenu('embed', menu, parent);
// End of Added EFE 20201020 : add menu 'embed' (for Iframe export)
		editorUi.menus.addMenuItems(menu, ['-', 'outline', 'layers'], parent);
			
		if (editorUi.commentsSupported())
		{
			editorUi.menus.addMenuItems(menu, ['comments'], parent);
		}
			
		editorUi.menus.addMenuItems(menu, ['-', 'find', 'tags'], parent);
			
		if (file != null && editorUi.fileNode != null)
		{
			var filename = (file.getTitle() != null) ?
				file.getTitle() : editorUi.defaultFilename;
				
			if (!/(\.html)$/i.test(filename) &&
				!/(\.svg)$/i.test(filename))
			{
				editorUi.menus.addMenuItems(menu, ['-', 'properties']);
			}
		}

			// Cannot use print in standalone mode on iOS as we cannot open new windows
		if (!mxClient.IS_IOS || !navigator.standalone)
		{
			editorUi.menus.addMenuItems(menu, ['-', 'print', '-'], parent);
		}
			
		editorUi.menus.addSubmenu('help', menu, parent);

		if (urlParams['embed'] == '1')
		{
			editorUi.menus.addMenuItems(menu, ['-', 'exit'], parent);
		}
		else
		{
			editorUi.menus.addMenuItems(menu, ['-', 'close']);
		}
	})));

// Display preferences ---------------------------------------------------------------------------------------------------------------------------------
/**
 * Variable: pageFormat
 *
 * Specifies the page format for the background page. Default is
 * <mxConstants.PAGE_FORMAT_A4_PORTRAIT>. This is used as the default in
 * <mxPrintPreview> and for painting the background page if <pageVisible> is
 * true and the pagebreaks if <pageBreaksVisible> is true.
 */
// Added EFE 20131218
//mxGraph.prototype.pageFormat = mxConstants.PAGE_FORMAT_A4_PORTRAIT;
mxGraph.prototype.pageFormat = mxConstants.PAGE_FORMAT_A4_LANDSCAPE;

// inspired from mxClient.js
/**
 * Function: createDefaultVertexStyle
 *
 * Creates and returns the default vertex style.
 */
mxStylesheet.prototype.createDefaultVertexStyle = function()
{
	var style = new Object();

	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
//	style[mxConstants.STYLE_FILLCOLOR] = '#C3D9FF';
	style[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
//	style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
	style[mxConstants.STYLE_STROKECOLOR] = '#000000';
//	style[mxConstants.STYLE_FONTCOLOR] = '#774400';
	style[mxConstants.STYLE_FONTCOLOR] = '#000000';

	return style;
};

/**
 * Function: createDefaultEdgeStyle
 *
 * Creates and returns the default edge style.
 */
mxStylesheet.prototype.createDefaultEdgeStyle = function()
{
	var style = new Object();

	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
	style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
//	style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
	style[mxConstants.STYLE_STROKECOLOR] = '#000000';
//	style[mxConstants.STYLE_FONTCOLOR] = '#446299';
	style[mxConstants.STYLE_FONTCOLOR] = '#000000';

	return style;
};

/**
 * Variable: custompreferences
 *
 * Specifies the user preferences, like display of GLPI fields as label.
 */
mxGraph.prototype.preferences = [
								];
mxGraph.prototype.preferences['displayIconOnVertex'] = {'id':'displayIconOnVertex','description':'Display Icons on Nodes','type':'radio','values':['false'],'options':['true','false']}
mxGraph.prototype.preferences['displayIconOnEdge'] = {'id':'displayIconOnEdge','description':'Display Icons on Links','type':'radio','values':['false'],'options':['true','false']}
// End of Added EFE 20131218
// Inspired from Editor.js : Load graph preferences
/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.readGraphState = function(node)
{
	this.graph.gridEnabled = node.getAttribute('grid') != '0' && (!this.chromeless || urlParams['grid'] == '1');
	this.graph.gridSize = parseFloat(node.getAttribute('gridSize')) || mxGraph.prototype.gridSize;
	this.graph.graphHandler.guidesEnabled = node.getAttribute('guides') != '0';
	this.graph.setTooltips(node.getAttribute('tooltips') != '0');
	this.graph.setConnectable(node.getAttribute('connect') != '0');
	this.graph.connectionArrowsEnabled = node.getAttribute('arrows') != '0';
	this.graph.foldingEnabled = node.getAttribute('fold') != '0';

	if (this.chromeless && this.graph.foldingEnabled)
	{
		this.graph.foldingEnabled = urlParams['nav'] == '1';
		this.graph.cellRenderer.forceControlClickHandler = this.graph.foldingEnabled;
	}
	
	var ps = node.getAttribute('pageScale');
	
	if (ps != null)
	{
		this.graph.pageScale = ps;
	}
	else
	{
		this.graph.pageScale = mxGraph.prototype.pageScale;
	}

	if (!this.graph.lightbox)
	{
		var pv = node.getAttribute('page');
	
		if (pv != null)
		{
			this.graph.pageVisible = (pv != '0');
		}
		else
		{
			this.graph.pageVisible = this.graph.defaultPageVisible;
		}
	}
	else
	{
		this.graph.pageVisible = false;
	}
	
	this.graph.pageBreaksVisible = this.graph.pageVisible; 
	this.graph.preferPageSize = this.graph.pageBreaksVisible;
	
	var pw = node.getAttribute('pageWidth');
	var ph = node.getAttribute('pageHeight');
	
	if (pw != null && ph != null)
	{
		this.graph.pageFormat = new mxRectangle(0, 0, parseFloat(pw), parseFloat(ph));
	}

// Added EFE 20140116
		// Load saved preferences
	var thisGraphPreferences = this.graph.preferences || [];
	var attrlist = node.attributes;
	var lattr = attrlist.length;
	[].slice.call(attrlist).forEach(function(attr) {
		if (attr.name.search('custompreference.drawioconfig') >= 0)
		{
				id = mxSettings.key;
				if (!thisGraphPreferences[id])
					thisGraphPreferences[id] = new Object();
				thisGraphPreferences[id] = attr.value;
		} else
		if (attr.name.search('custompreference.') >= 0)
		{
			var id = attr.name.replace('custompreference.','');
			if (id.search('multilist') >= 0)
			{
				// multilist for labels
				id = id.replace('multilist.','');
				id = id.replace('LabelOf','mxgraph.glpi.').toLowerCase();
				if (!thisGraphPreferences[id])
					thisGraphPreferences[id] = new Object();
				thisGraphPreferences[id].type = 'multilist';
			}
			else
			if (id.search('list')>= 0)
			{
				id = id.replace('list.','');
				if (!thisGraphPreferences[id])
					thisGraphPreferences[id] = new Object();
				thisGraphPreferences[id].type = 'list';
			}
			else
			if (id.search('radio')>= 0)
			{
				id = id.replace('radio.','');
				if (!thisGraphPreferences[id])
					thisGraphPreferences[id] = new Object();
				thisGraphPreferences[id].type = 'radio';
			}
			else
			{
				id = id.replace('LabelOf','mxgraph.glpi.').toLowerCase();
				thisGraphPreferences[id] = new Object();
				thisGraphPreferences[id].type = 'multilist';
			}
			thisGraphPreferences[id].id = id;
			thisGraphPreferences[id].description = (mxResources.get(id)) || ('Label of '+id);
			thisGraphPreferences[id].values = attr.value.split(",");
		}
	});
	mxSettings.load();
// end of Added EFE 20140116

	// Loads the persistent state settings
	var bg = node.getAttribute('background');
	
	if (bg != null && bg.length > 0)
	{
		this.graph.background = bg;
	}
	else
	{
		this.graph.background = this.graph.defaultGraphBackground;
	}
};

// Inspired by Editor.js : Save the graph
/**
 * Returns the XML node that represents the current diagram.
 */
Editor.prototype.getGraphXml = function(ignoreSelection)
{
	ignoreSelection = (ignoreSelection != null) ? ignoreSelection : true;
	var node = null;
	
	if (ignoreSelection)
	{
		var enc = new mxCodec(mxUtils.createXmlDocument());
		node = enc.encode(this.graph.getModel());
	}
	else
	{
		node = this.graph.encodeCells(mxUtils.sortCells(this.graph.model.getTopmostCells(
			this.graph.getSelectionCells())));
	}

	if (this.graph.view.translate.x != 0 || this.graph.view.translate.y != 0)
	{
		node.setAttribute('dx', Math.round(this.graph.view.translate.x * 100) / 100);
		node.setAttribute('dy', Math.round(this.graph.view.translate.y * 100) / 100);
	}
	
	node.setAttribute('grid', (this.graph.isGridEnabled()) ? '1' : '0');
	node.setAttribute('gridSize', this.graph.gridSize);
	node.setAttribute('guides', (this.graph.graphHandler.guidesEnabled) ? '1' : '0');
	node.setAttribute('tooltips', (this.graph.tooltipHandler.isEnabled()) ? '1' : '0');
	node.setAttribute('connect', (this.graph.connectionHandler.isEnabled()) ? '1' : '0');
	node.setAttribute('arrows', (this.graph.connectionArrowsEnabled) ? '1' : '0');
	node.setAttribute('fold', (this.graph.foldingEnabled) ? '1' : '0');
	node.setAttribute('page', (this.graph.pageVisible) ? '1' : '0');
	node.setAttribute('pageScale', this.graph.pageScale);
	node.setAttribute('pageWidth', this.graph.pageFormat.width);
	node.setAttribute('pageHeight', this.graph.pageFormat.height);
// Added EFE 20140116
	node.setAttribute('viewScale', this.graph.view.scale);
	// Save diagram's preferences
	for (var preference in this.graph.preferences)
	{
		if (typeof this.graph.preferences[preference].values != "function"
		&& typeof this.graph.preferences[preference].values != "undefined"
		&& preference != mxSettings.key)
		{
			node.setAttribute('custompreference.'+this.graph.preferences[preference].type+'.'+this.graph.preferences[preference].id, this.graph.preferences[preference].values);
		} 
		else 
		{
			if (preference == mxSettings.key)
				node.setAttribute('custompreference.drawioconfig', this.graph.preferences[preference]);
		}
	}
// end of Added EFE 20140116

	if (this.graph.background != null)
	{
		node.setAttribute('background', this.graph.background);
	}
	
	return node;
};

// Inspired from mxClient.js, to paint icon on vertex and edge shapes
/**
 * Function: paint
 * 
 * Generic rendering code.
 */
mxShape.prototype.paint = function(c)
{
	var strokeDrawn = false;
	
	if (c != null && this.outline)
	{
		var stroke = c.stroke;
		
		c.stroke = function()
		{
			strokeDrawn = true;
			stroke.apply(this, arguments);
		};

		var fillAndStroke = c.fillAndStroke;
		
		c.fillAndStroke = function()
		{
			strokeDrawn = true;
			fillAndStroke.apply(this, arguments);
		};
	}

	// Scale is passed-through to canvas
	var s = this.scale;
	var x = this.bounds.x / s;
	var y = this.bounds.y / s;
	var w = this.bounds.width / s;
	var h = this.bounds.height / s;

	if (this.isPaintBoundsInverted())
	{
		var t = (w - h) / 2;
		x += t;
		y -= t;
		var tmp = w;
		w = h;
		h = tmp;
	}
	
	this.updateTransform(c, x, y, w, h);
	this.configureCanvas(c, x, y, w, h);

	// Adds background rectangle to capture events
	var bg = null;
	
	if ((this.stencil == null && this.points == null && this.shapePointerEvents) ||
		(this.stencil != null && this.stencilPointerEvents))
	{
		var bb = this.createBoundingBox();
		
		if (this.dialect == mxConstants.DIALECT_SVG)
		{
			bg = this.createTransparentSvgRectangle(bb.x, bb.y, bb.width, bb.height);
			this.node.appendChild(bg);
		}
		else
		{
			var rect = c.createRect('rect', bb.x / s, bb.y / s, bb.width / s, bb.height / s);
			rect.appendChild(c.createTransparentFill());
			rect.stroked = 'false';
			c.root.appendChild(rect);
		}
	}

	if (this.stencil != null)
	{
		this.stencil.drawShape(c, this, x, y, w, h);
	}
	else
	{
		// Stencils have separate strokewidth
		c.setStrokeWidth(this.strokewidth);
		
		if (this.points != null)
		{
			// Paints edge shape
			var pts = [];
			
			for (var i = 0; i < this.points.length; i++)
			{
				if (this.points[i] != null)
				{
					pts.push(new mxPoint(this.points[i].x / s, this.points[i].y / s));
				}
			}

			this.paintEdgeShape(c, pts);
// Added EFE 20141210
			var displayIcon = 'true';
			if (c.state && c.state.view && c.state.view.graph && c.state.view.graph.preferences && c.state.view.graph.preferences.displayIconOnEdge)
				displayIcon = c.state.view.graph.preferences.displayIconOnEdge.values[0];
			if (displayIcon && displayIcon.toLowerCase() == 'true')
			{
					if (this.image != null)
					{
						var cellBounds = this.state.getCellBounds(x, y, w, h);
						var bounds = this.getImageBounds(cellBounds.x, cellBounds.y, cellBounds.width, cellBounds.height);
						c.state.dx = x - cellBounds.x;	// position image at the right place by changing canvas dx & dy (modified by mxAbstractCanvas2D.prototype.translate in some calls to paintEdgeShape)
						c.state.dy = y - cellBounds.y;
						c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.image, false, false, false);
					}
			}
// End of Added EFE 20141210
		}
		else
		{
			// Paints vertex shape
			this.paintVertexShape(c, x, y, w, h);
// Added EFE 20141210
			if (this.state)
			{	
				var displayIcon = this.state.view.graph.preferences.displayIconOnVertex.values[0];
				if (displayIcon && displayIcon.toLowerCase() == 'true')
				{
					if (this.image != null)
					{
						var cellBounds = this.state.getCellBounds(x, y, w, h);
						var bounds = this.getImageBounds(cellBounds.x, cellBounds.y, cellBounds.width, cellBounds.height);
						c.state.dx = x - cellBounds.x;	// position image at the right place by changing canvas dx & dy (modified by mxAbstractCanvas2D.prototype.translate in some calls to paintVertexShape)
						c.state.dy = y - cellBounds.y;
						c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.image, false, false, false);
					}
				}
			}
// End of Added EFE 20141210
		}
	}
	
	if (bg != null && c.state != null && c.state.transform != null)
	{
		bg.setAttribute('transform', c.state.transform);
	}
	
	// Draws highlight rectangle if no stroke was used
	if (c != null && this.outline && !strokeDrawn)
	{
		c.rect(x, y, w, h);
		c.stroke();
	}
};

mxShape.prototype.getImageBounds = function(x, y, w, h)
{
	var align = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_ALIGN, mxConstants.ALIGN_LEFT);
	var valign = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
	var width = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_WIDTH, mxConstants.DEFAULT_IMAGESIZE);
	var height = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_HEIGHT, mxConstants.DEFAULT_IMAGESIZE);
	var spacing = mxUtils.getNumber(this.style, mxConstants.STYLE_SPACING, this.spacing) + 5;

	if (align == mxConstants.ALIGN_CENTER)
	{
		x += (w - width) / 2;
	}
	else if (align == mxConstants.ALIGN_RIGHT)
	{
		x += w - width - spacing;
	}
	else // default is left
	{
		x += spacing;
	}

	if (valign == mxConstants.ALIGN_TOP)
	{
		y += spacing;
	}
	else if (valign == mxConstants.ALIGN_BOTTOM)
	{
		y += h - height - spacing;
	}
	else // default is middle
	{
		y += (h - height) / 2;
	}
	
	return new mxRectangle(x, y, width, height);
};

mxSvgCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
{
	src = this.converter.convert(src);
	
	// LATER: Add option for embedding images as base64.
	aspect = (aspect != null) ? aspect : true;
	flipH = (flipH != null) ? flipH : false;
	flipV = (flipV != null) ? flipV : false;
	
	var s = this.state;
	x += s.dx;
	y += s.dy;
	
	var node = this.createElement('image');
	node.setAttribute('x', this.format(x * s.scale) + this.imageOffset);
	node.setAttribute('y', this.format(y * s.scale) + this.imageOffset);
	node.setAttribute('width', this.format(w * s.scale));
	node.setAttribute('height', this.format(h * s.scale));
	
	// Workaround for missing namespace support
	if (node.setAttributeNS == null)
	{
		node.setAttribute('xlink:href', src);
	}
	else
	{
		node.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', src);
	}
	
	if (!aspect)
	{
		node.setAttribute('preserveAspectRatio', 'none');
	}

	if (s.alpha < 1 || s.fillAlpha < 1)
	{
		node.setAttribute('opacity', s.alpha * s.fillAlpha);
	}
	
	var tr = this.state.transform || '';
	
	if (flipH || flipV)
	{
		var sx = 1;
		var sy = 1;
		var dx = 0;
		var dy = 0;
		
		if (flipH)
		{
			sx = -1;
			dx = -w - 2 * x;
		}
		
		if (flipV)
		{
			sy = -1;
			dy = -h - 2 * y;
		}
		
		// Adds image tansformation to existing transform
		tr += 'scale(' + sx + ',' + sy + ')translate(' + (dx * s.scale) + ',' + (dy * s.scale) + ')';
	}

	if (tr.length > 0)
	{
		node.setAttribute('transform', tr);
	}
	
	if (!this.pointerEvents)
	{
		node.setAttribute('pointer-events', 'none');
	}
	
	this.root.appendChild(node);
};

/*mxLabel.prototype.paintForeground = function(c, x, y, w, h)
{
// Added EFE 20141210
	var displayIcon = this.state.view.graph.preferences.displayIconOnVertex.values[0];
	if (displayIcon && displayIcon.toLowerCase() == 'true')
	{
		this.paintImage(c, x, y, w, h);
	}
// End of Added EFE 20141210
	this.paintIndicator(c, x, y, w, h);
	
	mxRectangleShape.prototype.paintForeground.apply(this, arguments);
};

mxPolyline.prototype.paintEdgeShape = function(c, pts)
{
	if (this.style == null || this.style[mxConstants.STYLE_CURVED] != 1)
	{
		this.paintLine(c, pts, this.isRounded);
	}
	else
	{
		this.paintCurvedLine(c, pts);
	}

// Added EFE 20141210
	if (c.state && c.state.view && c.state.view.graph && c.state.view.graph.preferences && c.state.view.graph.preferences.displayIconOnEdge)
		var displayIcon = c.state.view.graph.preferences.displayIconOnEdge.values[0];
//		var displayIcon = window.grapheditor.editor.graph.preferences.displayIconOnEdge.values[0];
	if (displayIcon && displayIcon.toLowerCase() == 'true')
	{
		this.paintImage(c, pts);
	}
};
*/
// Added EFE 20141201
/**
 * Function: addRadioInput
 * 
 * Adds a radio button input for the given radio.
 */
mxForm.prototype.addRadioInput = function(element, label, value, isSelected, id)
{
	var radioinput = document.createElement('input');
	
	if (id)
		radioinput.setAttribute('name', id);
	radioinput.setAttribute('type', 'radio');
	radioinput.setAttribute('value', value);
	
	if (isSelected)
	{
		radioinput.setAttribute('checked', isSelected);
	}

	element.appendChild(radioinput);
	mxUtils.write(element, label);
	return radioinput;
};

/**
 * Function: addRadio
 * 
 * Adds a new row with the name and the input field in two columns and
 * returns the given input.
 */
mxForm.prototype.addRadio = function(name)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	mxUtils.write(td, name);
	tr.appendChild(td);
	
	td = document.createElement('td');
	tr.appendChild(td);
	this.body.appendChild(tr);
	
	return td;
};

/**
 * Function: addComboMove
 * 
 * Adds 2 combo for moving options and selections from one to the other for the given name and returns the combo.
 */
mxForm.prototype.addComboMove = function(name, isMultiSelect, size)
{
	var options = document.createElement('select');
	var selections = document.createElement('select');
	
	if (size != null)
	{
		options.setAttribute('size', size);
		selections.setAttribute('size', size);
	}
	
	if (isMultiSelect)
	{
		options.setAttribute('multiple', 'true');
//		selections.setAttribute('multiple', 'true');
	}
	
	if (name)
	{
		options.setAttribute('name', name + 'Options');
		selections.setAttribute('name', name + 'Selections');
	}

	return this.addFieldMove(name, options, selections);
};

/**
 * Function: addFieldMove
 * 
 * Adds a new row with the name, the input field, the move buttons, the output field, the up/down buttons in 4 columns and
 * returns the given input.
 */
mxForm.prototype.addFieldMove = function(name, input, output)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	mxUtils.write(td, name);
	tr.appendChild(td);
	
	td = document.createElement('td');
	td.appendChild(input);
	tr.appendChild(td);
	
	td = document.createElement('td');
	td.setAttribute("align", "center");
	td.setAttribute("valign", "middle");
	// Adds the -> button
	var button = document.createElement('button');
	mxUtils.write(button, '\u2192');
	td.appendChild(button);

	mxEvent.addListener(button, 'click', function()
	{
//		move(input, output)
		for (var i = 0 ; i < input.options.length ; i++)
		{
			if (input.options[i].selected)
			{
				var option = document.createElement("option");
				option.text = input.options[i].text;
				option.setAttribute('value', input.options[i].getAttribute('value'));
				output.add(option);
				input.remove(i);
				input.setAttribute('modified', true);
				output.setAttribute('modified', true);
			}
		}
	});
	// Adds the <- button
	button = document.createElement('button');
	var arrow = document.createNode
	mxUtils.write(button, '\u2190');
	td.appendChild(button);

	mxEvent.addListener(button, 'click', function()
	{
//		move(output, input)
		for (var i = 0 ; i < output.options.length ; i++)
		{
			if (output.options[i].selected)
			{
				var option = document.createElement("option");
				option.text = output.options[i].text;
				option.setAttribute('value', output.options[i].getAttribute('value'));
				input.add(option);
				output.remove(i);
				input.setAttribute('modified', true);
				output.setAttribute('modified', true);
			}
		}
	});
	tr.appendChild(td);
	
	td = document.createElement('td');
	td.appendChild(output);
	tr.appendChild(td);
	
	td = document.createElement('td');
	td.setAttribute("align", "center");
	td.setAttribute("valign", "middle");
	// Adds the up button
	button = document.createElement('button');
	mxUtils.write(button, '\u2191');
	td.appendChild(button);

	mxEvent.addListener(button, 'click', function()
	{
//		moveup(output)
		var index = output.options.selectedIndex;
		if (index > 0)
		{
			var option = document.createElement("option");
			option.text = output.options[index].text;
			option.setAttribute('value', output.options[index].getAttribute('value'));
			option.setAttribute('selected', true);
			output.remove(index);
			output.add(option, output[index - 1]);
			output.setAttribute('modified', true);
		}
	});
	// Adds the down button
	button = document.createElement('button');
	mxUtils.write(button, '\u2193');
	td.appendChild(button);

	mxEvent.addListener(button, 'click', function()
	{
//		movedown(output)
		var index = output.options.selectedIndex;
		if (index < output.options.length)
		{
			var option = document.createElement("option");
			option.text = output.options[index].text;
			option.setAttribute('value', output.options[index].getAttribute('value'));
			option.setAttribute('selected', true);
			output.remove(index);
			output.add(option, output[index + 1]);
			output.setAttribute("modified", true);
		}
	});
	tr.appendChild(td);
	
	this.body.appendChild(tr);
	
	var bothcombos = [input, output];
	return bothcombos;
};
// End of Added EFE 20141201
// Added EFE 20140103
	var DisplayPreferencesDialog = function(editorUi)
	{
		var thisEditor = editorUi.editor;
		var graph = editorUi.editor.graph;
		var bounds = graph.getGraphBounds();
		var scale = graph.view.scale;
	
//		var width = Math.ceil(bounds.width / scale);
//		var height = Math.ceil(bounds.height / scale);

		var row, td;
	
		// Creates a form for the graph preferences
		var div = document.createElement('div');
		var form = new mxForm('displaypreferences');
		form.table.style.width = '100%';
		form.table.setAttribute('cellpadding', (mxClient.IS_SF) ? '0' : '2');
	
		// Adds a field for the columnname
		var lineCount = 0;
		var charCount = 0;
		var fields = [];
		var firstField = null;
		// list the stencils present in the model and for each one, add an entry in graph.preferences
		if (graph && !graph.preferences)
		{
			graph.preferences = [];
		}
		var thisCells = graph.model.cells;
		for (var key in thisCells)
		{
			thisCell = thisCells[key];
			if (thisCell.customproperties)
			{
				var stencil = thisCell.customproperties.stencil || null;
				if (stencil && (!graph.preferences || !graph.preferences[stencil]))
				{
					//set preference id to stencil name
					graph.preferences[stencil] = new Object();
				}
				if (stencil && (!graph.preferences || !graph.preferences[stencil].id))
				{
					// get the name of the stencil
					graph.preferences[stencil].id = stencil;
//					graph.preferences[stencil].description = mxResources.get(stencil) || 'Label of'+mxStencilRegistry.getStencil(stencil).desc.getAttribute('name');
					graph.preferences[stencil].description = mxResources.get(stencil) || 'Label of'+stencil;
					graph.preferences[stencil].type = 'multilist';
					graph.preferences[stencil].values = ['name'];
				}
				if (stencil && (!graph.preferences || !graph.preferences[stencil].options))
				{
					//set preference options to column list
					graph.preferences[stencil].options = thisCell.customproperties.autocompletejointcolumns.split(",") || ['name','description'];
				}
			}
		}
		// organize the options : keep only the aliases of 'autocompletejointcolumns' and put selected values ahead of list
		for ( var stencil in graph.preferences)
		{
			if (typeof(graph.preferences[stencil]) != "function"
			&& stencil.search('mxgraph.glpi') >= 0
			&& graph.preferences[stencil].options)
			{
				for ( var option = 0; option < graph.preferences[stencil].options.length ; option++)
				{
					graph.preferences[stencil].options[option] = graph.preferences[stencil].options[option].replace(/[\s]*[\w.]*[\s]+as[\s]+/i,"").trim();
				}
				// put selected values of options ahead of list
				if (graph.preferences[stencil].values)
				{
					// remove the selected values in options array
					var index;
					for ( var value = 0; value < graph.preferences[stencil].values.length ; value++)
					{
						// find index of current value in options array and remove options entry
						index = graph.preferences[stencil].options.indexOf(graph.preferences[stencil].values[value]);
						if (index >= 0)
							graph.preferences[stencil].options.splice(index, 1);
					}
				}
			}
		}
		// let choose the values of a label layout for all labels of this stencil
		for (var preference in graph.preferences)
		{
			if (typeof graph.preferences[preference] != "function"
				&& graph.preferences[preference].type)
			{
				switch(graph.preferences[preference].type)
				{
					case 'list' :
					{
						var comboName = graph.preferences[preference].id;
						var comboSelections = (graph.preferences[preference].values) ? graph.preferences[preference].values : [];
						if (graph.preferences[preference].values)
							var comboSelected = graph.preferences[preference].values[0];
						else
							var comboSelected = graph.preferences[preference].value;
						var comboOptions = (graph.preferences[preference].options) ? graph.preferences[preference].options : [];
						var comboSize = Math.max(comboOptions.length, comboSelections.length);
						var fieldLabel = mxResources.get(comboName);
						if (!fieldLabel)
							fieldLabel = comboName;
						fields[preference] = form.addCombo(fieldLabel, false, comboSize);
						for (var option in comboOptions)
						{
							if (typeof  comboOptions[option] != "function"
							&& typeof  comboOptions[option] != "undefined")
							{
								var comboLabel = mxResources.get(preference+'.'+comboOptions[option]);
								if (!comboLabel)
									comboLabel = comboOptions[option];
								form.addOption(fields[preference],comboLabel, 
											comboOptions[option], (comboOptions[option] == comboSelected) ? true : false);
							}
						}
						if (firstField == null)
						{
							firstField = fields[preference];
						}
						lineCount += comboSize;
						charCount = (charCount < fieldLabel.length) ? fieldLabel.length : charCount;
						break;
					}
					case 'multilist' :
					{
						var comboName = graph.preferences[preference].id;
						var comboSelections = (graph.preferences[preference].values) ? graph.preferences[preference].values : [];
						var comboOptions = (graph.preferences[preference].options) ? graph.preferences[preference].options : [];
						var comboSize = Math.max(comboOptions.length, comboSelections.length);
						var fieldLabel = mxResources.get(comboName);
						if (!fieldLabel)
							fieldLabel = comboName;
						fields[preference] = form.addComboMove(fieldLabel, false, comboSize);
						for (var option in comboOptions)
						{
							if (typeof  comboOptions[option] != "function"
							&& typeof  comboOptions[option] != "undefined")
							{
								var comboLabel = mxResources.get(preference+'.'+comboOptions[option]);
								if (!comboLabel)
									comboLabel = comboOptions[option];
								form.addOption(fields[preference][0],comboLabel, 
											comboOptions[option], false);
							}
						}
						for (var selection in comboSelections)
						{
							if (typeof  comboSelections[selection] != "function"
							&& typeof  comboSelections[selection] != "undefined")
							{
								var comboLabel = mxResources.get(preference+'.'+comboSelections[selection]);
								if (!comboLabel)
									comboLabel = comboSelections[selection];
								form.addOption(fields[preference][1],comboLabel, 
											comboSelections[selection], true);
							}
						}
						if (firstField == null)
						{
							firstField = fields[preference][0];
						}
						lineCount += comboSize;
						charCount = (charCount < fieldLabel.length) ? fieldLabel.length : charCount;
						break;
					}
					case 'radio' :
					{	
						var fieldName = graph.preferences[preference].id;
						var fieldSelections = (graph.preferences[preference].values) ? graph.preferences[preference].values : [];
						if (graph.preferences[preference].values)
							var fieldSelected = graph.preferences[preference].values[0];
						else
							var fieldSelected = graph.preferences[preference].value;
						var fieldOptions = (graph.preferences[preference].options) ? graph.preferences[preference].options : [];
						var fieldLabel = mxResources.get(fieldName);
						if (!fieldLabel)
							fieldLabel = fieldName;
						fields[preference] = form.addRadio(fieldLabel);

						for (var option in fieldOptions)
						{
							if (typeof  fieldOptions[option] != "function"
							&& typeof  fieldOptions[option] != "undefined")
							{
								var fieldLabel = mxResources.get(preference+'.'+fieldOptions[option]);
								if (!fieldLabel)
									fieldLabel = fieldOptions[option];
								form.addRadioInput(fields[preference], fieldLabel, 
										fieldOptions[option], (fieldOptions[option] == fieldSelected) ? true : false, preference);
							}
						}
						if (firstField == null)
						{
							firstField = fields[preference];
						}
						lineCount += 1;
						charCount = (charCount < fieldLabel.length) ? fieldLabel.length : charCount;
						break;
					}
				}
			}
		}

		// Defines the function to be executed when the
		// OK button is pressed in the dialog
		var saveBtn = mxUtils.button(mxResources.get('save'), mxUtils.bind(this, function()
		{
			for (var ifield in fields)
			{
				switch(graph.preferences[ifield].type)
				{
					case 'list' :
					{
						if (typeof fields[ifield].values != "function"
							&& typeof fields[ifield].values != "object"
							&& typeof fields[ifield].values != "undefined")
						{
							if (graph.preferences[ifield].values != fields[ifield].values)
							{
								// update field retaining the choosen preference
								graph.preferences[ifield].values = fields[ifield].values;
								thisEditor.modified = true;
								if (graph.preferences[ifield].id == 'label')
								{
									// change cell labels according to choice
									var customproperty = graph.preferences[ifield].value;
									for (var icell in graph.model.cells)
									{
										if (graph.model.cells[icell].customproperties && graph.model.cells[icell].customproperties[customproperty])
										{
											graph.cellLabelChanged(graph.model.cells[icell],graph.model.cells[icell].customproperties[customproperty],false);
										}
									}
								}
							}
						}
						break;
					}
					case 'multilist' :
					{
						if (fields[ifield][0].hasAttribute("modified"))
						{
							graph.preferences[ifield].options = [];
							for (var ioption = 0 ; ioption < fields[ifield][0].options.length ; ioption++)
							{
								graph.preferences[ifield].options.push(fields[ifield][0].options[ioption].getAttribute('value'));
							}
						}
						if (fields[ifield][1].hasAttribute("modified"))
						{
							// update field retaining the choosen preference
							graph.preferences[ifield].values = [];
							for (var ioption = 0 ; ioption < fields[ifield][1].options.length ; ioption++)
							{
								graph.preferences[ifield].values.push(fields[ifield][1].options[ioption].getAttribute('value'));
							}
						
							thisEditor.modified = true;
						}
						break;
					}
					case 'radio' :
					{
						var radio = document.getElementsByName(ifield);
						for (var i in radio) 
						{
							if (typeof radio[i].value != "function"
								&& typeof radio[i].value != "object"
								&& typeof radio[i].value != "undefined")
							{
								// update field retaining the choosen preference
								if (radio[i].checked) 
								{
									if (!graph.preferences[ifield].values || graph.preferences[ifield].values[0] != radio[i].value)
									{
										graph.preferences[ifield].values = [];
										graph.preferences[ifield].values.push(radio[i].value);
										thisEditor.modified = true;
											// only one radio can be logically checked, don't check the rest
										break;
									}
								}
							}
						}
						break;
					}
				}
			}
				
			// change every cell labels according to choice
			var c = graph.view.canvas;
//			console.log('preferences', graph.preferences);
			for (var icell in graph.model.cells)
			{
				var ishape = graph.model.cells[icell].mxObjectId;
				var shape = graph.view.states.map[ishape].shape;
				var displayIcon = null;
				if (graph.model.cells[icell].customproperties)
				{
					var newLabel = '';
					// look for a label preference according to the cell's stencil
					for (ifield in graph.preferences)
					{
						if (graph.preferences[ifield].description
						&& graph.preferences[ifield].description.substring(0,5).toLowerCase() == 'label'
						&& graph.model.cells[icell].customproperties['stencil'] == ifield)
						{
							for (ivalue in graph.preferences[ifield].values)
							{
								var customproperty = graph.preferences[ifield].values[ivalue];
								// compose the new label from each customproperty, separated by a newline
								if (graph.model.cells[icell].customproperties[customproperty])
								{
									if (newLabel != '')
										newLabel += '\n';
									newLabel += graph.model.cells[icell].customproperties[customproperty];
								}
							}
						}
					}
					if (newLabel)
					{
						graph.cellLabelChanged(graph.model.cells[icell], newLabel,false);
					}
				}
				
				if (graph.model.cells[icell].vertex)
				{
					if (graph.preferences && graph.preferences.displayIconOnVertex)
						displayIcon = graph.preferences.displayIconOnVertex.values[0];
				} else
				if (graph.model.cells[icell].edge)
				{
					if (graph.preferences && graph.preferences.displayIconOnEdge)
						displayIcon = graph.preferences.displayIconOnEdge.values[0];
				}
				if (displayIcon && displayIcon.toLowerCase() == 'true')
				{
					if (shape.image)
						shape.redraw();
				}
				else if (displayIcon && displayIcon.toLowerCase() == 'false')
				{
					// remove image element in DOM
					for (var iimage in shape.node.childNodes)
					{	if (shape.node.childNodes[iimage].nodeName == 'image')
						{	shape.node.removeChild(shape.node.childNodes[iimage]);
							break;
						}
					}
				}
			}
			editorUi.hideDialog();
		}));
		saveBtn.className = 'geBtn gePrimaryBtn';
			
		var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
		{
			editorUi.hideDialog();
		});
		cancelBtn.className = 'geBtn';
	
		if (firstField)
			firstField.focus();
	//	firstField.select();
		if (editorUi.editor.cancelFirst)
		{
			form.table.appendChild(cancelBtn);
			form.table.appendChild(saveBtn);
		}
		else
		{
			form.table.appendChild(saveBtn);
			form.table.appendChild(cancelBtn);
		}

		form.addButtons();
		form.table.style.overflowY = 'auto';
		width = charCount * 20 + 400 ;
		div.style.width = width + "px"
		height = lineCount * 25 + 80;
		div.style.height = height + "px";
			
		div.appendChild(form.table);
		this.container = div;
		this.container.style.width = width + "px"
		this.container.style.height = height + "px";
	};

// End of Added EFE 20140103
// Autocomplete ---------------------------------------------------------------------------------------------------------------------------------------

// Added EFE 20170902
/**
 * Function: getContainingCellFor
 * 
 * Returns the upper-most cell that intersects the given point (x, y) in
 * the cell hierarchy starting at the given parent. This will also return
 * swimlanes if the given location intersects the content area of the
 * swimlane. If this is not desired, then the <hitsSwimlaneContent> may be
 * used if the returned cell is a swimlane to determine if the location
 * is inside the content area or on the actual title of the swimlane.
 * 
 * Parameters:
 * 
 * x - X-coordinate of the location to be checked.
 * y - Y-coordinate of the location to be checked.
 * parent - <mxCell> that should be used as the root of the recursion.
 * Default is <defaultParent>.
 * vertices - Optional boolean indicating if vertices should be returned.
 * Default is true.
 * edges - Optional boolean indicating if edges should be returned. Default
 * is true.
 */
mxGraph.prototype.getContainingCellFor = function(cell)
{
	var parent = cell.parent;

	if (parent != null)
	{
		var childCount = parent.getIndex(cell);
		for (var i = childCount - 1; i >= 0; i--)
		{
			var containingCell = this.model.getChildAt(parent, i);
			
			if (containingCell && this.isCellVisible(containingCell) && this.model.isVertex(containingCell))
			{
				
				if (cell.geometry.x >= containingCell.geometry.x // check that cell's upper left corner is on right of containingCell
				&& cell.geometry.y >= containingCell.geometry.y // check that cell's upper left corner is lower than containingCell
				&& cell.geometry.x+cell.geometry.width <= containingCell.geometry.x+containingCell.geometry.width // check that cell's lower right corner is on left of containingCell
				&& cell.geometry.y+cell.geometry.height <= containingCell.geometry.y+containingCell.geometry.height // check that cell's lower right corner is upper than containingCell
				)
				{
					return containingCell;
				}
			}
		}
	}
	
	return null;
};

// End of Added EFE 20170902

/**
 * Function: installListeners
 * 
 * Installs listeners for focus, change and standard key event handling.
 */
mxCellEditor.prototype.installListeners = function(elt)
{
	// Applies value if focus is lost
	mxEvent.addListener(elt, 'blur', mxUtils.bind(this, function(evt)
	{
		if (this.blurEnabled)
		{
			this.focusLost(evt);
		}
	}));

	// Updates modified state and handles placeholder text
	mxEvent.addListener(elt, 'keydown', mxUtils.bind(this, function(evt)
	{
		if (!mxEvent.isConsumed(evt))
		{
			if (this.isStopEditingEvent(evt))
			{
				this.graph.stopEditing(false);
				mxEvent.consume(evt);
			}
			else if (evt.keyCode == 27 /* Escape */)
			{
				this.graph.stopEditing(this.isCancelEditingKeyEvent(evt));
				mxEvent.consume(evt);
			}
		}
	}));

	// Keypress only fires if printable key was pressed and handles removing the empty placeholder
	var keypressHandler = mxUtils.bind(this, function(evt)
	{
		if (editorUi.editor.graph.cellEditor.editingCell != null)
		{
			// Clears the initial empty label on the first keystroke
			// and workaround for FF which fires keypress for delete and backspace
			if (editorUi.editor.clearOnChange && elt.innerHTML == editorUi.editor.getEmptyLabelText() &&
				(!mxClient.IS_FF || (evt.keyCode != 8 /* Backspace */ && evt.keyCode != 46 /* Delete */)))
			{
				editorUi.editor.clearOnChange = false;
				elt.innerHTML = '';
			}
// Added EFE 20170902 : autocomplete cell with glpi values
			var thisCell = editorUi.editor.graph.cellEditor.editingCell;
			var thistextarea = editorUi.editor.graph.cellEditor.textarea;
			var thisGraph = editorUi.editor.graph;
			var thisGraphModel = editorUi.editor.graph.model;
			var tablename = null;
			if (thisCell.customproperties) {
				var tablename = thisCell.customproperties['autocompletetable'] || null;	
			}
			if (tablename)
			{
				var columnname = thisCell.customproperties['autocompletecolumns'] || 'name'; // columnname is the comma-separated glpi columns for lookup
				var othercriteria = thisCell.customproperties['autocompleteotherselectioncriteria'] || '';
				var jointtables = thisCell.customproperties['autocompletejointtables'] || '';
				var jointcolumns = thisCell.customproperties['autocompletejointcolumns'] || '';
				var jointcriteria = thisCell.customproperties['autocompletejointcriteria'] || '';
				var ordercriteria = thisCell.customproperties['autocompleteordercriteria'] || '';
				var label = thisCell.customproperties['autocompletelabel'] || '';
				var labels = label.split("+");
				// Determine containing cell
				var x = thisCell.geometry.x;
				var y = thisCell.geometry.y;
				var containingCell = thisGraph.getContainingCellFor(thisCell);
				if (containingCell
				&& thisCell.geometry.x+thisCell.geometry.width <= containingCell.geometry.x+containingCell.geometry.width // check that thisCell is fully contained
				&& thisCell.geometry.y+thisCell.geometry.height <= containingCell.geometry.y+containingCell.geometry.height // check that thisCell is fully contained
				&& containingCell.customproperties 
				&& containingCell.customproperties.name 
				&& containingCell.customproperties.autocompletetable)
				{
					var name_parent = containingCell.customproperties.name;
					var table_parent = containingCell.customproperties.autocompletetable;
					if (tablename == table_parent)
					{
						// select only the GLPI objects that are the children of the containing cell
						othercriteria += (othercriteria ? " and " : " ")+tablename+".completename like '%%"+containingCell.customproperties.name+"%'";
					}
				}
				var firstcolumnname = columnname.split(",",1); //firstcolumnname is the 1st column name in the list to be displayed as graph's preference
				// look for a label preference according to the cell's stencil
				var ipreference = thisCell.customproperties['stencil'] || '';
				if (thisGraph.preferences && thisGraph.preferences[ipreference] && thisGraph.preferences[ipreference].description
				&& thisGraph.preferences[ipreference].description.substring(0,5).toLowerCase() == 'label')
				{
					var thisPreferences = thisGraph.preferences[ipreference];
				}
				$(thistextarea).autocomplete({
					minLength: 2,
					source: function(request, response){
						//pass request to server  
						$.ajax({
							url: window.DRAWIOINTEGRATION_PATH + '/ajax/autocomplete.php?callback=?',
							type:"get",
							dataType: 'text json',
							data: 'table=' + tablename + '&columns=' + columnname + (othercriteria ? '&othercriteria=' + encodeURIComponent(othercriteria) : '') 
								+ '&jointtables=' + encodeURIComponent(jointtables) + '&jointcolumns=' + encodeURIComponent(jointcolumns) + '&jointcriteria=' + encodeURIComponent(jointcriteria)
								+ (ordercriteria ? '&ordercriteria=' + encodeURIComponent(ordercriteria) : '')
								+ '&term=' + request.term,
							async: true,
							cache: true,
							success: function(data){
								response( $.map( data, function (item, index) {
									var labellist = "";
									for (i = 0; i < labels.length ; i++)
									{
										// If the item exists, add current value of "autocompletecssclass" to the list
										if (item[labels[i]])
											labellist += item[labels[i]];
										// If the item is null, add 'unknown' to the list
										else if (item[labels[i]] === null)
											labellist += 'unknown';
										else
										// Otherwise, add simply the symbol as string
											labellist += labels[i].replace(/'/g,"");
									}
									// Change cell's label according to stencil preferences
									var newLabel = '';
									if (thisPreferences) 
									{
										for (ivalue in thisPreferences.values)
										{
											var customproperty = thisPreferences.values[ivalue];
											// compose the new label from each customproperty, separated by a newline
											if (item[customproperty])
											{
												if (newLabel != '')
													newLabel += '\n';
												newLabel += item[customproperty];
											}
										}
									}
									return {
											label:labellist,                                                                        
											archimap_id:item['id'],
											archimap_lookup:item[firstcolumnname],
											value:(newLabel) ? newLabel : item[firstcolumnname]
									}
								}));   						
							},
							error: function(xhr, textStatus, errorThrown) {
								alert("mxClient.js/autocomplete error (when getting source) : " + textStatus + " : " + errorThrown);
							}
						});
					},
					select: function(event, editorUi){
						// when an item is selected in the list, get other custom properties for this object from backend
						if (jointtables || jointtables == "")
						{
							var glpiCells = {};
							glpiCells[editorUi.item.archimap_id] = {};
							glpiCells[editorUi.item.archimap_id].key = '1';
							glpiCells[editorUi.item.archimap_id].tablename = tablename;
							glpiCells[editorUi.item.archimap_id].jointtables = jointtables;
							glpiCells[editorUi.item.archimap_id].jointcolumns = jointcolumns;
							glpiCells[editorUi.item.archimap_id].jointcriteria = jointcriteria;
							$.ajax({
								url: window.DRAWIOINTEGRATION_PATH + "/ajax/getcustomproperties.php?callback=?",
								type: "post",
								contentType: 'application/json',
								data: JSON.stringify(glpiCells),
								dataType: 'text json',
								success: function(datas){
									for (var key in datas)
									{
										var data = datas[key];
										for (var i in data)
										{
											if (data.hasOwnProperty(i)) 
											{
												thisCell.customproperties[i] = (data[i]) ? data[i] : "";
											}
										}
										// Add style classes to adapt cell's appearance (according to corresponding style in styles/default.xml)
										var customproperties = thisCell.customproperties;
										if (customproperties && customproperties['autocompletecssclass'])
										{
											var cssclassname = customproperties['autocompletecssclass'].split("+")
											var style = thisGraphModel.getStyle(thisCell);
											// remove old stylenames
											style = mxUtils.removeAllStylenames(style);
											var classlist = "";
											// add new class names
											for (i = 0; i < cssclassname.length ; i++)
											{
												// If the customproperty "autocompletecssclass" exists, add current value of "autocompletecssclass" to the element's class
												if (customproperties[cssclassname[i]])
													classlist += (typeof(customproperties[cssclassname[i]]) == 'string') 
																	? customproperties[cssclassname[i]].replace(/ /g,"_") : customproperties[cssclassname[i]];
												else
												// Otherwise, add simply the symbol as string
													classlist += cssclassname[i].replace(/'/g,"");
											}
											thisCell.customproperties['autocompleteaddedclass'] = classlist;
											thisGraphModel.setStyle(thisCell, style + ';' + classlist);
										}
										// Add hyperlink to cell
										if (customproperties && customproperties['autocompletelink'])
										{
											var link = "";
											var expression = customproperties['autocompletelink'];
											// replace customproperties mentioned in expression by their current value
											for (customproperty in customproperties)
											{
												if (customproperty.search(/autocomplete.*/) == -1) // skip 'autocomplete' properties
												{
													var regexpr = new RegExp(customproperty,"g");
													expression = expression.replace(regexpr,"'"+customproperties[customproperty]+"'");
												}
											}
											link += eval(expression); // add the result to the element's link
											thisCell.customproperties['autocompleteaddedlink'] = link;
											thisGraph.setLinkForCell(thisCell, link);
										}
									}
								},
								error: function(xhr, textStatus, errorThrown) {
									alert("autocomplete.js/autocomplete error (when selecting) : " + textStatus + " : " + errorThrown);
								}
							});
						}
					}
				})
				.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
					return $( "<li>" )
					.append( "<a>" + item.archimap_lookup + item.label + "</a>" )
					.appendTo( ul );
				};
			}
// End of Added EFE 20170902 : autocomplete cell with glpi values
		}
	});
	mxEvent.addListener(elt, 'keypress', keypressHandler);
	mxEvent.addListener(elt, 'paste', keypressHandler);
	
	// Handler for updating the empty label text value after a change
	var keyupHandler = mxUtils.bind(this, function(evt)
	{
		if (this.editingCell != null)
		{
			// Uses an optional text value for sempty labels which is cleared
			// when the first keystroke appears. This makes it easier to see
			// that a label is being edited even if the label is empty.
			// In Safari and FF, an empty text is represented by <BR> which isn't enough to force a valid size
			if (this.textarea.innerHTML.length == 0 || this.textarea.innerHTML == '<br>')
			{
				this.textarea.innerHTML = this.getEmptyLabelText();
				this.clearOnChange = this.textarea.innerHTML.length > 0;
			}
			else
			{
				this.clearOnChange = false;
			}
		}
	});

	mxEvent.addListener(elt, (!mxClient.IS_IE11 && !mxClient.IS_IE) ? 'input' : 'keyup', keyupHandler);
	mxEvent.addListener(elt, 'cut', keyupHandler);
	mxEvent.addListener(elt, 'paste', keyupHandler);

	// Adds automatic resizing of the textbox while typing using input, keyup and/or DOM change events
	var evtName = (!mxClient.IS_IE11 && !mxClient.IS_IE) ? 'input' : 'keydown';
	
	var resizeHandler = mxUtils.bind(this, function(evt)
	{
		if (this.editingCell != null && this.autoSize && !mxEvent.isConsumed(evt))
		{
			// Asynchronous is needed for keydown and shows better results for input events overall
			// (ie non-blocking and cases where the offsetWidth/-Height was wrong at this time)
			if (this.resizeThread != null)
			{
				window.clearTimeout(this.resizeThread);
			}
			
			this.resizeThread = window.setTimeout(mxUtils.bind(this, function()
			{
				this.resizeThread = null;
				this.resize();
			}), 0);
		}
	});
	
	mxEvent.addListener(elt, evtName, resizeHandler);

	if (document.documentMode >= 9)
	{
		mxEvent.addListener(elt, 'DOMNodeRemoved', resizeHandler);
		mxEvent.addListener(elt, 'DOMNodeInserted', resizeHandler);
	}
	else
	{
		mxEvent.addListener(elt, 'cut', resizeHandler);
		mxEvent.addListener(elt, 'paste', resizeHandler);
	}
};
// Display custom properties in side panel ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Inspired by drawio/src/main/webapp/js/mxgraph/Format.js
/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.refresh = function()
{
	// Performance tweak: No refresh needed if not visible
	if (this.container.style.width == '0px')
	{
		return;
	}
	
	this.clear();
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	var div = document.createElement('div');
	div.style.whiteSpace = 'nowrap';
	div.style.color = 'rgb(112, 112, 112)';
	div.style.textAlign = 'left';
	div.style.cursor = 'default';
	
	var label = document.createElement('div');
	label.className = 'geFormatSection';
	label.style.textAlign = 'center';
	label.style.fontWeight = 'bold';
	label.style.paddingTop = '8px';
	label.style.fontSize = '13px';
	label.style.borderWidth = '0px 0px 1px 1px';
	label.style.borderStyle = 'solid';
	label.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
	label.style.height = (mxClient.IS_QUIRKS) ? '34px' : '25px';
	label.style.overflow = 'hidden';
	label.style.width = '100%';
	this.container.appendChild(div);
	
	// Prevents text selection
    mxEvent.addListener(label, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
        mxUtils.bind(this, function(evt)
	{
		evt.preventDefault();
	}));

	var containsLabel = this.getSelectionState().containsLabel;
	var currentLabel = null;
	var currentPanel = null;
	
	var addClickHandler = mxUtils.bind(this, function(elt, panel, index)
	{
		var clickHandler = mxUtils.bind(this, function(evt)
		{
			if (currentLabel != elt)
			{
				if (containsLabel)
				{
					this.labelIndex = index;
				}
				else if (graph.isSelectionEmpty())
				{
					this.diagramIndex = index;
				}
				else
				{
					this.currentIndex = index;
				}
				
				if (currentLabel != null)
				{
					currentLabel.style.backgroundColor = this.inactiveTabBackgroundColor;
					currentLabel.style.borderBottomWidth = '1px';
				}

				currentLabel = elt;
				currentLabel.style.backgroundColor = '';
				currentLabel.style.borderBottomWidth = '0px';
				
				if (currentPanel != panel)
				{
					if (currentPanel != null)
					{
						currentPanel.style.display = 'none';
					}
					
					currentPanel = panel;
					currentPanel.style.display = '';
				}
			}
		});
		
		mxEvent.addListener(elt, 'click', clickHandler);
		
		// Prevents text selection
	    mxEvent.addListener(elt, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
        	mxUtils.bind(this, function(evt)
    	{
			evt.preventDefault();
		}));
		
		if (index == ((containsLabel) ? this.labelIndex : ((graph.isSelectionEmpty()) ?
			this.diagramIndex : this.currentIndex)))
		{
			// Invokes handler directly as a workaround for no click on DIV in KHTML.
			clickHandler();
		}
	});
	
	var idx = 0;

	if (graph.isSelectionEmpty())
	{
		mxUtils.write(label, mxResources.get('diagram'));
		label.style.borderLeftWidth = '0px';

		div.appendChild(label);
		var diagramPanel = div.cloneNode(false);
		this.panels.push(new DiagramFormatPanel(this, ui, diagramPanel));
		this.container.appendChild(diagramPanel);
		
		if (Editor.styles != null)
		{
			diagramPanel.style.display = 'none';
			label.style.width = (this.showCloseButton) ? '106px' : '50%';
			label.style.cursor = 'pointer';
			label.style.backgroundColor = this.inactiveTabBackgroundColor;
			
			var label2 = label.cloneNode(false);
			label2.style.borderLeftWidth = '1px';
			label2.style.borderRightWidth = '1px';
			label2.style.backgroundColor = this.inactiveTabBackgroundColor;
			
			addClickHandler(label, diagramPanel, idx++);
			
			var stylePanel = div.cloneNode(false);
			stylePanel.style.display = 'none';
			mxUtils.write(label2, mxResources.get('style'));
			div.appendChild(label2);
			this.panels.push(new DiagramStylePanel(this, ui, stylePanel));
			this.container.appendChild(stylePanel);
			
			addClickHandler(label2, stylePanel, idx++);
		}
		
		// Adds button to hide the format panel since
		// people don't seem to find the toolbar button
		// and the menu item in the format menu
		if (this.showCloseButton)
		{
			var label2 = label.cloneNode(false);
			label2.style.borderLeftWidth = '1px';
			label2.style.borderRightWidth = '1px';
			label2.style.borderBottomWidth = '1px';
			label2.style.backgroundColor = this.inactiveTabBackgroundColor;
			label2.style.position = 'absolute';
			label2.style.right = '0px';
			label2.style.top = '0px';
			label2.style.width = '25px';
			
			var img = document.createElement('img');
			img.setAttribute('border', '0');
			img.setAttribute('src', Dialog.prototype.closeImage);
			img.setAttribute('title', mxResources.get('hide'));
			img.style.position = 'absolute';
			img.style.display = 'block';
			img.style.right = '0px';
			img.style.top = '8px';
			img.style.cursor = 'pointer';
			img.style.marginTop = '1px';
			img.style.marginRight = '6px';
			img.style.border = '1px solid transparent';
			img.style.padding = '1px';
			img.style.opacity = 0.5;
			label2.appendChild(img)
			
			mxEvent.addListener(img, 'click', function()
			{
				ui.actions.get('formatPanel').funct();
			});
			
			div.appendChild(label2);
		}
	}
	else if (graph.isEditing())
	{
		mxUtils.write(label, mxResources.get('text'));
		div.appendChild(label);
		this.panels.push(new TextFormatPanel(this, ui, div));
	}
	else
	{
		label.style.backgroundColor = this.inactiveTabBackgroundColor;
		label.style.borderLeftWidth = '1px';
		label.style.cursor = 'pointer';
// Added EFE 20171110
		var cell = this.editorUi.editor.graph.getSelectionCell();
		var containsCustomProperties = (cell.customproperties ? true : false);
		var panelnbr = 3;  // Style+Text+Arrange
		if (containsLabel) panelnbr++;
		if (containsCustomProperties) panelnbr++;
//		label.style.width = (containsLabel) ? '50%' : '33.3%';
		label.style.width = 100/panelnbr + '%';
// End of Added EFE 20171110
		var label2 = label.cloneNode(false);
		var label3 = label2.cloneNode(false);
		var label4 = label3.cloneNode(false); // Added EFE 20171110

		// Workaround for ignored background in IE
		label2.style.backgroundColor = this.inactiveTabBackgroundColor;
		label3.style.backgroundColor = this.inactiveTabBackgroundColor;
		label4.style.backgroundColor = this.inactiveTabBackgroundColor; // Added EFE 20201127
		
		// Style
		if (containsLabel)
		{
			label2.style.borderLeftWidth = '0px';
		}
		else
		{
			label.style.borderLeftWidth = '0px';
			mxUtils.write(label, mxResources.get('style'));
			div.appendChild(label);
			
			var stylePanel = div.cloneNode(false);
			stylePanel.style.display = 'none';
			this.panels.push(new StyleFormatPanel(this, ui, stylePanel));
			this.container.appendChild(stylePanel);

			addClickHandler(label, stylePanel, idx++);
		}
		
		// Text
		mxUtils.write(label2, mxResources.get('text'));
		div.appendChild(label2);

		var textPanel = div.cloneNode(false);
		textPanel.style.display = 'none';
		this.panels.push(new TextFormatPanel(this, ui, textPanel));
		this.container.appendChild(textPanel);
		
		// Arrange
		mxUtils.write(label3, mxResources.get('arrange'));
		div.appendChild(label3);

		var arrangePanel = div.cloneNode(false);
		arrangePanel.style.display = 'none';
		this.panels.push(new ArrangePanel(this, ui, arrangePanel));
		this.container.appendChild(arrangePanel);
		
// Added EFE 20171110
		// Properties
		mxUtils.write(label4, mxResources.get('properties'));
		div.appendChild(label4);

		var propertiesPanel = div.cloneNode(false);
		propertiesPanel.style.display = 'none';
		this.panels.push(new PropertiesPanel(this, ui, propertiesPanel));
		this.container.appendChild(propertiesPanel);
		
		addClickHandler(label4, propertiesPanel, idx++);
// End of Added EFE 20171110

		addClickHandler(label2, textPanel, idx++);
		addClickHandler(label3, arrangePanel, idx++);
		addClickHandler(label4, propertiesPanel, idx++); // Added EFE 20201127
	}
};
// Added EFE 20171110
/**
 * Adds the label menu items to the given menu and parent.
 */
PropertiesPanel = function(format, editorUi, container)
{
	BaseFormatPanel.call(this, format, editorUi, container);
	this.init();
};

mxUtils.extend(PropertiesPanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
PropertiesPanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();
//	var ss = ui.getSelectionState();
	
	this.container.appendChild(this.addProperties(this.createPanel()));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
PropertiesPanel.prototype.addProperties = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();
//	var ss = ui.getSelectionState();
	// Create table 
	div.style.paddingTop = '0px';
	div.style.paddingBottom = '2px';

	var table = document.createElement('table');

	if (mxClient.IS_QUIRKS)
	{
		table.style.fontSize = '1em';
	}

	table.style.width = '100%';
	table.style.fontWeight = 'bold';
	table.style.paddingRight = '20px';
	var tbody = document.createElement('tbody');

	// Adds a field for the columnname
	var linecount = 0;
	var cell = graph.getSelectionCell();

	if (cell && cell.customproperties)
	// a cell is selected
	{
//		var title = (cell.customproperties['name']) ? cell.customproperties['name'] : cell.customproperties['glpi_id'];		
		for (var i in cell.customproperties)
		{
			if (i != 'id' &&
				i.substring(0,12) != 'autocomplete' &&
				i.substring(0,8) != 'onselect' &&
				typeof(cell.customproperties[i]) != 'function' &&
				typeof(cell.customproperties[i]) != 'object')
			{
				var row = document.createElement('tr');
				row.style.padding = '0px';
				var left = document.createElement('td');
				left.style.padding = '0px';
				left.style.width = '50%';
				left.setAttribute('valign', 'top');
				left.innerHTML = i;
	
				var right = left.cloneNode(true);
				right.style.paddingLeft = '8px';
				right.innerHTML = ': '+cell.customproperties[i];
				row.appendChild(left);
				row.appendChild(right);
				tbody.appendChild(row);
				linecount++;
			}
		}
		table.appendChild(tbody);
		div.appendChild(table);

	}
	return div;
};
// End of Added EFE 20171110
})
