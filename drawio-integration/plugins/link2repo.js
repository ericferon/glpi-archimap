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
/**
 * Link to repository plugin.
 */
window.DRAWIOINTEGRATION_PATH = '../../../../drawio-integration';
Draw.loadPlugin(function(ui)
{
//	console.log('entering link2repo plugin', ui);
// Add a mode "repository" (see drawio/src/main/webapp/js/diagramly/App.js)
	App.MODE_REPOSITORY = 'repository';
// Adds resource for plugin
	mxResources.add(window.DRAWIOINTEGRATION_PATH + '/resources/archi');
	var pluginDomain = document.location.protocol + '//' + document.location.hostname + window.location.pathname.substring(0,window.location.pathname.indexOf('/drawio'));
//--- Manage libraries in central repository --------------------------------------------------------------------------------------------------
// Add 'repository' to 'newLibrary' and 'openLibraryFrom' menu (inspired from diagramly/Menu.js)
    if (Editor.enableCustomLibraries)
	{
        var googleEnabled = ((urlParams['embed'] != '1' && urlParams['gapi'] != '0') ||
            (urlParams['embed'] == '1' && urlParams['gapi'] == '1')) && mxClient.IS_SVG &&
            isLocalStorage && (document.documentMode == null || document.documentMode >= 10);
        var dropboxEnabled = ((urlParams['embed'] != '1' && urlParams['db'] != '0') || (urlParams['embed'] == '1' && urlParams['db'] == '1')) &&
            mxClient.IS_SVG && (document.documentMode == null || document.documentMode > 9);
        var oneDriveEnabled = (window.location.hostname == 'www.draw.io' || window.location.hostname == 'test.draw.io' ||
            window.location.hostname == 'drive.draw.io' || window.location.hostname == 'app.diagrams.net') &&
            (((urlParams['embed'] != '1' && urlParams['od'] != '0') || (urlParams['embed'] == '1' && urlParams['od'] == '1')) &&
            !mxClient.IS_IOS && (navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10));
        var trelloEnabled = ((urlParams['embed'] != '1' && urlParams['tr'] != '0') || (urlParams['embed'] == '1' && urlParams['tr'] == '1')) &&
            mxClient.IS_SVG && (document.documentMode == null || document.documentMode > 9);
        // create the "New Library" menu
        ui.menus.put('newLibraryToRepository', new Menu(function(menu, parent)
        {
            menu.addItem(mxResources.get('repository') + '...', null, function()
            {
                ui.showLibraryDialog(null, null, null, null, App.MODE_REPOSITORY);
            }, parent);
            if (typeof(google) != 'undefined' && typeof(google.picker) != 'undefined')
            {
                if (ui.drive != null)
                {
                    menu.addItem(mxResources.get('googleDrive') + '...', null, function()
                    {
                        ui.showLibraryDialog(null, null, null, null, App.MODE_GOOGLE);
                    }, parent);
                }
                else if (googleEnabled && typeof window.DriveClient === 'function')
                {
                    menu.addItem(mxResources.get('googleDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
                    {
                        // do nothing
                    }, parent, null, false);
                }
            }

            if (ui.oneDrive != null)
            {
                menu.addItem(mxResources.get('oneDrive') + '...', null, function()
                {
                    ui.showLibraryDialog(null, null, null, null, App.MODE_ONEDRIVE);
                }, parent);
            }
            else if (oneDriveEnabled && typeof window.OneDriveClient === 'function')
            {
                menu.addItem(mxResources.get('oneDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
                {
                    // do nothing
                }, parent, null, false);
            }

            if (ui.dropbox != null)
            {
                menu.addItem(mxResources.get('dropbox') + '...', null, function()
                {
                    ui.showLibraryDialog(null, null, null, null, App.MODE_DROPBOX);
                }, parent);
            }
            else if (dropboxEnabled && typeof window.DropboxClient === 'function')
            {
                menu.addItem(mxResources.get('dropbox') + ' (' + mxResources.get('loading') + '...)', null, function()
                {
                    // do nothing
                }, parent, null, false);
            }
            
            menu.addSeparator(parent);
		
            if (ui.gitHub != null)
            {
                menu.addItem(mxResources.get('github') + '...', null, function()
                {
                    ui.showLibraryDialog(null, null, null, null, App.MODE_GITHUB);
                }, parent);
            }
            
            if (ui.gitLab != null)
            {
                menu.addItem(mxResources.get('gitlab') + '...', null, function()
                {
                    ui.showLibraryDialog(null, null, null, null, App.MODE_GITLAB);
                }, parent);
            }
            
            if (ui.trello != null)
            {
                menu.addItem(mxResources.get('trello') + '...', null, function()
                {
                    ui.showLibraryDialog(null, null, null, null, App.MODE_TRELLO);
                }, parent);
            }
            else if (trelloEnabled && typeof window.TrelloClient === 'function')
            {
                menu.addItem(mxResources.get('trello') + ' (' + mxResources.get('loading') + '...)', null, function()
                {
                    // do nothing
                }, parent, null, false);
            }
            
            menu.addSeparator(parent);
            
            if (isLocalStorage && urlParams['browser'] != '0')
            {
                menu.addItem(mxResources.get('browser') + '...', null, function()
                {
                    ui.showLibraryDialog(null, null, null, null, App.MODE_BROWSER);
                }, parent);
            }
		
            //if (!mxClient.IS_IOS)
            {
                menu.addItem(mxResources.get('device') + '...', null, function()
                {
                    ui.showLibraryDialog(null, null, null, null, App.MODE_DEVICE);
                }, parent);
            }
        }));

        // create the "Open Library from" menu
        ui.menus.put('openLibraryFromRepository', new Menu(function(menu, parent)
        {
            menu.addItem(mxResources.get('repository') + '...', null, function()
            {
                this.repository = new Repository(ui);
                this.repository.pickLibrary(App.MODE_REPOSITORY);
            }, parent);
            if (typeof(google) != 'undefined' && typeof(google.picker) != 'undefined')
            {
                if (ui.drive != null)
                {
                    menu.addItem(mxResources.get('googleDrive') + '...', null, function()
                    {
                        ui.pickLibrary(App.MODE_GOOGLE);
                    }, parent);
                }
                else if (googleEnabled && typeof window.DriveClient === 'function')
                {
                    menu.addItem(mxResources.get('googleDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
                    {
                        // do nothing
                    }, parent, null, false);
                }
            }

            if (ui.oneDrive != null)
            {
                menu.addItem(mxResources.get('oneDrive') + '...', null, function()
                {
                    ui.pickLibrary(App.MODE_ONEDRIVE);
                }, parent);
            }
            else if (oneDriveEnabled && typeof window.OneDriveClient === 'function')
            {
                menu.addItem(mxResources.get('oneDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
                {
                    // do nothing
                }, parent, null, false);
            }

            if (ui.dropbox != null)
            {
                menu.addItem(mxResources.get('dropbox') + '...', null, function()
                {
                    ui.pickLibrary(App.MODE_DROPBOX);
                }, parent);
            }
            else if (dropboxEnabled && typeof window.DropboxClient === 'function')
            {
                menu.addItem(mxResources.get('dropbox') + ' (' + mxResources.get('loading') + '...)', null, function()
			{    
                    // do nothing
                }, parent, null, false);
            }
		
            menu.addSeparator(parent);
            
            if (ui.gitHub != null)
            {
                menu.addItem(mxResources.get('github') + '...', null, function()
                {
                    ui.pickLibrary(App.MODE_GITHUB);
                }, parent);
            }
		
            if (ui.gitLab != null)
            {
                menu.addItem(mxResources.get('gitlab') + '...', null, function()
                {
                    ui.pickLibrary(App.MODE_GITLAB);
                }, parent);
            }
		
            if (ui.trello != null)
            {
                menu.addItem(mxResources.get('trello') + '...', null, function()
                {
                    ui.pickLibrary(App.MODE_TRELLO);
                }, parent);
            }
            else if (trelloEnabled && typeof window.TrelloClient === 'function')
            {
                menu.addItem(mxResources.get('trello') + ' (' + mxResources.get('loading') + '...)', null, function()
                {
                    // do nothing
                }, parent, null, false);
            }
		
            menu.addSeparator(parent);
        
            if (isLocalStorage && urlParams['browser'] != '0')
            {
                menu.addItem(mxResources.get('browser') + '...', null, function()
                {
                    ui.pickLibrary(App.MODE_BROWSER);
                }, parent);
            }
		
            //if (!mxClient.IS_IOS)
            {
                menu.addItem(mxResources.get('device') + '...', null, function()
                {
                    ui.pickLibrary(App.MODE_DEVICE);
                }, parent);
            }
	
            if (!ui.isOffline())
            {
                menu.addSeparator(parent);
                
                menu.addItem(mxResources.get('url') + '...', null, function()
                {
                    var dlg = new FilenameDialog(ui, '', mxResources.get('open'), function(fileUrl)
                    {
                        if (fileUrl != null && fileUrl.length > 0 && ui.spinner.spin(document.body, mxResources.get('loading')))
                        {
                            var realUrl = fileUrl;
                                
                            if (!ui.editor.isCorsEnabledForUrl(fileUrl))
                            {
                                realUrl = PROXY_URL + '?url=' + encodeURIComponent(fileUrl);
                            }
						
                            // Uses proxy to avoid CORS issues
                            mxUtils.get(realUrl, function(req)
                            {
                                if (req.getStatus() >= 200 && req.getStatus() <= 299)
                                {
                                    ui.spinner.stop();
								
                                    try
                                    {
                                        ui.loadLibrary(new UrlLibrary(this, req.getText(), fileUrl));
                                    }
                                    catch (e)
                                    {
                                        ui.handleError(e, mxResources.get('errorLoadingFile'));
                                    }
                                }
                                else
                                {
                                    ui.spinner.stop();
                                    ui.handleError(null, mxResources.get('errorLoadingFile'));
                                }
                            }, function()
                            {
                                ui.spinner.stop();
                                ui.handleError(null, mxResources.get('errorLoadingFile'));
                            });
                        }
                    }, mxResources.get('url'));
                    ui.showDialog(dlg.container, 300, 80, true, true);
                    dlg.init();
                }, parent);
            }
		
            if (urlParams['confLib'] == '1')
            {
                menu.addSeparator(parent);
                
                menu.addItem(mxResources.get('confluenceCloud') + '...', null, function()
                {
                    ui.showRemotelyStoredLibrary(mxResources.get('libraries'));
                }, parent);
            }
        }));
    // Add this menu to the sidebar elements
        var menuObj = new Menubar(ui, null);    // define a Menubar object
        var newmenu = ui.menus.get('newLibraryToRepository');  // retrieve the "openLibraryFromRepository" menu just created
        var elts = $('a.geTitle:contains("'+mxResources.get('newLibrary')+'")');   // retrieve the "New Library" element in side bar
        mxEvent.removeAllListeners(elts[0]);    // remove standard menu
        menuObj.addMenuHandler(elts[0], newmenu.funct); // link the "openLibraryFromRepository" menu to the "Open Library from" element

        var openmenu = ui.menus.get('openLibraryFromRepository');  // retrieve the "openLibraryFromRepository" menu just created
        var elts = $('a.geTitle:contains("'+mxResources.get('openLibraryFrom')+'")');   // retrieve the "Open Library from" element in side bar
        mxEvent.removeAllListeners(elts[0]);    // remove standard menu
        menuObj.addMenuHandler(elts[0], openmenu.funct); // link the "openLibraryFromRepository" menu to the "Open Library from" element
    }
    
App.prototype.getPeerForMode = function(mode)
{
	if (mode == App.MODE_GOOGLE)
	{
		return this.drive;
	}
	else if (mode == App.MODE_GITHUB)
	{
		return this.gitHub;
	}
	else if (mode == App.MODE_GITLAB)
	{
		return this.gitLab;
	}
	else if (mode == App.MODE_DROPBOX)
	{
		return this.dropbox;
	}
	else if (mode == App.MODE_ONEDRIVE)
	{
		return this.oneDrive;
	}
	else if (mode == App.MODE_TRELLO)
	{
		return this.trello;
	} 
	else if (mode == App.MODE_REPOSITORY)
	{
		return this.repository;
	} 
	else
	{
		return null;
	}
};

    // Save library in repository
    App.prototype.saveLibrary = function(name, images, file, mode, noSpin, noReload, fn)
    {
        try
        {
            mode = (mode != null) ? mode : this.mode;
            noSpin = (noSpin != null) ? noSpin : false;
            noReload = (noReload != null) ? noReload : false;
            for (i = 0; i<images.length ; i++) {
            }
            var xml = this.createLibraryDataFromImages(images);
		
            var error = mxUtils.bind(this, function(resp)
            {
                this.spinner.stop();
			
                if (fn != null)
                {
                    fn();
                }
			
                this.handleError(resp, (resp != null) ? mxResources.get('errorSavingFile') : null);
            });
	
            // Handles special case for local libraries
            if (file == null && mode == App.MODE_DEVICE)
            {
                file = new LocalLibrary(this, xml, name);
            }
		
            if (file == null)
            {
                this.pickFolder(mode, mxUtils.bind(this, function(folderId)
                {
                    if (mode == App.MODE_REPOSITORY && this.spinner.spin(document.body, mxResources.get('inserting')))
                    {
                        this.repository = new Repository(ui);
                        this.repository.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
                        {
                            this.spinner.stop();
                            this.hideDialog(true);
                            this.libraryLoaded(newFile, images, newFile.title);
                        }), error, folderId);                     
                    } 
                    else if (mode == App.MODE_GOOGLE && this.drive != null && this.spinner.spin(document.body, mxResources.get('inserting')))
                    {
                        this.drive.insertFile(name, xml, folderId, mxUtils.bind(this, function(newFile)
                        {
                            this.spinner.stop();
                            this.hideDialog(true);
                            this.libraryLoaded(newFile, images);
                        }), error, this.drive.libraryMimeType);
                    }
                    else if (mode == App.MODE_GITHUB && this.gitHub != null && this.spinner.spin(document.body, mxResources.get('inserting')))
                    {
                        this.gitHub.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
                        {
                            this.spinner.stop();
                            this.hideDialog(true);
                            this.libraryLoaded(newFile, images);
                        }), error, folderId);
                    }
                    else if (mode == App.MODE_GITLAB && this.gitLab != null && this.spinner.spin(document.body, mxResources.get('inserting')))
                    {
                        this.gitLab.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
                        {
                            this.spinner.stop();
                            this.hideDialog(true);
                            this.libraryLoaded(newFile, images);
                        }), error, folderId);
                    }
                    else if (mode == App.MODE_TRELLO && this.trello != null && this.spinner.spin(document.body, mxResources.get('inserting')))
                    {
                        this.trello.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
                        {
                            this.spinner.stop();
                            this.hideDialog(true);
                            this.libraryLoaded(newFile, images);
                        }), error, folderId);
                    }
                    else if (mode == App.MODE_DROPBOX && this.dropbox != null && this.spinner.spin(document.body, mxResources.get('inserting')))
                    {
                        this.dropbox.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
                        {
                            this.spinner.stop();
                            this.hideDialog(true);
                            this.libraryLoaded(newFile, images);
                        }), error, folderId);
                    }
                    else if (mode == App.MODE_ONEDRIVE && this.oneDrive != null && this.spinner.spin(document.body, mxResources.get('inserting')))
                    {
                        this.oneDrive.insertLibrary(name, xml, mxUtils.bind(this, function(newFile)
                        {
                            this.spinner.stop();
                            this.hideDialog(true);
                            this.libraryLoaded(newFile, images);
                        }), error, folderId);
                    }
                    else if (mode == App.MODE_BROWSER)
                    {
                        var fn = mxUtils.bind(this, function()
                        {
                            var file = new StorageLibrary(this, xml, name);
                            
                            // Inserts data into local storage
                            file.saveFile(name, false, mxUtils.bind(this, function()
                            {
                                this.hideDialog(true);
                                this.libraryLoaded(file, images);
                            }), error);
                        });
					
                        if (localStorage.getItem(name) == null)
                        {
                            fn();
                        }
                        else
                        {
                            this.confirm(mxResources.get('replaceIt', [name]), fn);
                        }
                    }
                    else
                    {
                        this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')});
                    }
                }));
            }
            else if (noSpin || this.spinner.spin(document.body, mxResources.get('saving')))
            {
                file.setData(xml);
                
                var doSave = mxUtils.bind(this, function()
                {
                    file.save(true, mxUtils.bind(this, function(resp)
                    {
                        this.spinner.stop();
                        this.hideDialog(true);
                        
                        if (!noReload)
                        {
                            this.libraryLoaded(file, images);
                        }
					
                        if (fn != null)
                        {
                            fn();
                        }
                    }), error);
                });
			
                if (name != file.getTitle())
                {
                    var oldHash = file.getHash();
                    
                    file.rename(name, mxUtils.bind(this, function(resp)
                    {
                        // Change hash in stored settings
                        if (file.constructor != LocalLibrary && oldHash != file.getHash())
                        {
                            mxSettings.removeCustomLibrary(oldHash);
                            mxSettings.addCustomLibrary(file.getHash());
                        }
	
                        // Workaround for library files changing hash so
                        // the old library cannot be removed from the
                        // sidebar using the updated file in libraryLoaded
                        this.removeLibrarySidebar(oldHash);
        
                        doSave();
                    }), error)
                }
                else
                {
                    doSave();
                }
            }
        }
        catch (e)
        {
            this.handleError(e);
        }
    };

