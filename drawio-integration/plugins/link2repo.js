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
								"title" : "Cancel",
								"click" : function() {
									editorUi.hideDialog();
								}
							},
							"ok" : {
								"title" : "Save",
								"click" : function() {
									// transform form object into array
									delete cells[0].customproperties;
									cells[0].customproperties = [];
									var customproperties = this.getValue();
									for(var p in customproperties) {
										cells[0].customproperties[p] = customproperties[p];
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
//									editorUi.sidebar.saveLibraryEntries(file.title, imgs, file, file.mode);
									editorUi.sidebar.saveLibrary(file.title, imgs, file, file.mode);
								}
							}
						}
					},
					"focus" : "autocompletetype"
				},
				'view' : 'bootstrap-edit-horizontal'
			});
		});
	
		this.container = div;
	};

// Display dialog to link an appearance modification to a custom property value
	var Link2CssClassDialog = function (editorUi, cell, file)
	{
		const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat()))); // cartesian product of matrices : see https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
		var dataSource = function(callback)
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
//			console.log('classes', classes);
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
//			console.log('tables', tables);
			let cssclasses = [];
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
					let 	datas = JSON && JSON.parse(xhr.responseText) || $.parseJSON(xhr.responseText);
//					console.log('datas', datas);
					let cssclass = [''];
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
					callback(cssclasses);
				}; 
			}
			xhr.open("POST", window.DRAWIOINTEGRATION_PATH + "/ajax/gettables.php", true);
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.send(JSON.stringify(tables));
		};
		var div = document.createElement('div');
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
		$(document).ready(function() {
			$('#alpaca').alpaca( {
				'schemaSource' : window.DRAWIOINTEGRATION_PATH + '/ext/alpaca/link2cssclass.schema.json',
				'optionsSource' : window.DRAWIOINTEGRATION_PATH + '/ext/alpaca/link2cssclass_' + language.substring(0,2) + '.options.json',
				'dataSource' : cell.customproperties,
				'options' :	{
					"fields" : {
						"cssclass" : {
							"type" : "select",
							"useDataSourceAsEnum" : true,
							"removeDefaultNone" : true,
							"sort" : false,
							"size" : 1,
							"dataSource" : dataSource
						},
                        "fillColor" : {
                            "type" : "color"
                        }
					},
					"form" : {
						"buttons" : {
							"cancel" : {
								"title" : "Cancel",
								"click" : function() {
									editorUi.hideDialog();
								}
							},
							"ok" : {
								"title" : "Save",
								"click" : function() {
								}
							}
						}
					},
					"focus" : "cssclass"
				},
				'view' : 'bootstrap-edit-horizontal'
			});
		});
	

		this.container = div;
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
								var dlg = new Link2CssClassDialog(ui, cells[0], file);
								ui.showDialog(dlg.container, 1000, 600, true, true, null, false, false);
								mxEvent.consume(evt);
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
