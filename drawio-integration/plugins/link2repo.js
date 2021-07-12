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
// Add a mode "repository" (see drawio/src/main/webapp/js/diagramly/App.js)
	App.MODE_REPOSITORY = 'repository';
// Adds resource for plugin
	mxResources.add(window.DRAWIOINTEGRATION_PATH + '/resources/archi');
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
			let columns = cell.customproperties.autocompletejointcolumns.split(',');
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

		var hd = document.createElement('h3');
		let title = img.title || cell.customproperties['stencil'];
		mxUtils.write(hd, title);
		hd.style.cssText = 'width:100%;text-align:center;margin-top:0px;margin-bottom:6px';
		content.appendChild(hd);
		var shape = document.createElement('a');
		shape.id = title;
		shape.className = 'geItem';
		shape.style.overflow = 'hidden';
		var border = (mxClient.IS_QUIRKS) ? 8 + 2 * 6 : 2 * 6;
		shape.style.width = (shapeWidth + border) + 'px';
		shape.style.height = (shapeHeight + border) + 'px';
		shape.style.padding = '6px';
	
		if (mxClient.IS_IE6)
		{
			shape.style.border = 'none';
		}
	
		// Blocks default click action
		mxEvent.addListener(shape, 'click', function(evt)
		{
			mxEvent.consume(evt);
		});

		var thumb = editorUi.sidebar.createThumb(cells, shapeWidth, shapeHeight, shape, img.title || '', false, false, shapeWidth, shapeHeight);
		shape.style.display = 'block';
		shape.style.margin = 'auto';
		content.appendChild(shape);

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
			canvas = editorUi.editor.graph.view.canvas;
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
			panels.list = [];
			panels.list.push(new DiagramStylePanel(this, ui, stylePanel))
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
			var fillColorApply = null;
			var gradientColorApply = null;
			var strokeColorApply = null;
			var fontColorApply = null;
			
			var defaultFillColor = shapeStyles[mxConstants.STYLE_FILLCOLOR] || '#ffffff';
			var defaultGradientColor = shapeStyles[mxConstants.STYLE_GRADIENTCOLOR] || '#ffffff';
			var defaultStrokeColor = shapeStyles[mxConstants.STYLE_STROKECOLOR] || '#000000';
			
			var currentFillColor = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] : defaultFillColor;
			var currentGradientColor = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR] : defaultGradientColor;
			var currentStrokeColor = selectedValueStyle && selectedValueStyle[selectedValue] && selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR] ? 
									selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR] : defaultStrokeColor;	
			var currentFontColor = '#000000';
			
			var updateShapeFillcolor = function(color)
			{
				var svg = shape.querySelectorAll('rect[fill], path[fill], circle[fill], ellipse[fill], polygon[fill], line[fill], polyline[fill]');
				var svgLen = svg.length;
				for (let i = 0; i < svgLen; i++)
				{
					svg[i].setAttribute('fill', color);
				}
			}
		
			var updateShapeGradientcolor = function(color, direction)
			{
				var svg = shape.querySelectorAll('rect[fill], path[fill], circle[fill], ellipse[fill], polygon[fill], line[fill], polyline[fill]');
				console.log('updateShapeGradientcolor', thumb, shape, svg, canvas);
				var svgLen = svg.length;
				var base = mxSvgCanvas2D.prototype.getBaseUrl().replace(/([\(\)])/g, '\\$1');
//				var id = mxSvgCanvas2D.prototype.createSvgGradient(selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] || defaultFillColor, color,
//						1, 1, direction);
//				console.log('updateShapeGradientcolor',id);
			
				for (let i = 0; i < svgLen; i++)
				{
					if (!mxClient.IS_CHROMEAPP && !mxClient.IS_IE && !mxClient.IS_IE11 &&
						!mxClient.IS_EDGE /*&& this.root.ownerDocument == document*/)
					{
						// Workaround for potential base tag and brackets must be escaped
//						svg[i].setAttribute('fill', 'url(' + base + '#' + id + ')');
					}
					else
					{
//						svg[i].setAttribute('fill', 'url(#' + id + ')');
					}
				}
			}
		
			var updateShapeStrokecolor = function(color)
			{
				var svg = shape.querySelectorAll('rect[stroke], path[stroke], circle[stroke], ellipse[stroke], polygon[stroke], line[stroke], polyline[stroke]');
				var svgLen = svg.length;
				for (let i = 0; i < svgLen; i++)
				{
					svg[i].setAttribute('stroke', color);
				}
			}
		
			var format = new Format(editorUi, content);
			var panel = new BaseFormatPanel(format, editorUi, content);
			var fillPanel = panel.createColorOption(mxResources.get('fillColor'), function()
			{	// getColorFn
//				newValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] = currentFillColor;
				return currentFillColor;
			}, function(color)
			{	// setColorFn
				updateShapeFillcolor((color != mxConstants.NONE) ? color : currentFillColor);
				document.execCommand('backcolor', false, (color != mxConstants.NONE) ? color : currentFillColor);
			}, /* defaultColor */ '#ffffff',
			{	// listener
				install: function(apply) { fillColorApply = apply; },
				destroy: function() { fillColorApply = null; }
			}, function(color)
			{	// callbackFn
				newValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR] = (color != mxConstants.NONE) ? color : null;
				updateShapeFillcolor(color);
			}, /* hideCheckbox */ false);
			fillPanel.style.height = '30px';
			fillPanel.style.boxSizing = 'border-box';
			fillPanel.style.overflow = 'hidden';
			fillPanel.style.padding = '4px';
			fillPanel.style.width = '100%';
			panels.appendChild(fillPanel);
			// uncheck box if the fill collor is not changed
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR])
			{
				var cb = fillPanel.querySelectorAll('input[type="checkbox"]');
				if (cb[0].checked)
				{
					cb[0].click();
				}
			}
			else
			{
				updateShapeFillcolor(selectedValueStyle[selectedValue][mxConstants.STYLE_FILLCOLOR]);
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
//				newValueStyle[selectedValue].fillColor = currentGradientColor;
				return currentGradientColor;
			}, function(color)
			{	// setColorFn
				updateShapeGradientcolor((color != mxConstants.NONE) ? color : currentGradientColor, gradientSelect.value);
//				editorUi.editor.graph.updateCellStyles(mxConstants.STYLE_GRADIENTCOLOR, (color != mxConstants.NONE) ? color : currentGradientColor, shape);
				document.execCommand('gradientcolor', false, (color != mxConstants.NONE) ? color : currentGradientColor);
			}, /* defaultColor */ '#ffffff',
			{	// listener
				install: function(apply) { gradientColorApply = apply; },
				destroy: function() { gradientColorApply = null; editorUi.editor.graph.getModel().removeListener(listener);}
			}, function(color)
			{	// callbackFn
				newValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR] = (color != mxConstants.NONE) ? color : null;