//--- Attach menus to library cells ---------------------------------------------------------------------------    
// Attach menu to library element
	function addMenuToElement(elt, index, imgs, file)
	{
		try
		{
								
			mxEvent.addGestureListeners(elt, null, null, mxUtils.bind(this, function(evt)
			{
				if (mxEvent.isPopupTrigger(evt))
				{
					ui.sidebar.showPopupMenuForCustomLibrary(elt, evt, index, imgs, file);
				}
			}));
										
			// Disables the built-in context menu
			mxEvent.disableContextMenu(elt);
		}
		catch (e)
		{
			// ignore
		}
	};
	
// Inspired from drawio/src/main/webapp/js/diagramly/EditorUI.js : EditorUi.prototype.addLibraryEntries, and overloading it (with "file" argument)
	App.prototype.addLibraryEntries = function(imgs, content, file)
	{
		for (var i = 0; i < imgs.length; i++)
		{
			var img = imgs[i];
			var data = img.data;
			var shape = null;

			if (data != null)
			{
				data = this.convertDataUri(data);
				var s = 'shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;';
				
				if (img.aspect == 'fixed')
				{
					s += 'aspect=fixed;'
				}
				
				// Added EFE 20201012 : Keep shape object
				shape = content.appendChild(this.sidebar.createVertexTemplate(s + 'image=' + // shape added
					data, img.w, img.h, '', img.title || '', false, false, true));
			}
			else if (img.xml != null)
			{
				var cells = this.stringToCells(Graph.decompress(img.xml));
				if (!cells[0].customproperties)
				{
					cells[0].customproperties = [];
				}
				
				if (cells.length > 0)
				{
					// Added EFE 20201012 : Keep shape object
					shape = content.appendChild(this.sidebar.createVertexTemplateFromCells(
						cells, img.w, img.h, img.title || '', true, false, true));
				}
				// Added EFE 20201012 : Add a menu to the shape
				if (file && file.title != '.scratchpad')
				{
					addMenuToElement(shape, i, imgs, file);
				}
			}
		}
	};


//	Display custom properties with alpacajs, based on configuration files located in drawio-integration/ext/alpaca
	var Link2RepoDialog = function (editorUi, index, imgs, file)
	{
		var div = document.createElement('div');
		div.style.overflowX = 'visible';
		div.style.overflowY = 'auto';
		div.id = 'alpaca';
		var cells = editorUi.stringToCells(editorUi.editor.graph.decompress(imgs[index].xml));
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
		$(document).ready(function() {
			$('#alpaca').alpaca( {
				'schemaSource' : window.DRAWIOINTEGRATION_PATH + '/ext/alpaca/link2repo.schema.json',
				'optionsSource' : window.DRAWIOINTEGRATION_PATH + '/ext/alpaca/link2repo_' + language.substring(0,2) + '.options.json',
				'dataSource' : cells[0].customproperties,
				'options' :	{
					"form" : {
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
									// transform form object into array
									delete cells[0].customproperties;
									cells[0].customproperties = [];
									var customproperties = this.getValue();
									for(var p in customproperties) {
										if (p.substring(0,7) != 'display')
										{
											cells[0].customproperties[p] = customproperties[p];
										}
									}
									if (!cells[0].customproperties['stencil'])
									{
										cells[0].customproperties['stencil'] = imgs[index].title.replace(/ /g,"_").toLowerCase();
									}
									// keep same stencil name as versions 1 & 2 of the archimap plugin (all lowercase and no blanco)
									if (file.title.toLowerCase() == "glpi.xml" && cells[0].customproperties['stencil'] 
									&& (cells[0].customproperties['stencil'].substring(0, 13) != "mxgraph.glpi." || cells[0].customproperties['stencil'].includes(' ')))
									{
										cells[0].customproperties['stencil'] = "mxgraph.glpi." + imgs[index].title.replace(/ /g,"_").toLowerCase();
										console.log('stencil named ' + imgs[index].title + ' replaced by ' + cells[0].customproperties['stencil']);
									}
									imgs[index].xml = Graph.compress(mxUtils.getXml(editorUi.editor.graph.encodeCells(cells)));
									editorUi.hideDialog();
									editorUi.saveLibrary(file.title, imgs, file, file.mode);
									editorUi.refreshCustomProperties(editorUi.editor);
								}
							}
						}
					},
					"focus" : "autocompletetype"
				},
				'view' : 'bootstrap-edit-horizontal',
				'postRender': function(control) {
					var autocompletetable = control.childrenByPropertyId["autocompletetable"];
					var autocompletecolumns = control.childrenByPropertyId["autocompletecolumns"];
					var autocompletejointtables = control.childrenByPropertyId["autocompletejointtables"];
					var autocompletejointcolumns = control.childrenByPropertyId["autocompletejointcolumns"];
					var autocompleteotherselectioncriteria = control.childrenByPropertyId["autocompleteotherselectioncriteria"];
					var autocompleteordercriteria = control.childrenByPropertyId["autocompleteordercriteria"];
					var sql = control.childrenByPropertyId["displaysql"];
					var getsql = function()
					{
						var tablevalue = autocompletetable.getValue();
						var columnsvalue = autocompletecolumns.getValue();
						var jointtablesvalue = autocompletejointtables.getValue();
						var jointcolumnsvalue = autocompletejointcolumns.getValue();
						var otherselectioncriteriavalue = autocompleteotherselectioncriteria.getValue();
						var ordercriteriavalue = autocompleteordercriteria.getValue();
						if (tablevalue && columnsvalue)
						{
							var xhr = new XMLHttpRequest();
							xhr.onreadystatechange = function() {
								if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
									var datastart = xhr.responseText.indexOf('[');
									if (datastart > 0) // an SQL error occurred
									{
										var parser = new DOMParser();
										xmlDoc = parser.parseFromString(xhr.responseText.substr(0, datastart),"text/xml");
										sql.setValue(xmlDoc.documentElement.textContent);
									}
									else // query and 5 rows returned from repository
									{
										let datas = JSON && JSON.parse(xhr.responseText.substr(datastart)) || $.parseJSON(xhr.responseText.substr(datastart));
										sql.setValue(datas[0]); // display query
										var datalen = datas.length;
										if (datalen > 1)
										{
											var resultgrid = control.childrenByPropertyId["displayresults"];
											resultgrid.height = 'auto';
											datas.splice(0,1); // suppress datas[0] (= the query display)
											var holder = $(div).find(".alpaca-container-grid-holder"); // get the handsontable's container
											var hotable = $(holder).handsontable('getInstance'); // get the handsontable object
											var wtholder = $(holder).find(".ht_master>.wtHolder"); // get the handsontable's container and reset height
											resultgrid.options.grid.data = datas; // put the query results into the grid
											var headers = {};
											for (const column in datas[1]) // loop on columns and get their names
											{
												if (datas[1].hasOwnProperty(column))
												{
													headers[column] = column;
												}
											}
											resultgrid.options.grid.data.splice(0,0,headers); // insert the headers before the data
											hotable.loadData(resultgrid.options.grid.data);
											hotable.render();
											$(wtholder).css('height','auto');
										}
									}
								}; 
							}
							var urlparams = 'table=' + tablevalue + '&columns=' + columnsvalue + (otherselectioncriteriavalue ? '&othercriteria=' + encodeURIComponent(otherselectioncriteriavalue) : '') 
								+ '&jointtables=' + encodeURIComponent(jointtablesvalue) + '&jointcolumns=' + encodeURIComponent(jointcolumnsvalue) + (ordercriteriavalue ? '&ordercriteria=' + encodeURIComponent(ordercriteriavalue) : '')
								+ '&test';
							xhr.open("GET", window.DRAWIOINTEGRATION_PATH + "/ajax/autocomplete.php?"+urlparams, true);
							xhr.send(null);
						}
					}
					getsql(); // display the query and the results for the current "autocomplete" values
					sql.refresh();
					autocompletetable.on("change", function() {getsql();sql.refresh();});
					autocompletecolumns.on("change", function() {getsql();sql.refresh();});
					autocompletejointtables.on("change", function() {getsql();sql.refresh();});
					autocompletejointcolumns.on("change", function() {getsql();sql.refresh();});
					autocompleteotherselectioncriteria.on("change", function() {getsql();sql.refresh();});
					autocompleteordercriteria.on("change", function() {getsql();sql.refresh();});
				}
			});
		});
	
		this.container = div;
	};