//				updateShapeGradientcolor(color, gradientSelect.value);
//				editorUi.editor.graph.updateCellStyles(mxConstants.STYLE_GRADIENTCOLOR, color, shape);
				if (color == null || color == mxConstants.NONE)
				{
					gradientSelect.style.display = 'none';
				}
				else
				{
					gradientSelect.style.display = '';
				}
			}, /* hideCheckbox */ false);
			
			var listener = mxUtils.bind(this, function()
			{
				ss = panel.format.getSelectionState();
				var value = mxUtils.getValue(selectedValueStyle[selectedValue], mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_SOUTH);
//				var fillStyle = mxUtils.getValue(ss.style, 'fillStyle', 'auto');
		
				// Handles empty string which is not allowed as a value
				if (value == '')
				{
					value = mxConstants.DIRECTION_SOUTH;
				}
		
				gradientSelect.value = value;
//				fillStyleSelect.value = fillStyle;
//				container.style.display = (ss.fill) ? '' : 'none';
		
/*				var fillColor = mxUtils.getValue(ss.style, mxConstants.STYLE_FILLCOLOR, null);
			
				if (!ss.fill || ss.containsImage || fillColor == null || fillColor == mxConstants.NONE || ss.style.shape == 'filledEdge')
				{
//					fillStyleSelect.style.display = 'none';
					gradientPanel.style.display = 'none';
				}
				else
				{
//					fillStyleSelect.style.display = (ss.style.sketch == '1') ? '' : 'none';
					gradientPanel.style.display = (ss.style.sketch != '1' || fillStyle == 'solid' || fillStyle == 'auto') ? '' : 'none';
				}
*/			});
	
			editorUi.editor.graph.getModel().addListener(mxEvent.CHANGE, listener);