// Display dialog to link an appearance modification to a custom property value
	var Link2CssClassDialog = function (editorUi, cells, index, imgs, file)
	{
		var isNewKey = true;
		var newValueStyle = [];
		var cell = cells[0];
		const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat()))); // cartesian product of matrices : see https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
		var dataSource = function(callback, postFn)
        {

			// Get the CSS classes, from customproperties, as constituent parts
			let classes = [];
			let i = 0;
			let j = 0;
			let k = 0;
			for (let entry of cell.customproperties.autocompletecssclass.split(";"))
			{
				let cssclass = entry.split("+");
				classes[i] = cssclass;
				for (let j = 0; j<classes[i].length; j++)
				{
					// test if only 1 quote character
					if ((classes[i][j].match(/'/g) || []).length == 1)
					{
						// add the missing quote at begin or end of the string
						classes[i][j].charAt(0) == "'" ? classes[i][j] = classes[i][j].concat("'") : classes[i][j] = "'".concat(classes[i][j]);
					}
				}
				i++;
			}
			// Get the columns names, from customproperties, to build the query and list the available values
			let columns = cell.customproperties.autocompletejointcolumns.replace(/,[ ]+/gi,',').split(','); // suppress blanks after comma
			let tables = {};
			let icolumn = -1;
			for (i = 0; i<classes.length; i++)
			{
				for (let j = 0; j<classes[i].length; j++)
				{
					if (!classes[i][j].includes("'") && !classes[i][j].includes('"')) // no single or double quote => this is a column name
					{
						icolumn = columns.findIndex(function(value) {return RegExp('[ \'\"`]+'+classes[i][j]).test(value);}); // index of where to find this column name (preceded by space, single or double quote) in columns
						if (icolumn >= 0)
						{
//							tables[classes[i][j]] = [];
							tablecolumn = columns[icolumn].split(' '); // split into array of string (f.i ["table.column", "as", "alias"])
							if (tablecolumn[0].includes('.')) // is there a dot ?
							{
								let pos = tablecolumn[0].indexOf('.');
								tables[classes[i][j]] = {'table' : tablecolumn[0].substring(0, pos), 'column' : tablecolumn[0].substring(pos+1)}; // tables[alias] = [table, column]
							}
							else
							{
								tables[classes[i][j]] = {'table' : cell.customproperties.autocompletetable, 'column' : classes[i][j]}; // tables[alias] = [main table, alias]
							}
						}
					}
				}
			}
			// Get the list of available values from repository
			let cssclasses = [''];
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
					let datas = JSON && JSON.parse(xhr.responseText) || $.parseJSON(xhr.responseText);
					let cssclass = [];
					// combine the CSS class tokens, replacing column names with real values
					for (i = 0; i < classes.length; i++)
					{
						cssclass = [''];
						for (j = 0; j < classes[i].length; j++)
						{
							if (!classes[i][j].includes("'") && !classes[i][j].includes('"')) // no single or double quote => this is a column name
							{
								cssclass = cartesian(cssclass, datas[classes[i][j]]);
							}
							else
							{
								cssclass = cartesian(cssclass, [classes[i][j].replace(/['"]/gi,'')]); // remove single and double quotes in literals
							}
						}
						for (k = 0; k < cssclass.length; k++)
						{
							cssclasses.push(cssclass[k].join('').replace(/[ ]/gi,'_')); // replace spaces by underscore
						}
					}
					var index = cssclasses.indexOf('');
					while (index !== -1) 
					{
						cssclasses.splice(index, 1);
						index = cssclasses.indexOf('');
					}
					return callback(cssclasses, postFn);
//					return cssclasses;
				}; 
			}
			xhr.open("POST", window.DRAWIOINTEGRATION_PATH + "/ajax/gettables.php", true);
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.send(JSON.stringify(tables));
		};
		var content = document.createElement('div');
		content.style.overflowY = 'auto';

		var img = imgs[index];
		var shapeWidth = img.w;
		var shapeHeight = img.h;

		let title = img.title || cell.customproperties['stencil'];
/*		var hd = document.createElement('h3');
		mxUtils.write(hd, title);
		hd.style.cssText = 'width:100%;text-align:center;margin-top:0px;margin-bottom:6px';
		content.appendChild(hd);
*/		var shapecontainer = document.createElement('a');
		shapecontainer.id = title;
		shapecontainer.className = 'geItem';
		shapecontainer.style.overflow = 'hidden';
		var border = (mxClient.IS_QUIRKS) ? 8 + 2 * 6 : 2 * 6;
		shapecontainer.style.width = (shapeWidth + border) + 'px';
		shapecontainer.style.height = (shapeHeight + border) + 'px';
		shapecontainer.style.padding = '6px';
	
		if (mxClient.IS_IE6)
		{
			shapecontainer.style.border = 'none';
		}
	
		var thumbgraph = new Graph(shapecontainer);
		var clone = editorUi.editor.graph.cloneCell(cell);
		clone.value = title;
		thumbgraph.addCells([clone]);
		var thumbstate = thumbgraph.view.getState(clone, true);
		var thumbshape = thumbstate.shape;
		var isVertex = editorUi.editor.graph.getModel().isVertex(cell);
		// disable all clicks on cloned cell
		mxEvent.release(shapecontainer);

		shapecontainer.style.display = 'block';
		shapecontainer.style.margin = 'auto';
		content.appendChild(shapecontainer);

		var cssList = document.createElement('select');
		cssList.id = 'style';
		cssList.style.textOverflow = 'ellipsis';
		cssList.style.boxSizing = 'border-box';
		cssList.style.overflow = 'hidden';
		cssList.style.padding = '4px';
		cssList.style.width = '100%';
		
		var repository = new Repository(ui);
		var displayPanel = function(selectedValue, selectedValueStyle, content)
		{
			newValueStyle[selectedValue] = {};
			// remove previous panels, if any
			let previousPanel = document.getElementById('panels');
			if (previousPanel)
			{
				content.removeChild(previousPanel);
			}
			// create new panels
			var panels = document.createElement('div');
			panels.id = 'panels';
			panels.style.display = 'table';
			panels.style.width	= '100%';
			panels.style.padding = '8px 0px 8px 0px';
			panels.list = [];
//			panels.list.push(new DiagramStylePanel(this, ui, stylePanel))
			content.appendChild(panels);

			// get the tokens of cell's style
			var shapeStyles = {};
			for (let entry of cell.style.split(";")) {
				let [key, value] = entry.split("=");
					shapeStyles[key] = value;
			}
			// initialize newValueStyle with shape 
			if (shapeStyles.shape)
				newValueStyle[selectedValue].shape = shapeStyles.shape;
			else if (shapeStyles.image)
				newValueStyle[selectedValue].shape = mxConstants.SHAPE_IMAGE;
			else 
				newValueStyle[selectedValue].shape = mxConstants.SHAPE_CONNECTOR;
			var fillColorApply = null;
			var gradientColorApply = null;
			var strokeColorApply = null;
			var fontColorApply = null;
			
			var defaultFillColor = shapeStyles[mxConstants.STYLE_FILLCOLOR] || '#ffffff';
			var defaultGradientColor = shapeStyles[mxConstants.STYLE_GRADIENTCOLOR] || '#ffffff';
			var defaultStrokeColor = shapeStyles[mxConstants.STYLE_STROKECOLOR] || '#000000';
			var defaultOpacity = shapeStyles[mxConstants.STYLE_OPACITY] || (isVertex ? shapeStyles[mxConstants.STYLE_FILL_OPACITY] : shapeStyles[mxConstants.STYLE_STROKE_OPACITY]) || '100';
			var defaultLineWidth = shapeStyles[mxConstants.STYLE_STROKEWIDTH] || '1';
			var defaultLineDash = shapeStyles[mxConstants.STYLE_DASHED] || '0';
			var defaultLineDashPattern = shapeStyles[mxConstants.STYLE_DASH_PATTERN] || null;
			var defaultFontColor = shapeStyles[mxConstants.STYLE_FONTCOLOR] || '#000000';
			var defaultFontSize = shapeStyles[mxConstants.STYLE_FONTSIZE] || '12';
			var defaultFontStyle = shapeStyles[mxConstants.STYLE_FONTSTYLE] || '0';
			var defaultImage = shapeStyles[mxConstants.STYLE_IMAGE] || null;
			var defaultImageAlign = shapeStyles[mxConstants.STYLE_IMAGE_ALIGN] || mxConstants.ALIGN_RIGHT;
			var defaultImageVerticalAlign = shapeStyles[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] || mxConstants.ALIGN_BOTTOM;
			var defaultImageWidth = shapeStyles[mxConstants.STYLE_IMAGE_WIDTH] || '25';
			var defaultImageHeight = shapeStyles[mxConstants.STYLE_IMAGE_HEIGHT] || '25';
			
			var currentFillColor = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] : defaultFillColor;
			var currentGradientColor = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR] : defaultGradientColor;
			var currentStrokeColor = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR] : defaultStrokeColor;	
			var currentOpacity = selectedValueStyle && selectedValueStyle[selectedValue] && 
									(selectedValueStyle[selectedValue][mxConstants.STYLE_OPACITY] 
									|| (isVertex ? selectedValueStyle[selectedValue][mxConstants.STYLE_FILL_OPACITY] : selectedValueStyle[selectedValue][mxConstants.STYLE_STROKE_OPACITY])) ? 
									(selectedValueStyle[selectedValue][mxConstants.STYLE_OPACITY]
									|| (isVertex ? selectedValueStyle[selectedValue][mxConstants.STYLE_FILL_OPACITY] : selectedValueStyle[selectedValue][mxConstants.STYLE_STROKE_OPACITY])) : defaultOpacity;	
			var currentLineWidth = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH] : defaultLineWidth;	
			var currentLineDash = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_DASHED] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_DASHED] : defaultLineDash;	
			var currentLineDashPattern = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN] : defaultLineDashPattern;	
			var currentFontColor = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FONTCOLOR] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_FONTCOLOR] : defaultFontColor;
			var currentFontSize = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE] : defaultFontSize;
			var currentFontStyle = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] : defaultFontStyle;
			var currentImage = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE] : defaultImage;
			var currentImageAlign = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] : defaultImageAlign;
			var currentImageVerticalAlign = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] : defaultImageVerticalAlign;
			var currentImageWidth = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] : defaultImageWidth;
			var currentImageHeight = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] : defaultImageHeight;
			
			var format = new Format(editorUi, content);
			var panel = new BaseFormatPanel(format, editorUi, content);
			
			// Display - or not - the value field, according to checkbox
			var changeDisplay = function(panel, cb)
			{	
				let ielem = 0;
				for(var child=panel.firstElementChild; child!==null; child=child.nextElementSibling) {
					if (ielem>1)
					{
						child.style.display = (cb.checked) ? '' : 'none';
					}
					ielem++;
				}
			}

			if (isVertex)
			{
				var fillPanel = panel.createColorOption(mxResources.get('fillColor'), function()
				{	// getColorFn
					return currentFillColor;
				}, function(color)
				{	// setColorFn
					thumbgraph.updateCellStyles(mxConstants.STYLE_FILLCOLOR, (color != mxConstants.NONE) ? color : defaultFillColor, [clone]);
				}, /* defaultColor */ '#ffffff',
				{	// listener
					install: function(apply) { fillColorApply = apply; },
					destroy: function() { fillColorApply = null; }
				}, function(color)
				{	// callbackFn
//					newValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] = (color != mxConstants.NONE) ? color : defaultFillColor;
					newValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] = color;
					thumbgraph.updateCellStyles(mxConstants.STYLE_FILLCOLOR, (color != mxConstants.NONE) ? color : defaultFillColor, [clone]);
				}, /* hideCheckbox */ false);
				fillPanel.style.height = '30px';
				fillPanel.style.boxSizing = 'border-box';
				fillPanel.style.overflow = 'hidden';
				fillPanel.style.padding = '4px';
				fillPanel.style.width = '100%';
				fillPanel.style.display = 'table-row';
				fillPanel.style.right = '30px';
				panels.appendChild(fillPanel);
				// uncheck box if the fill collor is not changed
				var cbFill = fillPanel.firstElementChild;
				if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR])
				{
					if (cbFill.checked)
					{
						cbFill.click();
					}
					else
						changeDisplay(fillPanel, cbFill);
				}
				else
				{
					thumbgraph.updateCellStyles(mxConstants.STYLE_FILLCOLOR, selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR], [clone]);
					changeDisplay(fillPanel, cbFill);
				}

				// Adds gradient direction option
				var gradientSelect = document.createElement('select');
				gradientSelect.style.position = 'absolute';
				gradientSelect.style.marginTop = '-2px';
				gradientSelect.style.right = (mxClient.IS_QUIRKS) ? '52px' : '72px';
				gradientSelect.style.width = '70px';
		
				// Stops events from bubbling to color option event handler
				mxEvent.addListener(gradientSelect, 'click', function(evt)
				{
					mxEvent.consume(evt);
				});

				var directions = [mxConstants.DIRECTION_NORTH, mxConstants.DIRECTION_EAST,
						mxConstants.DIRECTION_SOUTH, mxConstants.DIRECTION_WEST];

				for (var i = 0; i < directions.length; i++)
				{
					var gradientOption = document.createElement('option');
					gradientOption.setAttribute('value', directions[i]);
					mxUtils.write(gradientOption, mxResources.get(directions[i]));
					gradientSelect.appendChild(gradientOption);
				}

				var gradientPanel = panel.createColorOption(mxResources.get('gradient'), function()
				{	// getColorFn
					return currentGradientColor;
				}, function(color)
				{	// setColorFn
					thumbgraph.updateCellStyles(mxConstants.STYLE_GRADIENTCOLOR, (color != mxConstants.NONE) ? color : null, [clone]);
				}, /* defaultColor */ '#ffffff',
				{	// listener
					install: function(apply) { gradientColorApply = apply; },
					destroy: function() { gradientColorApply = null; editorUi.editor.graph.getModel().removeListener(listener);}
				}, function(color)
				{	// callbackFn
//					newValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR] = (color != mxConstants.NONE) ? color : null;
					newValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR] = color;
					thumbgraph.updateCellStyles(mxConstants.STYLE_GRADIENTCOLOR, (color != mxConstants.NONE) ? color : null, [clone]);
					if (color == null || color == mxConstants.NONE)
					{
						gradientSelect.style.display = 'none';
						newValueStyle[selectedValue][mxConstants.STYLE_GRADIENT_DIRECTION] = mxConstants.NONE;
					}
					else
					{
						gradientSelect.style.display = '';
					}
				}, /* hideCheckbox */ false);
			
				var listener = mxUtils.bind(this, function()
				{
					var value = mxUtils.getValue(selectedValueStyle[selectedValue], mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_SOUTH);
		
					// Handles empty string which is not allowed as a value
					if (value == '')
					{
						value = mxConstants.DIRECTION_SOUTH;
					}
		
					gradientSelect.value = value;
					newValueStyle[selectedValue][mxConstants.STYLE_GRADIENT_DIRECTION] = gradientSelect.value;
				});
	
				editorUi.editor.graph.getModel().addListener(mxEvent.CHANGE, listener);
				listener();

				mxEvent.addListener(gradientSelect, 'change', function(evt)
				{
					newValueStyle[selectedValue][mxConstants.STYLE_GRADIENT_DIRECTION] = gradientSelect.value;
					thumbgraph.updateCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, gradientSelect.value, [clone]);
					mxEvent.consume(evt);
				});
		
				gradientPanel.style.height = '30px';
				gradientPanel.style.boxSizing = 'border-box';
				gradientPanel.style.overflow = 'hidden';
				gradientPanel.style.padding = '4px';
				gradientPanel.style.width = '100%';
				gradientPanel.style.display = 'table-row';
				gradientPanel.style.right = '30px';
				gradientPanel.appendChild(gradientSelect);
				panels.appendChild(gradientPanel);
				// uncheck box if the gradient collor is not changed
				var cbGradient = gradientPanel.firstElementChild;
				if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR])
				{
					if (cbGradient.checked)
					{
						cbGradient.click();
						gradientSelect.style.display = 'none';
					}
					else
						changeDisplay(gradientPanel, cbGradient);
				}
				else
				{
					thumbgraph.updateCellStyles(mxConstants.STYLE_GRADIENTCOLOR, selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR], [clone]);
					changeDisplay(gradientPanel, cbGradient);
				}
			}
			var opacityPanel = document.createElement('div');
			createStepperOption(opacityPanel,mxResources.get('opacity'), '%', currentOpacity, 0, 100, 1, 50,
				function(input)  // handle new value 
				{
					var cbOpacity = opacityPanel.firstElementChild;
					input.value = Math.max(0, Math.min(100, parseInt(input.value))) + ' %';
					thumbgraph.updateCellStyles((isVertex ? mxConstants.STYLE_FILL_OPACITY : mxConstants.STYLE_STROKE_OPACITY), (input.value != mxConstants.NONE) ? parseInt(input.value) : currentOpacity , [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_OPACITY] = (cbOpacity.checked) ? parseInt(input.value) : null;
					newValueStyle[selectedValue][(isVertex ? mxConstants.STYLE_FILL_OPACITY : mxConstants.STYLE_STROKE_OPACITY)] = newValueStyle[selectedValue][mxConstants.STYLE_OPACITY];
				},
				function(input) // initialize panel
				{ 
					var cbOpacity = opacityPanel.firstElementChild;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && (selectedValueStyle[selectedValue][mxConstants.STYLE_OPACITY] || (isVertex ? selectedValueStyle[selectedValue][mxConstants.STYLE_FILL_OPACITY] : selectedValueStyle[selectedValue][mxConstants.STYLE_STROKE_OPACITY])))
					{	
						cbOpacity.checked = true;
					}
					if (cbOpacity.checked)
					{
						newValueStyle[selectedValue][mxConstants.STYLE_OPACITY] = selectedValueStyle[selectedValue][mxConstants.STYLE_OPACITY];
						newValueStyle[selectedValue][(isVertex ? mxConstants.STYLE_FILL_OPACITY : mxConstants.STYLE_STROKE_OPACITY)] = selectedValueStyle[selectedValue][(isVertex ? mxConstants.STYLE_FILL_OPACITY : mxConstants.STYLE_STROKE_OPACITY)];
					}
					else
					{
						newValueStyle[selectedValue][mxConstants.STYLE_OPACITY] = mxConstants.NONE;
						newValueStyle[selectedValue][(isVertex ? mxConstants.STYLE_FILL_OPACITY : mxConstants.STYLE_STROKE_OPACITY)] = mxConstants.NONE;
					}
					input.value = currentOpacity + ' %';
					thumbgraph.updateCellStyles((isVertex ? mxConstants.STYLE_FILL_OPACITY : mxConstants.STYLE_STROKE_OPACITY), (input.value != mxConstants.NONE) ? parseInt(input.value) : currentOpacity , [clone]);
					input.parentNode.style.display = cbOpacity.checked ? '' : 'none';
				},
				null);
			opacityPanel.style.display = 'table-row';
			panels.appendChild(opacityPanel);
			var cbOpacity = opacityPanel.firstElementChild;
			// Display - or not - the value field, according to checkbox
/*			var changeOpacityDisplay = function()
			{	
				let ielem = 0;
				for(var child=opacityPanel.firstElementChild; child!==null; child=child.nextElementSibling) {
					if (ielem>1)
					{	child.style.display = (cbOpacity.checked) ? '' : 'none';
					}
					ielem++;
				}
			}
*/			// if no opacity in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !(selectedValueStyle[selectedValue][mxConstants.STYLE_OPACITY] || (isVertex ? selectedValueStyle[selectedValue][mxConstants.STYLE_FILL_OPACITY] : selectedValueStyle[selectedValue][mxConstants.STYLE_STROKE_OPACITY])))
			{
				if (cbOpacity.checked)
				{
					cbOpacity.click();
				}
				else
					changeDisplay(opacityPanel, cbOpacity);
			}
			else
			{
				if (isVertex)
					thumbgraph.updateCellStyles(mxConstants.STYLE_FILL_OPACITY, selectedValueStyle[selectedValue][mxConstants.STYLE_FILL_OPACITY], [clone]);
				else
					thumbgraph.updateCellStyles(mxConstants.STYLE_STROKE_OPACITY, selectedValueStyle[selectedValue][mxConstants.STYLE_STROKE_OPACITY], [clone]);
				changeDisplay(opacityPanel, cbOpacity);
			}

			var colorPanel = document.createElement('div');
	
			var lineColor = panel.createColorOption(mxResources.get('line'), function()
			{	// getColorFn
				return currentStrokeColor;
			}, function(color)
			{	// setColorFn
				thumbgraph.updateCellStyles(mxConstants.STYLE_STROKECOLOR, (color != mxConstants.NONE) ? color : defaultStrokeColor, [clone]);
			}, /* defaultColor */ '#000000',
			{	// listener
				install: function(apply) { strokeColorApply = apply; },
				destroy: function() { strokeColorApply = null; }
			}, function(color)
			{	// callbackFn
//				newValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR] = (color != mxConstants.NONE) ? color : null;
				newValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR] = color;
				thumbgraph.updateCellStyles(mxConstants.STYLE_STROKECOLOR, (color != mxConstants.NONE) ? color : defaultStrokeColor, [clone]);
			}, /* hideCheckbox */ false);

			lineColor.style.height = '30px';
			lineColor.style.boxSizing = 'border-box';
			lineColor.style.overflow = 'hidden';
			lineColor.style.padding = '4px';
			lineColor.style.width = '100%';
			lineColor.style.display = 'table-row';
			lineColor.style.right = '30px';
			colorPanel.appendChild(lineColor);
			panels.appendChild(colorPanel);
			var cbLineColor = lineColor.firstElementChild;
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR])
			{
				if (cbLineColor.checked)
				{
					cbLineColor.click();
				}
				else
					changeDisplay(colorPanel, cbLineColor);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_STROKECOLOR, selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR], [clone]);
				changeDisplay(colorPanel, cbLineColor);
			}

			var lineWidthPanel = document.createElement('div');
				
			createStepperOption(lineWidthPanel,mxResources.get('linewidth'), 'pt', currentLineWidth, 1, 10, 1, 50,
				function(input)  // handle new value 
				{
					var cbLineWidth = lineWidthPanel.firstElementChild;
					input.value = Math.max(1, Math.min(10, parseInt(input.value))) + ' pt';
					thumbgraph.updateCellStyles(mxConstants.STYLE_STROKEWIDTH, (input.value != mxConstants.NONE) ? parseInt(input.value) : currentLineWidth , [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH] = (cbLineWidth.checked) ? parseInt(input.value) : null;
				},
				function(input) // initialize panel
				{ 
					var cbLineWidth = lineWidthPanel.firstElementChild;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH])
					{	
						cbLineWidth.checked = true;
					}
					newValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH] = (cbLineWidth.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH] : null;
					input.value = currentLineWidth + ' pt';
					input.parentNode.style.display = cbLineWidth.checked ? '' : 'none';
				},
				null);
			lineWidthPanel.style.display = 'table-row';
			panels.appendChild(lineWidthPanel);
			var cbLineWidth = lineWidthPanel.firstElementChild;
			// Display - or not - the value field, according to checkbox
/*			var changeLineWidthDisplay = function()
			{	
				let ielem = 0;
				for(var child=lineWidthPanel.firstElementChild; child!==null; child=child.nextElementSibling) {
					if (ielem>1)
					{	child.style.display = (cbLineWidth.checked) ? '' : 'none';
					}
					ielem++;
				}
			}
*/			// if no lineWidth in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH])
			{
				if (cbLineWidth.checked)
				{
					cbLineWidth.click();
				}
				else
					changeDisplay(lineWidthPanel, cbLineWidth);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_STROKEWIDTH, selectedValueStyle[selectedValue][mxConstants.STYLE_STROKEWIDTH], [clone]);
				changeDisplay(lineWidthPanel, cbLineWidth);
			}

			var lineDashPanel = document.createElement('div');
			var dashMenu = document.createElement('select');