//			gradientPanel.listeners.push({destroy: function() { editorUi.editor.graph.getModel().removeListener(listener); }});
			listener();

			mxEvent.addListener(gradientSelect, 'change', function(evt)
			{
//				editorUi.editor.graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, gradientSelect.value, editorUi.editor.graph.getSelectionCells());
				updateShapeGradientcolor(selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR], selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENT_DIRECTION]);
				mxEvent.consume(evt);
			});
	
/*			mxEvent.addListener(fillStyleSelect, 'change', function(evt)
			{
//				editorUi.editor.graph.setCellStyles('fillStyle', fillStyleSelect.value, editorUi.editor.graph.getSelectionCells());
				updateShapeGradientcolor(selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR], selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENT_DIRECTION]);
				mxEvent.consume(evt);
			});
*/	
			gradientPanel.style.height = '30px';
			gradientPanel.style.boxSizing = 'border-box';
			gradientPanel.style.overflow = 'hidden';
			gradientPanel.style.padding = '4px';
			gradientPanel.style.width = '100%';
			gradientPanel.appendChild(gradientSelect);
			panels.appendChild(gradientPanel);
			// uncheck box if the gradient collor is not changed
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR])
			{
				var cb = gradientPanel.querySelectorAll('input[type="checkbox"]');
				if (cb[0].checked)
				{
					cb[0].click();
					gradientSelect.style.display = 'none';
				}
			}
			else
			{
				updateShapeGradientcolor(selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENTCOLOR], selectedValueStyle[selectedValue][mxConstants.STYLE_GRADIENT_DIRECTION]);
			}

			var opacityPanel = panels.createRelativeOption(mxResources.get('opacity'), mxConstants.STYLE_OPACITY, 41);
			opacityPanel.style.paddingTop = '8px';
			opacityPanel.style.paddingBottom = '8px';
			panels.appendChild(opacityPanel);

		var colorPanel = document.createElement('div');
	
			var lineColor = panel.createColorOption(mxResources.get('line'), function()
			{	// getColorFn
//				newValueStyle[selectedValue].fillColor = currentStrokeColor;
				return currentStrokeColor;
			}, function(color)
			{	// setColorFn
				updateShapeStrokecolor((color != mxConstants.NONE) ? color : currentStrokeColor);
//				editorUi.editor.graph.updateCellStyles(mxConstants.STYLE_STROKECOLOR, (color != mxConstants.NONE) ? color : currentStrokeColor, shape);
				document.execCommand('stroke', false, (color != mxConstants.NONE) ? color : currentStrokeColor);
			}, /* defaultColor */ '#000000',
			{	// listener
				install: function(apply) { strokeColorApply = apply; },
				destroy: function() { strokeColorApply = null; }
			}, function(color)
			{	// callbackFn
				newValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR] = (color != mxConstants.NONE) ? color : null;
				updateShapeStrokecolor(color);
			}, /* hideCheckbox */ false);

			lineColor.style.height = '30px';
			lineColor.style.boxSizing = 'border-box';
			lineColor.style.overflow = 'hidden';
			lineColor.style.padding = '4px';
			lineColor.style.width = '100%';
			colorPanel.appendChild(lineColor);
			panels.appendChild(colorPanel);
			if (!selectedValueStyle || !selectedValueStyle[selectedValue] || !selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR])
			{
				var cb = lineColor.querySelectorAll('input[type="checkbox"]');
				if (cb[0].checked)
				{
					cb[0].click();
				}
			}
			else
			{
				updateShapeStrokecolor(selectedValueStyle[selectedValue][mxConstants.STYLE_STROKECOLOR]);
			}

		}


	// fill in a structure with the style information
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
				if (newValueStyle[key].hasOwnProperty(attrib) && attrib != 'shape' && newValueStyle[key][attrib])
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
				this.ui.showError(mxResources.get('error'), message, mxResources.get('ok'), null);
			}), isNewKey);
			// refresh the display
			editorUi.refreshCellStyle(editorUi.editor);
        }), null, mxResources.get('save'), null, null, null, mxResources.get('quit'));
		if (dlg && dlg.container)
			editorUi.showDialog(dlg.container, 420, 820, true, true);
		
	};

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