//			dashMenu.style.cssFloat = 'right';
			dashMenu.style.position = 'absolute';
			dashMenu.style.right = '20px';
			var addItem = function(menu, width, label, keys, values)
			{
				var item = document.createElement('option');
				item.text = label;
				item.value = values;
				item.style.width = width + 'px';
				item.style.height = '1px';
				item.style.borderBottom = '1px ' + label.split(' ')[0].toLowerCase() + ' black';
				item.style.paddingTop = '6px';
				menu.appendChild(item);
//				var item = styleChange(menu, '', keys, values, 'geIcon', null);
/*				var dashItem = document.createElement('canvas');
				dashItem.width = width;
				dashItem.height = 6;
				var ctx = dashItem.getContext('2d');
				ctx.beginPath();
				if (values[1])
					ctx.setLineDash(values[1].split(' '));
				else
					ctx.setLineDash([]);
				ctx.moveTo(0, 10);
				ctx.lineTo(width, 10);
				ctx.stroke();				
				item.appendChild(dashItem);
*/				
				return item;
			};

			addItem(dashMenu, 100, mxResources.get('solid'), [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], [0, null]).setAttribute('title', mxResources.get('solid'));
			addItem(dashMenu, 100, mxResources.get('dashed') + ' (- -)', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', null]).setAttribute('title', mxResources.get('dashed') + ' - -');
			addItem(dashMenu, 100, mxResources.get('dotted') + ' (. .)', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', '1 1']).setAttribute('title', mxResources.get('dotted') + ' . .');
			addItem(dashMenu, 100, mxResources.get('dotted') + ' (.  .)', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', '1 2']).setAttribute('title', mxResources.get('dotted') + ' .  .');
			addItem(dashMenu, 100, mxResources.get('dotted') + ' (.    .)', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', '1 4']).setAttribute('title', mxResources.get('dotted') + ' .    .');
			createMenuOption(lineDashPanel,mxResources.get('pattern'), dashMenu, 300,
				function(selectedOption)  // handle new value 
				{
					var cbDashPanel = lineDashPanel.firstElementChild;
					if (cbDashPanel.checked)
					{
						var options = selectedOption.split(',');
						thumbgraph.updateCellStyles(mxConstants.STYLE_DASHED, (options[0] && options[0] !== null ) ? parseInt(options[0]) : currentLineDash , [clone]);
						thumbgraph.updateCellStyles(mxConstants.STYLE_DASH_PATTERN, (options[0] && options[0] !== null && options[1]) ? options[1] : currentLineDashPattern , [clone]);
						newValueStyle[selectedValue][mxConstants.STYLE_DASHED] = parseInt(options[0]);
						newValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN] = options[1];
					}
					else
					{
						thumbgraph.updateCellStyles(mxConstants.STYLE_DASHED, null , [clone]);
						thumbgraph.updateCellStyles(mxConstants.STYLE_DASH_PATTERN, null , [clone]);
						newValueStyle[selectedValue][mxConstants.STYLE_DASHED] = null;
						newValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN] = null;
					}
				},
				function(menu) // initialize panel
				{ 
					var cbDashPanel = lineDashPanel.firstElementChild;
					let selectedOption = [null, null];
					if (selectedValueStyle && selectedValueStyle[selectedValue] && (selectedValueStyle[selectedValue][mxConstants.STYLE_DASHED] || selectedValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN]))
					{	cbDashPanel.checked = true;
						selectedOption = [selectedValueStyle[selectedValue][mxConstants.STYLE_DASHED] || null, selectedValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN] || null];
					}
					let selectedOptionAsString = selectedOption.join(',');
					for (let i = 0; i < menu.length ; i++)
					{
						if (menu[i].value == selectedOptionAsString)
						{	menu[i].selected = true;
							break;
						}
					}
					newValueStyle[selectedValue][mxConstants.STYLE_DASHED] = (cbDashPanel.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_DASHED] : null;
					newValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN] = (cbDashPanel.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN] : null;
				},
				null,
			);
			lineDashPanel.style.display = 'table-row';
			lineDashPanel.className = 'geFormatSection';
			panels.appendChild(lineDashPanel);
			var cbDashPanel = lineDashPanel.firstElementChild;
			// if no dash nor dash pattern in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || (!selectedValueStyle[selectedValue][mxConstants.STYLE_DASHED] && !selectedValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN]))
			{
				if (cbDashPanel.checked)
				{
					cbDashPanel.click();
				}
				else
					changeDisplay(lineDashPanel, cbDashPanel);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_DASHED, selectedValueStyle[selectedValue][mxConstants.STYLE_DASHED], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_DASH_PATTERN, selectedValueStyle[selectedValue][mxConstants.STYLE_DASH_PATTERN], [clone]);
				changeDisplay(lineDashPanel, cbDashPanel);
			}

			var fontColorPanel = panel.createColorOption(mxResources.get('fontColor'), function()
			{	// getColorFn
				return currentFontColor;
			}, function(color)
			{	// setColorFn
				thumbgraph.updateCellStyles(mxConstants.STYLE_FONTCOLOR, (color != mxConstants.NONE) ? color : defaultFontColor, [clone]);
			}, /* defaultColor */ '#ffffff',
			{	// listener
				install: function(apply) { fontColorApply = apply; },
				destroy: function() { fontColorApply = null; }
			}, function(color)
			{	// callbackFn
				newValueStyle[selectedValue][mxConstants.STYLE_FONTCOLOR] = (color != mxConstants.NONE) ? color : defaultFontColor;
				thumbgraph.updateCellStyles(mxConstants.STYLE_FONTCOLOR, (color != mxConstants.NONE) ? color : defaultFontColor, [clone]);
			}, /* hideCheckbox */ false);
			fontColorPanel.style.height = '30px';
			fontColorPanel.style.boxSizing = 'border-box';
			fontColorPanel.style.overflow = 'hidden';
			fontColorPanel.style.padding = '4px';
			fontColorPanel.style.width = '100%';
			fontColorPanel.style.display = 'table-row';
			fontColorPanel.style.right = '30px';
			panels.appendChild(fontColorPanel);
			// uncheck box if the fill collor is not changed
			var cbFontColor = fontColorPanel.firstElementChild;
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_FONTCOLOR] || selectedValueStyle[selectedValue][mxConstants.STYLE_FONTCOLOR] == defaultFontColor)
			{
				if (cbFontColor.checked)
				{
					cbFontColor.click();
				}
				else
					changeDisplay(fontColorPanel, cbFontColor);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_FONTCOLOR, selectedValueStyle[selectedValue][mxConstants.STYLE_FONTCOLOR], [clone]);
				changeDisplay(fontColorPanel, cbFontColor);
			}

			var fontSizePanel = document.createElement('div');
				
			createStepperOption(fontSizePanel,mxResources.get('fontSize'), 'pt', currentFontSize, 6, 50, 1, 50,
				function(input)  // handle new value 
				{
					var cbFontSize = fontSizePanel.firstElementChild;
					input.value = Math.max(6, Math.min(50, parseInt(input.value))) + ' pt';
					thumbgraph.updateCellStyles(mxConstants.STYLE_FONTSIZE, (input.value != mxConstants.NONE) ? parseInt(input.value) : currentFontSize , [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE] = (cbFontSize.checked) ? parseInt(input.value) : null;
				},
				function(input) // initialize panel
				{ 
					var cbFontSize = fontSizePanel.firstElementChild;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE])
					{	
						cbFontSize.checked = true;
					}
					newValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE] = (cbFontSize.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE] : null;
					input.value = currentFontSize + ' pt';
					input.parentNode.style.display = cbFontSize.checked ? '' : 'none';
				},
				null);
			fontSizePanel.style.display = 'table-row';
			panels.appendChild(fontSizePanel);
			var cbFontSize = fontSizePanel.firstElementChild;
			// if no fontSize in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE])
			{
				if (cbFontSize.checked)
				{
					cbFontSize.click();
				}
				else
					changeDisplay(fontSizePanel, cbFontSize);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_FONTSIZE, selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSIZE], [clone]);
				changeDisplay(fontSizePanel, cbFontSize);
			}

			var fontStylePanel = document.createElement('div');
			var buttonFontStyleValues = [mxConstants.FONT_BOLD, mxConstants.FONT_ITALIC, mxConstants.FONT_UNDERLINE];
			var fontStyleButtons = createButtonOption(fontStylePanel,mxResources.get('style'), ['bold', 'italic', 'underline'],
				function(buttonItems, checked)  // handle new value 
				{
					if (!checked)
					{	newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] = mxConstants.NONE;
						for (var i = 0; i < buttonItems.length; i++)
						{
							setSelected(buttonItems[i], false);
						}
						thumbgraph.updateCellStyles(mxConstants.STYLE_FONTSTYLE, newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] , [clone]);
					}
				},
				function(buttonItems) // initialize panel
				{ 
					var cbFontStyle = fontStylePanel.querySelectorAll('input[type="checkbox"]');
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE])
					{	cbFontStyle[0].checked = true;
						newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] = selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE];
					}
					else
						newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] = mxConstants.NONE;
					// set button on/off, according to initial value
					for (var i = 0; i < buttonItems.length; i++)
					{
						if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE])
							setSelected(buttonItems[i], (selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] & buttonFontStyleValues[i]) == buttonFontStyleValues[i]);
						else
							setSelected(buttonItems[i], false);
						
						buttonItems[i].id = buttonFontStyleValues[i];
						buttonItems[i].style.display = 'inline-block';
						buttonItems[i].style.padding = '1px 1px 1px 2px';
						mxEvent.addListener(buttonItems[i], 'click', function(evt)
						{
							var source = mxEvent.getSource(evt);
							var parent = source.parentNode;
							var mask = parent.id;
							newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] = (newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] == mxConstants.NONE) ?
																							(/*newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] |*/ mask) :	// set the value to on
																							(newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] ^ mask); 	// inverse the value
							setSelected(parent, (newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] & mask) == mask);
							thumbgraph.updateCellStyles(mxConstants.STYLE_FONTSTYLE, newValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE] , [clone]);
						});
					}
				});
			fontStylePanel.style.display = 'table-row';
			panels.appendChild(fontStylePanel);
			var cbFontStyle = fontStylePanel.firstElementChild;
			// if no fontstyle in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE])
			{
				if (cbFontStyle.checked)
				{
					cbFontStyle.click();
				}
				else
					changeDisplay(fontStylePanel, cbFontStyle);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_FONTSTYLE, selectedValueStyle[selectedValue][mxConstants.STYLE_FONTSTYLE], [clone]);
				changeDisplay(fontStylePanel, cbFontStyle);
			}

			var fontVerticalPanel = document.createElement('div');
			var buttonVerticalValues = ['0'];
			var fontVerticalButtons = createButtonOption(fontVerticalPanel,mxResources.get('vertical'), ['vertical'],
				function(buttonItems, checked)  // handle new value 
				{
					if (!checked)
					{	newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] = '1';
						for (var i = 0; i < buttonItems.length; i++)
						{
							setSelected(buttonItems[i], false);
						}
						thumbgraph.updateCellStyles(mxConstants.STYLE_HORIZONTAL, newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] , [clone]);
					}
				},
				function(buttonItems) // initialize panel
				{ 
					var cbFontVertical = fontVerticalPanel.firstElementChild;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL])
					{	cbFontVertical.checked = true;
						newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] = selectedValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL];
					}
					else
						newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] = mxConstants.NONE;
					// set button on/off, according to initial value
					for (var i = 0; i < buttonItems.length; i++)
					{
						if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL])
							setSelected(buttonItems[i], selectedValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] == buttonVerticalValues[i]);
						else
							setSelected(buttonItems[i], false);
						
						buttonItems[i].id = buttonVerticalValues[i];
						buttonItems[i].style.display = 'inline-block';
						buttonItems[i].style.padding = '1px 1px 1px 2px';
						mxEvent.addListener(buttonItems[i], 'click', function(evt)
						{
							var source = mxEvent.getSource(evt);
							var parent = source.parentNode;
							var grandParent = parent.parentNode;
							var value = parent.id;
							newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] = newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] == value ? // click on current selection ?
																						mxConstants.NONE :	// unset current selection, that is no selection
																						value;				// set to current button's value'
							grandParent.childNodes.forEach(function(button)
							{
								setSelected(button, newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] == button.id);
							});
							thumbgraph.updateCellStyles(mxConstants.STYLE_HORIZONTAL, newValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL] , [clone]);
							});
					}
				});
			fontVerticalPanel.style.display = 'table-row';
			panels.appendChild(fontVerticalPanel);
			var cbFontVertical = fontVerticalPanel.firstElementChild;
			// if no fontstyle in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL])
			{
				if (cbFontVertical.checked)
				{
					cbFontVertical.click();
				}
				else
					changeDisplay(fontVerticalPanel, cbFontVertical);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_HORIZONTAL, selectedValueStyle[selectedValue][mxConstants.STYLE_HORIZONTAL], [clone]);
				changeDisplay(fontVerticalPanel, cbFontVertical);
			}

			NodeList.prototype.forEach = Array.prototype.forEach; // Hack to loop through nodes
			var fontHorizontalAlignPanel = document.createElement('div');
			var buttonHorizontalAlignValues = [mxConstants.ALIGN_LEFT, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_RIGHT];
			var fontHorizontalAlignButtons = createButtonOption(fontHorizontalAlignPanel,mxResources.get('horizontalAlignment') || '', buttonHorizontalAlignValues,
				function(buttonItems, checked)  // handle new value 
				{
					if (!checked)
					{	newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] = mxConstants.NONE;
						for (var i = 0; i < buttonItems.length; i++)
						{
							setSelected(buttonItems[i], false);
						}
						thumbgraph.updateCellStyles(mxConstants.STYLE_ALIGN, newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] , [clone]);
					}
				},
				function(buttonItems) // initialize panel
				{ 
					var cbHorizontalAlign = fontHorizontalAlignPanel.firstElementChild;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_ALIGN])
					{	cbHorizontalAlign.checked = true;
						newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] = selectedValueStyle[selectedValue][mxConstants.STYLE_ALIGN];
					}
					else
						newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] = mxConstants.NONE;
					// set button on/off, according to initial value
					for (var i = 0; i < buttonItems.length; i++)
					{
						if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_ALIGN])
							setSelected(buttonItems[i], selectedValueStyle[selectedValue][mxConstants.STYLE_ALIGN] == buttonHorizontalAlignValues[i]);
						else
							setSelected(buttonItems[i], false);

						buttonItems[i].id = buttonHorizontalAlignValues[i];
						buttonItems[i].style.display = 'inline-block';
						buttonItems[i].style.padding = '1px 1px 1px 2px';
						mxEvent.addListener(buttonItems[i], 'click', function(evt)
						{
							var source = mxEvent.getSource(evt);
							var parent = source.parentNode;
							var grandParent = parent.parentNode;
							var value = parent.id;
							newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] = newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] == value ? // click on current selection ?
																						mxConstants.NONE :	// unset current selection, that is no selection
																						value;				// set to current button's value'
							grandParent.childNodes.forEach(function(button)
							{
								setSelected(button, newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] == button.id);
							});
							thumbgraph.updateCellStyles(mxConstants.STYLE_ALIGN, newValueStyle[selectedValue][mxConstants.STYLE_ALIGN] , [clone]);
						});
					}
				});
			fontHorizontalAlignPanel.style.display = 'table-row';
			panels.appendChild(fontHorizontalAlignPanel);
			var cbHorizontalAlign = fontHorizontalAlignPanel.firstElementChild;
			// if no fontstyle in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_ALIGN])
			{
				if (cbHorizontalAlign.checked)
				{
					cbHorizontalAlign.click();
				}
				else
					changeDisplay(fontHorizontalAlignPanel, cbHorizontalAlign);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_ALIGN, selectedValueStyle[selectedValue][mxConstants.STYLE_ALIGN], [clone]);
				changeDisplay(fontHorizontalAlignPanel, cbHorizontalAlign);
			}

			var fontVerticalAlignPanel = document.createElement('div');
			var buttonVerticalAlignValues = [mxConstants.ALIGN_TOP, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_BOTTOM];
			var fontVerticalAlignButtons = createButtonOption(fontVerticalAlignPanel,mxResources.get('verticalAlignment') || '', buttonVerticalAlignValues,
				function(buttonItems, checked)  // handle new value 
				{
					if (!checked)
					{	newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.NONE;
						for (var i = 0; i < buttonItems.length; i++)
						{
							setSelected(buttonItems[i], false);
						}
						thumbgraph.updateCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] , [clone]);
					}
				},
				function(buttonItems) // initialize panel
				{ 
					var cbVerticalAlign = fontVerticalAlignPanel.firstElementChild;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN])
					{	cbVerticalAlign.checked = true;
						newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] = selectedValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN];
					}
					else
						newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.NONE;
					// set button on/off, according to initial value
					for (var i = 0; i < buttonItems.length; i++)
					{
						if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN])
							setSelected(buttonItems[i], selectedValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] == buttonVerticalAlignValues[i]);
						else
							setSelected(buttonItems[i], false);

						buttonItems[i].id = buttonVerticalAlignValues[i];
						buttonItems[i].style.display = 'inline-block';
						buttonItems[i].style.padding = '1px 1px 1px 2px';
						mxEvent.addListener(buttonItems[i], 'click', function(evt)
						{
							var source = mxEvent.getSource(evt);
							var parent = source.parentNode;
							var grandParent = parent.parentNode;
							var value = parent.id;
							newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] = newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] == value ? // click on current selection ?
																						mxConstants.NONE :	// unset current selection, that is no selection
																						value;				// set to current button's value'
							grandParent.childNodes.forEach(function(button)
							{
								setSelected(button, newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] == button.id);
							});
							thumbgraph.updateCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, newValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN] , [clone]);
						});
					}
				});
			fontVerticalAlignPanel.style.display = 'table-row';
			fontVerticalAlignPanel.className = 'geFormatSection';
			panels.appendChild(fontVerticalAlignPanel);
			var cbVerticalAlign = fontVerticalAlignPanel.firstElementChild;
			// Display - or not - the value field, according to checkbox
			// if no fontstyle in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN])
			{
				if (cbVerticalAlign.checked)
				{
					cbVerticalAlign.click();
				}
				else
					changeDisplay(fontVerticalAlignPanel, cbVerticalAlign);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, selectedValueStyle[selectedValue][mxConstants.STYLE_VERTICAL_ALIGN], [clone]);
				changeDisplay(fontVerticalAlignPanel, cbVerticalAlign);
			}

			var imagePanel = document.createElement('div');
			var imageMenu = document.createElement('select');
			var icon = document.createElement('img');
			var margin = 20;
			icon.style.position = 'absolute';
			icon.style.right = margin + 'px';
			var imageAlignPanel = document.createElement('div');
			var imageAlignMenu = document.createElement('select');
			var imageVerticalAlignPanel = document.createElement('div');
			var imageVerticalAlignMenu = document.createElement('select');

			// Display - or not - the value field, according to checkbox
			var changeImageDisplay = function(cbImage)
			{	
				let ielem = 0;
				for(var child=imagePanel.firstElementChild; child!==null; child=child.nextElementSibling) {
					if (ielem>1)
					{	child.style.display = (cbImage.checked) ? '' : 'none';
					}
					ielem++;
				}
			}

			// display icon selector
			var displayFileExplorer = function(evt) {
				if (imageMenu.value == 'imageFromDrawioStore')
				{
					var dlg = new fileExplorerDialog('/drawio/src/main/webapp/img');
					if (dlg && dlg.container)
					{
						ui.showDialog(dlg.container, 1000, 600, true, true, null, false, false);
					}
				}
				else if (imageMenu.value == 'imageFromCustomStore')
				{
					var dlg = new fileExplorerDialog('/drawio-integration/images');
					if (dlg && dlg.container)
					{
						ui.showDialog(dlg.container, 1000, 600, true, true, null, false, false);
					}
				}
				else if (imageMenu.value == 'imageAddToCustomStore')
				{
					var fileInput = document.createElement('input');
					fileInput.type = 'file';
					fileInput.accept = 'image/*';
	
					mxEvent.addListener(fileInput, 'change', function(evt)
					{
						var file = evt.target.files[0];
						var mimeType = file.type;
						var fileName = file.name;
						// setting up the reader
						var reader = new FileReader();
//						reader.readAsText(file,'UTF-8');
						reader.readAsDataURL(file);

						// get the file content as img
						reader.onload = readerEvent => {
							var img = readerEvent.target.result;
							// get the name for saving on server
							var url = pluginDomain + '/drawio-integration/images/';
							var iconUrl = saveFileToServer(img, url, fileName, mimeType, icon, true/*base64Encoded*/	);
							// display as icon
							let extension = '.' + mimeType.split('/')[1];
						}
					});
			
					fileInput.click();
				}
			};

			var imageSelectOptions = ['imageFromDrawioStore', 'imageFromCustomStore', 'imageAddToCustomStore'];

			// create icon selection menu
			for (var i = 0; i < imageSelectOptions.length; i++)
			{
				var imageSelectOption = document.createElement('option');
				imageSelectOption.setAttribute('value', imageSelectOptions[i]);
				imageSelectOption.addEventListener("click", displayFileExplorer);
				mxUtils.write(imageSelectOption, mxResources.get(imageSelectOptions[i]));
				imageMenu.appendChild(imageSelectOption);
			}
			imageMenu.style.position = 'absolute';
			imageMenu.style.right = '50px';

			const regex = /^.*(\/archimap)/;
			const regex2 = /\/archimap.*/;
			const regex3 = /^.*(\/.*\/archimap)/;
			var fileExplorerDialog = function(path) {
					var fileExplorer = document.createElement('div');
					var options = {
						initpath: [
							[ window.config.plugin_rootdir + path, '/', { canmodify: false } ]
						],
						onopenfile: function(folder, entry) {
							var dir = folder.GetPathIDs().join('/');
							dir = dir.replace(regex, ''); // suppress path up to and including /archimap
							var url = pluginDomain + dir + '/';
							// display as icon
							icon.src = url + entry.name;
							thumbshape.image = icon.src;
							ui.hideDialog();
							var dir = folder.GetPathIDs().join('/');
							dir = dir.replace(regex3, '$1'); // suppress path up to and including /domainName/plugins/archimap
							newValueStyle[selectedValue][mxConstants.STYLE_IMAGE] = url + entry.name;
							newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] = 25;
							newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] = 25;
							newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_RIGHT;
							newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_BOTTOM;
						},

						onrefresh: function(folder, required) {
							var $this = this;
							var dir = folder.GetPathIDs().join('/');
							dir = dir.replace(regex, '$1'); // suppress path before /archimap
							var xhr = new this.PrepareXHR({
								method : 'GET',
								url: pluginDomain + '/drawio-integration/ajax/getfile.php?dir=/'+dir,
								headers: {cors: 'http://localhost'},
								params: {
									action: 'file_explorer_refresh',
									path: JSON.stringify(folder.GetPathIDs())
								},
								onsuccess: function(e) {
									var data = JSON.parse(e.target.responseText);
									let folderentries = [];
									let dircount = 0;
									for (const type in data) {
										if (type == 'directories')
										{
											let directories = data[type];
											dirLen = directories.length;
											for (var i = 0; i < dirLen; i++) {
															directory = directories[i].replace(/^.*[\\\/]/, ''); // get filename from full path
															folderentries[i] = {'id' : directory,
																			'name' : directory,
																			'type' : 'folder',
																			'hash' : 'folder_' + directory
																			};
											};
											dircount = folderentries.length;
										}
										else if (type == 'filenames')
										{
											let filenames = data[type];
											filenamesLen = filenames.length;
											let thumbdir = document.location.protocol + '//' + document.location.hostname + 
															window.location.pathname.replace(regex2,'') + // keep only the path before /archimap
															dir + '/';
											for (var i = 0; i < filenamesLen; i++) {
															filename = filenames[i].replace(/^.*[\\\/]/, ''); // get filename from full path
															folderentries[dircount + i] = {'id' : filename,
																			'name' : filename,
																			'type' : 'file',
																			'hash' : 'file_' + filename,
																			'thumb' : thumbdir + filename
																			};
											};
										}
									}
									folder.SetEntries(folderentries);

									if (data.success)
									{
										if ($this.IsMappedFolder(folder))  folder.SetEntries(data.entries);
									}
/*									else if (required)
									{
										$this.SetNamedStatusBarText('folder', $this.EscapeHTML('Failed to load folder.  ' + data.error));
									}
*/								},
								onerror: function(e) {
									// Maybe output a nice message if the request fails for some reason.
//									if (required)  $this.SetNamedStatusBarText('folder', 'Failed to load folder.  Server error.');

//									console.log('error', e);
								}
							});

							xhr.Send();
						}
					};

					var fe = new window.FileExplorer(fileExplorer, options);
					this.container = fileExplorer;
			}

			createMenuOption(imagePanel,mxResources.get('image'), imageMenu, 500,
				function(selectedOption)  // handle new value 
				{
					var cbImage = imagePanel.firstElementChild;
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE, icon.src , [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE] = icon.src;
					thumbshape.image = icon.src;
				},
				function(menu) // initialize panel
				{ 
					var cbImage = imagePanel.firstElementChild;
					icon.src = currentImage;
//					let currentMargin = parseInt(currentImageWidth, 10) + margin + 5;
//					imageMenu.style.right = currentMargin + 'px';  // move menu to the left according to icon size
					thumbshape.image = icon.src;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE])
					{	cbImage.checked = true;
//						selectedOption = selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE];
					}
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE] = (cbImage.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE] : mxConstants.NONE;
				},
				null
			);
			imagePanel.style.padding = '4px 4px 4px 4px';
			imagePanel.style.height = '30px';
			imagePanel.style.display = 'table-row';
			imagePanel.style.boxSizing = 'border-box';
			imagePanel.style.overflow = 'visible';
			imagePanel.style.width = '100%';
			imagePanel.style.fontWeight = 'normal';
			imagePanel.style.display = 'table-row';
			panels.appendChild(imagePanel);
			var cbImage = imagePanel.firstElementChild;
			// Display - or not - the value field, according to checkbox
			// if no image in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE])
			{
				if (cbImage.checked)
				{
					cbImage.click();
				}
				else
					changeImageDisplay(cbImage);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_ALIGN, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_WIDTH, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_HEIGHT, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT], [clone]);
				changeImageDisplay(cbImage);
			}

			var cbImage = imagePanel.firstElementChild;
			var horizontalAlignment = [mxConstants.ALIGN_LEFT, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_RIGHT];

			for (var i = 0; i < horizontalAlignment.length; i++)
			{
				var horizontalAlignmentOption = document.createElement('option');
				horizontalAlignmentOption.setAttribute('value', horizontalAlignment[i]);
				mxUtils.write(horizontalAlignmentOption, mxResources.get(horizontalAlignment[i]));
				imageAlignMenu.appendChild(horizontalAlignmentOption);
			}
			imageAlignMenu.style.position = 'absolute';
			imageAlignMenu.style.right = '20px';
			imageAlignMenu.style.display = 'inherit';
			
			createMenuOption(imageAlignPanel,mxResources.get('horizontalAlignment'), imageAlignMenu, 500,
				function(selectedOption)  // handle new value 
				{
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_ALIGN, selectedOption, [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] = selectedOption;
				},
				function(menu) // initialize panel
				{ 
					let selectedOption = currentImageAlign;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN])
					{	//cbImage[0].checked = true;
						selectedOption = selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN];
					}
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] = (cbImage.checked) ? selectedOption : mxConstants.NONE;
					for (let i = 0; i < menu.length ; i++)
					{
						if (menu[i].value == selectedOption)
						{	menu[i].selected = true;
							break;
						}
					}
				},
				cbImage // driving checkbox
			);
			imageAlignPanel.style.display = 'table-row';
			imageAlignPanel.style.padding = '12px 4px 4px 4px';
			imagePanel.appendChild(imageAlignPanel);
			
			var verticalAlignment = [mxConstants.ALIGN_TOP, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_BOTTOM];

			for (var i = 0; i < verticalAlignment.length; i++)
			{
				var verticalAlignmentOption = document.createElement('option');
				verticalAlignmentOption.setAttribute('value', verticalAlignment[i]);
				mxUtils.write(verticalAlignmentOption, mxResources.get(verticalAlignment[i]));
				imageVerticalAlignMenu.appendChild(verticalAlignmentOption);
			}
			imageVerticalAlignMenu.style.position = 'absolute';
			imageVerticalAlignMenu.style.right = '20px';
			imageVerticalAlignMenu.style.display = 'inherit';
				
			createMenuOption(imageVerticalAlignPanel,mxResources.get('verticalAlignment'), imageVerticalAlignMenu, 500,
				function(selectedOption)  // handle new value 
				{
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, selectedOption, [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = selectedOption;
				},
				function(menu) // initialize panel
				{ 
//					var cbImage = imagePanel.querySelectorAll('input[type="checkbox"]');
					let selectedOption = currentImageVerticalAlign;
					if (selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN])
					{	//cbImage[0].checked = true;
						selectedOption = selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN];
					}
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = (cbImage.checked) ? selectedOption : mxConstants.NONE;
					for (let i = 0; i < menu.length ; i++)
					{
						if (menu[i].value == selectedOption)
						{	menu[i].selected = true;
							break;
						}
					}
				},
				cbImage // driving checkbox
				);
			imageVerticalAlignPanel.style.display = 'table-row';
			imageVerticalAlignPanel.style.padding = '12px 4px 4px 4px';
			imagePanel.appendChild(imageVerticalAlignPanel);

			var imageWidthPanel = document.createElement('div');
			createStepperOption(imageWidthPanel,mxResources.get('width'), 'px', currentImageWidth, 10, 200, 1, 50,
				function(input)  // handle new value 
				{
					input.value = Math.max(10, Math.min(200, parseInt(input.value))) + ' px';
/*					let currentMargin = parseInt(input.value, 10) + margin + 5;
					imageMenu.style.right = currentMargin + 'px';  // move menu to the left according to icon size
					icon.style.width = input.value;
*/					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_WIDTH, (input.value != mxConstants.NONE) ? parseInt(input.value) : currentImageWidth , [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] = (cbImage.checked) ? parseInt(input.value) : mxConstants.NONE;
				},
				function(input) // initialize panel
				{ 
					input.value = currentImageWidth + ' px';
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] = (cbImage.checked) ? currentImageWidth : mxConstants.NONE;
				}, 
				cbImage); // driving checkbox
			imageWidthPanel.style.display = 'table-row';
			imageWidthPanel.style.padding = '12px 4px 4px 4px';
			imagePanel.appendChild(imageWidthPanel);

			var imageHeightPanel = document.createElement('div');
			createStepperOption(imageHeightPanel,mxResources.get('height'), 'px', currentImageHeight, 10, 200, 1, 50,
				function(input)  // handle new value 
				{
					input.value = Math.max(10, Math.min(200, parseInt(input.value))) + ' px';
//					icon.style.height = input.value;
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_HEIGHT, (input.value != mxConstants.NONE) ? parseInt(input.value) : currentImageHeight , [clone]);
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] = (cbImage.checked) ? parseInt(input.value) : mxConstants.NONE;
				},
				function(input) // initialize panel
				{ 
					input.value = currentImageHeight + ' px';
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] = (cbImage.checked) ? currentImageHeight : mxConstants.NONE;
				}, 
				cbImage); // driving checkbox
			imageHeightPanel.style.display = 'table-row';
			imageHeightPanel.style.padding = '12px 4px 4px 4px';
//			imageHeightPanel.className = 'geFormatSection';
			imagePanel.appendChild(imageHeightPanel);

			mxEvent.addListener(imagePanel, 'click', function(evt)
			{
				var source = mxEvent.getSource(evt);
				if (source == cbImage || source.nodeName == 'P')
				{		
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE, cbImage.checked ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE] : mxConstants.NONE, [clone]);
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_ALIGN, cbImage.checked ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] : mxConstants.NONE, [clone]);
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, cbImage.checked ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] : mxConstants.NONE, [clone]);
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_WIDTH, cbImage.checked ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] : mxConstants.NONE, [clone]);
					thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_HEIGHT, cbImage.checked ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] : mxConstants.NONE, [clone]);
					changeImageDisplay(cbImage);
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE] = (cbImage.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE] : mxConstants.NONE;
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] = (cbImage.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] : mxConstants.NONE;
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = (cbImage.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] : mxConstants.NONE;
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] = (cbImage.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH] : mxConstants.NONE;
					newValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] = (cbImage.checked) ? selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT] : mxConstants.NONE;
				}
			});

			// if image in style, reflect it on display
			if (!selectedValueStyle || !selectedValueStyle[selectedValue]
			|| (!selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE] && !selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN] 
				&& !selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN]))
			{
				if (cbImage.checked)
				{
					cbImage.checked = false;
				}
				else
					changeImageDisplay(cbImage);
			}
			else
			{
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_ALIGN, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_ALIGN], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_VERTICAL_ALIGN], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_WIDTH, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_WIDTH], [clone]);
				thumbgraph.updateCellStyles(mxConstants.STYLE_IMAGE_HEIGHT, selectedValueStyle[selectedValue][mxConstants.STYLE_IMAGE_HEIGHT], [clone]);
				changeImageDisplay(cbImage);
			}
			// Reserve space for icon
			icon.style.cssFloat = 'right';
			icon.style.width = /*mxUtils.getNumber(thumbstate.style, mxConstants.STYLE_IMAGE_WIDTH, mxConstants.DEFAULT_IMAGESIZE)*/mxConstants.DEFAULT_IMAGESIZE + 'px';  // keep ratio
			icon.style.height = /*mxUtils.getNumber(thumbstate.style, mxConstants.STYLE_IMAGE_HEIGHT, mxConstants.DEFAULT_IMAGESIZE)*/mxConstants.DEFAULT_IMAGESIZE + 'px'; // keep ratio
			document.getElementById(mxResources.get('image') + 'menu').appendChild(icon);
		};


		// after getting the CSS styles, fill in a structure with the style information
		var success = function(req)
		{
			var decodeHTML = function (html) {
				var txt = document.createElement('textarea');
				txt.innerHTML = html;
				return txt.value;
			};
			var parser = new DOMParser();
			var styles = JSON && JSON.parse(req.request.responseText) || $.parseJSON(req.request.responseText);
			var style = {};
			if (styles['param'])
			{
				isNewKey = true;
				var arrayLength = styles['param'].length;
				// decode the style value retrieved from repository
				for (var i = 0 in styles['param'])
				{
					var text = decodeHTML(styles['param'][i].value); // get the "value" field of STYLE 'key'
					xmlDoc = parser.parseFromString(text,"text/xml"); // parse the "value" field as xml
					var addStyleSheet = xmlDoc.querySelectorAll("mxStylesheet>add"); // select the leaf "add" nodes 
					for (var i in addStyleSheet)								// put the "as" value and the "value" value in a structure
					{
						if (addStyleSheet.hasOwnProperty(i)) 
						{
							isNewKey = false; // key with cssName exists in repository
							var cssName = addStyleSheet[i].getAttribute('as');
							style[cssName] = {};
							var addNodes = addStyleSheet[i].querySelectorAll("add>add"); // select the leaf "add" nodes 
							for (var j in addNodes)								// put the "as" value and the "value" value in a structure
							{
								if (addNodes.hasOwnProperty(j)) 
								{
									var styleName = addNodes[j].getAttribute('as');
									var styleValue = addNodes[j].getAttribute('value');
									style[cssName][styleName] = styleValue;
								}
							}
						}
					}
				}
			}
			else
				isNewKey = true;
			// update displayed values
			displayPanel(cssList.value, style, content);
		};
		var error = function(message)
		{
			this.ui.showError(mxResources.get('error'), message, mxResources.get('ok'), null);
		};
		
		var getCssStyles = function(evt)
		{
			repository.getStyles("STYLE", (evt ? evt.target.value : cssList.value), success, error);
		};
		cssList.addEventListener('change', (event) => getCssStyles(event));
		content.appendChild(cssList);
	
		var listCssClasses = function(cssClasses, postFn)
		{
			let cssClasseslen = cssClasses.length;
			for (var l = 0; l < cssClasseslen; l++)
			{
				let option = document.createElement('option');
				option.value = cssClasses[l];
				mxUtils.write(option, cssClasses[l]);
				cssList.appendChild(option);
			}
			if (postFn)
				postFn();
			return cssList;
		}
		
		var redrawCellswithStyle = function(style)
		{
			var cells = editorUi.editor.graph.model.cells;
			for (var property in cells)
			{
				var cell = cells[property];
				if (cell.style)
				{
					styles = cell.style.split(';');
					if (styles.indexOf(style) >= 0)
					{
						editorUi.editor.graph.model.styleForCellChanged(cell, style);
						var state = editorUi.editor.graph.view.getState(cell);
//				console.log('redraw',cell.value, style, cell.style, state.shape);
						state.shape.redraw();
					}
				}
			}
		}

		function setSelected(elt, selected)
		{
			elt.style.backgroundImage = (selected) ? 'linear-gradient(#c5ecff 0px,#87d4fb 100%)' : '';
		};
	
		var createButtonOption = function(container, label, buttonOptions, handler, init, hideCheckbox)
		{
			var cb = document.createElement('input');
			cb.setAttribute('type', 'checkbox');
			cb.style.margin = '0px 6px 0px 0px';
			container.appendChild(cb);
			
			if (!hideCheckbox)
			{
				container.appendChild(cb);	
			}
	
			var span1 = document.createElement('p');
			span1.style.display = 'inline';
			mxUtils.write(span1, label || '');
			container.appendChild(span1);
			
			var span2 = document.createElement('span');
			var buttonItems = [];
			var height = 24;
			var width = 24;
			for (var i = 0; i < buttonOptions.length; i++)
			{
				var action = editorUi.actions.get(buttonOptions[i]);
				if (action)
				{	
					buttonItems.push(editorUi.toolbar.addItem('geSprite-' + buttonOptions[i].toLowerCase(), buttonOptions[i], span2, true));
					buttonItems[i].setAttribute('title', mxResources.get(buttonOptions[i]) + ' (' + action.shortcut + ')');
				}
				else
				{	
					buttonItems.push(editorUi.toolbar.addButton('geSprite-' + buttonOptions[i].toLowerCase(), mxResources.get(buttonOptions[i]), null, span2));
				}
				BaseFormatPanel.prototype.styleButtons([buttonItems[i]]);
				buttonItems[i].style.height = height + 'px';
				buttonItems[i].style.width = width + 'px';
			}
			// set right margin
			let rightMargin = 20;
			for (var i = buttonOptions.length - 1; i >= 0; i--)
			{
				buttonItems[i].style.position = 'absolute';
				buttonItems[i].style.right = rightMargin + 'px';
				rightMargin += width + 2;
			}
	
			mxEvent.addListener(container, 'click', function(evt)
			{
				var source = mxEvent.getSource(evt);
		
				if (source == cb || source.nodeName == 'P')
				{		
					// Toggles checkbox state for click on label
					if (source != cb)
					{
						cb.checked = !cb.checked;
					}
	
					span2.style.display = cb.checked ? 'inherit' : 'none';
				}

				if (handler != null)
				{
					handler(buttonItems, cb.checked);
				}
			});
	
			if (init != null)
			{
				init(buttonItems);
			}
			span2.style.cssFloat = 'right';
			span2.style.width = ((width + 2) * buttonOptions.length) + 'px';
//			span2.style.display = cb.checked ? 'inherit' : 'none';
			span2.style.display = 'inherit';

			container.style.padding = '6px 0px 1px 0px';
			container.style.height = '30px';
			container.style.boxSizing = 'border-box';
			container.style.overflow = 'hidden';
			container.style.padding = '4px';
			container.style.width = '100%';
			container.style.fontWeight = 'normal';
			container.style.display = 'table-row';
			container.style.marginTop = '0px';
			container.style.right = '30px';
			container.appendChild(span2);

			return container;

		}

		var createStepperOption = function(container, label, unit, defaultValue, minValue, maxValue, step, width, handler, init, existingcb, isFloat)
		{
			var span1 = document.createElement('p');
			span1.style.display = 'inline';
			mxUtils.write(span1, label);
	
			var span2 = document.createElement('div');
			span2.style.cssFloat = 'right';
			
			if (existingcb)
			{
				var cb = existingcb;
				span1.style.paddingLeft = '16px';
			}
			else
			{
				var cb = document.createElement('input');
				cb.setAttribute('type', 'checkbox');
				cb.style.margin = '0px 6px 0px 0px';
	
				container.appendChild(cb);	
				
				mxEvent.addListener(container, 'click', function(evt)
				{
					var source = mxEvent.getSource(evt);
		
					if (source == cb || source.nodeName == 'P')
					{		
						// Toggles checkbox state for click on label
						if (source != cb)
						{
							cb.checked = !cb.checked;
						}
	
						// Overrides default value with current value to make it easier
						// to restore previous value if the checkbox is clicked twice
						var value = parseInt(input.value);
						span2.style.display = cb.checked ? 'inherit' : 'none';
						input.style.display = span2.style.display;
						stepper.style.display = span2.style.display;
			
						input.value = (cb.checked) ? (value || defaultValue) + ' ' + unit : mxConstants.NONE;
						if (handler != null)
						{
							handler(input);
						}
					}
				});
			
			}
			width = (width != null) ? width : 50;
			height = /*(height != null) ? height :*/ 11;
//			span2.style.display = cb.checked ? 'inherit' : 'none';
			span2.style.display = 'inherit';
			container.appendChild(span1);
			container.appendChild(span2);
	
			var input = document.createElement('input');
			input.style.display = 'inherit';
			input.style.width = width + 'px';
			input.style.textAlign = 'right';
			input.style.position = 'absolute';
			input.style.right = '20px';
			input.value = (defaultValue || '1') + ' ' + unit;
			span2.appendChild(input);
	
			var stepper = document.createElement('span');
			mxUtils.setPrefixedStyle(stepper.style, 'borderRadius', '3px');
			stepper.style.border = '1px solid rgb(192, 192, 192)';
			stepper.style.position = 'absolute';
			stepper.style.right = '0px';
			stepper.style.display = 'inherit';
	
			var up = document.createElement('div');
			up.style.borderBottom = '1px solid rgb(192, 192, 192)';
			up.style.position = 'absolute';
			up.style.height = height + 'px';
			up.style.width = '10px';
			up.style.right = '10px';
			up.className = 'geBtnUp';
			stepper.appendChild(up);
	
			var down = up.cloneNode(false);
			down.style.border = 'none';
			down.style.height = height + 'px';
			down.style.top = '11px';
			down.className = 'geBtnDown';
			stepper.appendChild(down);
			span2.appendChild(stepper);

			mxEvent.addListener(down, 'click', function(evt)
			{
				if (input.value == '')
				{
					input.value = (defaultValue || '1') + ' ' + unit;
				}
		
				var val = isFloat? parseFloat(input.value) : parseInt(input.value);
		
				if (!isNaN(val))
				{
					input.value = (val - step) + ' ' + unit;
			
					if (update != null)
					{
						update(evt);
					}
				}
		
				mxEvent.consume(evt);
			});
	
			mxEvent.addListener(up, 'click', function(evt)
			{
				if (input.value == '')
				{
					input.value = (defaultValue || '1') + ' ' + unit;
				}
		
				var val = isFloat? parseFloat(input.value) : parseInt(input.value);
		
				if (!isNaN(val))
				{
					input.value = (val + step) + ' ' + unit;
			
					if (update != null)
					{
						update(evt);
					}
				}
		
				mxEvent.consume(evt);
			});
			
			mxEvent.addListener(input, 'blur', function(evt)
			{
/*				if (input.value == '')
				{
					input.value = (defaultValue || '1') + ' ' + unit;
				}
*/		
				var val = isFloat? parseFloat(input.value) : parseInt(input.value);
		
				if (!isNaN(val))
				{			
					if (update != null)
					{
						update(evt);
					}
				}
		
				mxEvent.consume(evt);
			});
			
			var update = mxUtils.bind(this, function(evt)
			{
				if (handler != null)
				{
					handler(input);
				}
				else
				{
					var value = isFloat? parseFloat(input.value) : parseInt(input.value);
					value = Math.min(maxValue, Math.max(minValue, (isNaN(value)) ? defaultValue : value));
				
					input.value = ((value != null) ? value : defaultValue) + ' ' + unit;
				}
		
				mxEvent.consume(evt);
			});
	
			if (init != null)
			{
				init(input);
			}

			container.style.padding = '6px 0px 1px 0px';
			container.style.height = '30px';
			container.style.boxSizing = 'border-box';
			container.style.overflow = 'hidden';
			container.style.padding = '4px';
			container.style.width = '100%';
			container.style.fontWeight = 'normal';
			container.style.display = 'table-row';
			return container;
		};
		
		var createMenuOption = function(container, label, menu, width, handler, init, existingcb)
		{
			var span1 = document.createElement('p');
			span1.style.display = 'inline';
			mxUtils.write(span1, label || '');
			
			var span2 = document.createElement('div');
			span2.style.cssFloat = 'right';
			span2.id = label + 'menu';
	
			if (existingcb)
			{
				var cb = existingcb;
				span1.style.paddingLeft = '16px';
			}
			else
			{
				var cb = document.createElement('input');
				cb.setAttribute('type', 'checkbox');
				cb.style.margin = '0px 6px 0px 0px';
	
				container.appendChild(cb);	
				
				mxEvent.addListener(container, 'click', function(evt)
				{
					var source = mxEvent.getSource(evt);
		
					if (source == cb || source.nodeName == 'P')
					{		
						// Toggles checkbox state for click on label
						if (source != cb)
						{
							cb.checked = !cb.checked;
						}
	
						span2.style.display = cb.checked ? 'inherit' : 'none';
						selectedOption = (cb.checked) ? menu.value : mxConstants.NONE;
						if (handler != null)
						{
							handler(selectedOption);
						}
					}
				});
			}
			
			container.appendChild(span1);
			container.appendChild(span2);
			span2.appendChild(menu);
//			span2.style.display = cb.checked ? 'inherit' : 'none';
			span2.style.display = 'inherit';
			width = (width != null) ? width : 200;
			var height = /*(height != null) ? height :*/ 8;
	
			mxEvent.addListener(menu, 'click', function(evt)
			{
				selectedOption = (cb.checked) ? menu.value : mxConstants.NONE;
				if (handler != null)
				{
					handler(selectedOption);
				}
			});
	
			if (init != null)
			{
				init(menu);
			}

			container.style.padding = '6px 0px 1px 0px';
			container.style.height = '30px';
			container.style.boxSizing = 'border-box';
			container.style.overflow = 'hidden';
			container.style.padding = '4px';
			container.style.width = '100%';
			container.style.fontWeight = 'normal';
			container.style.display = 'table-row';
			container.style.right = '20px';
			return container;
		};

		var saveFileToServer = function(data, url, filename, mimeType, icon, base64Encoded)
		{
			let extension = '.' + mimeType.split('/')[1];
			let label = document.createElement('label');
			label.textContent = mxResources.get('filename') + ' ';
			label.textAlign = 'center';
			let pattern = '^[a-zA-Z0-9-_]+$';
			let regexp = new RegExp(pattern);
			let newFilename = document.createElement('input');
			newFilename.id = 'newfilename';
			newFilename.pattern = pattern;
			newFilename.title = mxResources.get('alphanumericPlus-_');
			newFilename.value = filename.replace(extension, '');
			regexp.test(newFilename.value)?newFilename.style.color = "green":newFilename.style.color = "red";
			newFilename.addEventListener('keyup', (event) => 
			{
				regexp.test(newFilename.value)?newFilename.style.color = "green" : newFilename.style.color = "red";
			});
			newFilename.addEventListener('focus', (event) => 
			{
				regexp.test(newFilename.value)?newFilename.style.color = "green":newFilename.style.color = "red";
			});
			label.appendChild(newFilename);

			var dlg = new CustomDialog(editorUi, label, mxUtils.bind(this, function()
			{ // okFn
				if (regexp.test(newFilename.value)) // check that the pattern is respected
				{
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4 && (xhr.status != 200 && xhr.status != 0)) {
							ui.showError(mxResources.get('error'), mxResources.get('errorOnSaving'), mxResources.get('ok'), null);
						}; 
					}
					var urlparams = 'dir=images&filename=' + encodeURIComponent(newFilename.value) + '&extension=' + encodeURIComponent(extension);
					xhr.open("POST", window.DRAWIOINTEGRATION_PATH + "/ajax/putfile.php?"+urlparams, true);
					xhr.setRequestHeader('Content-type', mimeType);
					xhr.send(data);
					icon.src = url + newFilename.value + extension;
					thumbshape.image = icon.src;
				}
			}), mxUtils.bind(this, function()
			{ // cancelFn
				editorUi.hideDialog();
			}), mxResources.get('saveAs') // okButtonText
			);
			var height = 160;
			editorUi.showDialog(dlg.container, 300, height, true, true);
		}

		// build combobox with list of styles from central repository
		dataSource(listCssClasses, getCssStyles);
		var data = null;
		var dlg = new CustomDialog(editorUi, content, mxUtils.bind(this, function()
		{
			// when hitting "Save", build the xml stylesheet
			var key = cssList.value;
			var doc = mxUtils.createXmlDocument();
			var library = doc.createElement('mxStylesheet');
			doc.appendChild(library);
			var addKey = doc.createElement('add');
			addKey.setAttribute('as', key);
			library.appendChild(addKey);
			var addShape = doc.createElement('add');
			addShape.setAttribute('as', 'shape');
			addShape.setAttribute('value', newValueStyle[key]['shape']);
			addKey.appendChild(addShape);
			for (attrib in newValueStyle[key])
			{
				if (newValueStyle[key].hasOwnProperty(attrib) && attrib != 'shape' && newValueStyle[key][attrib] && newValueStyle[key][attrib] != mxConstants.NONE && newValueStyle[key][attrib] !== null)
				{
					var addAttrib = doc.createElement('add');
					addAttrib.setAttribute('as', attrib);
					addAttrib.setAttribute('value', newValueStyle[key][attrib]);
					addKey.appendChild(addAttrib);
				}
			}
			var data = mxUtils.getXml(doc)
			// save this xml stylesheet
			repository.writeFile('STYLE', cssList.value, data, null, mxUtils.bind(this, function(message)
			{
				editorUi.showError(mxResources.get('error'), message, mxResources.get('ok'), null);
			}), isNewKey);
			// add or replace new style sheet to graph object
			editorUi.editor.graph.getStylesheet().putCellStyle(key, newValueStyle[key]);
			// refresh the display
			redrawCellswithStyle(key);
			editorUi.editor.graph.refresh();
//				editorUi.refreshCellStyle(editorUi.editor);
		}), null, mxResources.get('save'), null, null, null, mxResources.get('quit'));
		if (dlg && dlg.container)
			editorUi.showDialog(dlg.container, 420, 650, true, true);
	}

//	Add popup menus to sidebar's stencils in custom libraries only	
	Sidebar.prototype.showPopupMenuForCustomLibrary = function(elt, evt, index, imgs, file)
	{
			var offset = mxUtils.getOffset(elt);
		
			this.editorUi.showPopupMenu(mxUtils.bind(this, function(menu, parent)
			{
				// the stencil must have a title
				if (imgs[index].title && imgs[index].title != "")
				{
					//	add a first menu to open dialog window to capture custom properties	
					menu.addItem(mxResources.get('link2Repository'), null, mxUtils.bind(this, function()
					{
						var div = document.createElement('div');
						var dlg = new Link2RepoDialog(ui, index, imgs, file);
						ui.showDialog(dlg.container, 1000, 600, true, true, null, false, false);
						mxEvent.consume(evt);
					}));
					var cells = this.editorUi.stringToCells(Graph.decompress(imgs[index].xml));
					// add a second menu to link shape's appearance to custom properties
					if (cells[0].customproperties)
					{
						var cssClass = cells[0].customproperties.autocompletecssclass;
						if (cssClass)
						{
							menu.addItem(mxResources.get('link2CssClass'), null, mxUtils.bind(this, function()
							{
								var div = document.createElement('div');
								var dlg = new Link2CssClassDialog(ui, cells, index, imgs, file);
								if (dlg && dlg.container)
								{
									ui.showDialog(dlg.container, 1000, 600, true, true, null, false, false);
									mxEvent.consume(evt);
								}
							}));
						}
					}
				} else
				{
					menu.addItem(mxResources.get('noStencilTitle'), null, mxUtils.bind(this, function()
					{
						mxEvent.consume(evt);
					}));
				}
			}), offset.x, offset.y + elt.offsetHeight, evt);
	};

})
