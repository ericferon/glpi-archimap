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
// Adds resource for plugin
//mxResources.add(window.DRAWIOINTEGRATION_PATH + '/resources/archi');

Repository = function(ui, data, title, temp)
{
	DrawioFile.call(this, ui, data);
	
    this.title = title;
	this.mode = (temp) ? null : App.MODE_REPOSITORY;
	this.peer = (this.ui) ? this.ui.repository : null;
};

// Extends DrawioClient
mxUtils.extend(Repository, DrawioFile);

/**
 * Specifies if thumbnails should be enabled. Default is true.
 * LATER: If thumbnails are disabled, make sure to replace the
 * existing thumbnail with the placeholder only once.
 */
Repository.prototype.clientId = (window.location.hostname == 'test.draw.io') ? '23bc97120b9035515661' : '89c9e4624ca416554489';

/**
 * OAuth scope.
 */
Repository.prototype.scope = 'repo';

/**
 * Default extension for new files.
 */
Repository.prototype.extension = '.xml';

/**
 * Base URL for API calls.
 */
Repository.prototype.baseUrl = 'https://localhost';

/**
 * Maximum size of the name field.
 */
Repository.prototype.maxNameSize = 45 /* 45 char*/;

/**
 * Maximum file size of the SQL field.
 */
Repository.prototype.maxFileSize = 16777215 /*MEDIUMTEXT*/;

/**
 * Name for the auth token header.
 */
Repository.prototype.authToken = 'token';

Repository.prototype.getMode = function()
{
	return App.MODE_REPOSITORY;
};

/**
 * Overridden to enable the autosave option in the document properties dialog.
 */
Repository.prototype.isAutosaveOptional = function()
{
	return true;
};

Repository.prototype.getHash = function()
{
	return 'L' + encodeURIComponent(this.getTitle());
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
Repository.prototype.getTitle = function()
{
	return this.title;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
Repository.prototype.isRenamable = function()
{
	return true;
};

Repository.prototype.setData = function(data)
{
	this.data = data;
};

Repository.prototype.save = function(revision, success, error)
{
	this.saveAs(this.getTitle(), success, error);
};

Repository.prototype.saveAs = function(title, success, error)
{
        var data = this.getData();
		this.writeFile("LIBXML", title, data, success, error, false);
};

// Create new library entry in repository
Repository.prototype.insertLibrary = function(filename, data, success, error, folderId)
{
	this.insertFile(filename, data, success, error, folderId, true);
};

Repository.prototype.insertFile = function(filename, data, success, error, folderId, base64Encoded)
{

	var index = filename.lastIndexOf('.');
    if (index >= 0)
    {
        var type = filename.substring(index+1);
        var key = filename.substring(0, index);        
    }
    else
    {
        var type = 'LIBXML';
        var key = filename;
    }

    this.checkInexistence(type, key, true, mxUtils.bind(this, function(found)
	{
		if (!found) // the key does not exist in config table
		{
			{
				if (!base64Encoded)
				{
					data = Base64.encode(data);
				}
				
				this.writeFile(type, key, data, mxUtils.bind(this, function(req)
					{
						try
						{
							success(this.createRepositoryFile(type, key, data, true));
						}
						catch (e)
						{
							error(e);
						}
					}), error, !found)
			}
		}
		else
		{
			error();
		}
	}))
};

// Update existing library entry in repository
Repository.prototype.writeFile = function(type, key, data, success, error, isNew)
{
	if (data.length >= this.maxFileSize)
	{
		error({message: mxResources.get('tooLarge') + ' (' +
			this.ui.formatFileSize(data.length) + ' / 1 MB)'});
	}
	else
	if (key.length >= this.maxNameSize)
	{
		error({message: mxResources.get('nameTooLong') + ' (max ' +
			this.maxNameSize + ' char)'});
	}
	else
	{
		var config = {};
        config[key] =
		{
			type: type,
			value: data
		};
		var req = new mxXmlRequest(
            window.DRAWIOINTEGRATION_PATH + (isNew ? '/ajax/putconfig.php' : '/ajax/postconfig.php'),
            JSON.stringify(config),
            'POST');
		
		this.executeRequest(req, mxUtils.bind(this, function(req)
		{
			if (success)
				success(req);
		}), mxUtils.bind(this, function(err)
		{
			if (error)
				error(err);
		}));
	}
};

Repository.prototype.checkInexistence = function(type, key, mustBeInexistent, fn)
{
	
	this.getLibraries(type, key, mxUtils.bind(this, function(req)
	{
		var libs = (JSON && JSON.parse(req.request.responseText)) || $.parseJSON(req.request.responseText);
        var found = (libs['param'] && libs['param'][key]);
        if (!found)
		{
			this.ui.spinner.stop();
            fn(found);
		}
		else
		if (!mustBeInexistent && found)
		{
			var resume = this.ui.spinner.pause();
			
			this.ui.confirm(mxResources.get('replaceIt', [key]), function()
			{
				resume();
				fn(found);
			}, function()
			{
				resume();
				fn(found);
			});
		}
		else
		if (mustBeInexistent && found)
		{
			this.ui.spinner.stop();
			
			this.ui.showError(mxResources.get('error'), mxResources.get('fileExists'));
        }
	}), mxUtils.bind(this, function(message)
	{
			this.ui.showError(mxResources.get('error'), message, mxResources.get('ok'), null);
	}));
};

Repository.prototype.executeRequest = function(req, success, error, ignoreNotFound)
{
	var doExecute = mxUtils.bind(this, function(failOnAuth)
	{
		var acceptResponse = true;
		
		var timeoutThread = window.setTimeout(mxUtils.bind(this, function()
		{
			acceptResponse = false;
			error({code: App.ERROR_TIMEOUT, retry: fn});
		}), this.ui.timeout);
		
		req.setRequestHeaders = function(request, params)
		{
			request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		};
		
		req.send(mxUtils.bind(this, function()
		{
			window.clearTimeout(timeoutThread);
			
			if (acceptResponse)
			{
				if ((req.getStatus() >= 200 && req.getStatus() <= 299) ||
					(ignoreNotFound && req.getStatus() == 404))
				{
					success(req);
				}
				else if (req.getStatus() === 401)
				{
					if (!failOnAuth)
					{
						this.authenticate(function()
						{
							doExecute(true);
						}, error);
					}
					else
					{
						error({code: req.getStatus(), message: mxResources.get('accessDenied'), retry: mxUtils.bind(this, function()
						{
							this.authenticate(function()
							{
								fn(true);
							}, error);
						})});
					}
				}
				else if (req.getStatus() === 403)
				{
					var tooLarge = false;
					
					try
					{
						var temp = JSON.parse(req.getText());
						
						if (temp != null && temp.errors != null && temp.errors.length > 0)
						{
							tooLarge = temp.errors[0].code == 'too_large';
						}
					}
					catch (e)
					{
						// ignore
					}
					
					error({message: mxResources.get((tooLarge) ? 'drawingTooLarge' : 'forbidden')});
				}
				else if (req.getStatus() === 404)
				{
					error({code: req.getStatus(), message: this.getErrorMessage(req, mxResources.get('fileNotFound'))});
				}
				else if (req.getStatus() === 409)
				{
					// Special case: flag to the caller that there was a conflict
					error({code: req.getStatus(), status: 409});
				}
				else
				{
					error({code: req.getStatus(), message: this.getErrorMessage(req, mxResources.get('error') + ' ' + req.getStatus())});
				}
			}
		}), mxUtils.bind(this, function(err)
		{
			window.clearTimeout(timeoutThread);
				    	
			if (acceptResponse)
			{
				error(err);
			}
		}));
	});

    doExecute(false);
};

Repository.prototype.getErrorMessage = function(req, defaultText)
{
	try
	{
		var temp = JSON.parse(req.getText());
		
		if (temp != null && temp.message != null)
		{
			defaultText = temp.message;
		}
	}
	catch (e)
	{
		// ignore
	}
	
	return defaultText;
};

Repository.prototype.getLibraries = function(type, key, success, error)
{
	let tables = {};
    tables['param'] = {'table' : 'glpi_plugin_archimap_configs', 
                    'column' : 'key, value', 
                    'type' : "LIBXML"};
//                    'where' : 'type = "LIBXML"' + (key ? ' and `key` = "'+key+'"' : '')};
	if (key)
		tables['param']['key'] = key;
	var req = new mxXmlRequest(window.DRAWIOINTEGRATION_PATH + '/ajax/getconfig.php', JSON.stringify(tables), 'POST');
		
	this.executeRequest(req, mxUtils.bind(this, function(req)
	{
		success(req);
	}), mxUtils.bind(this, function(err)
	{
		error(err);
	}));
}

Repository.prototype.getStyles = function(type, key, success, error)
{
	let tables = {};
    tables['param'] = {'table' : 'glpi_plugin_archimap_configs', 
                    'column' : 'key, value', 
                    'type' : "STYLE"};
//                    'where' : 'type = "STYLE"' + (key ? ' and `key` LIKE "'+key+'"' : '')};
	if (key)
		tables['param']['key'] = key;
	var req = new mxXmlRequest(window.DRAWIOINTEGRATION_PATH + '/ajax/getconfig.php', JSON.stringify(tables), 'POST');
		
	this.executeRequest(req, mxUtils.bind(this, function(req)
	{
		success(req);
	}), mxUtils.bind(this, function(err)
	{
		error(err);
	}));
}

Repository.prototype.createRepositoryFile = function(type, key, data, asLibrary)
{
	asLibrary = (asLibrary != null) ? asLibrary : false;

    var meta = {'type' : type, 
		'title': key,
        'id' : key};
	var content = data;
	
	return new Repository(this.ui, content, key);
};

Repository.prototype.pickLibrary = function(mode)
{
	this.pickFile();
};

Repository.prototype.pickFile = function(fn)
{
	fn = (fn != null) ? fn : mxUtils.bind(this, function(filename, data)
	{
        var blob = new Blob([data], {type : 'text/xml'});
        var reader = new FileReader();
        reader.onload = mxUtils.bind(this, function(e)
		{
			try
			{
//				this.ui.loadLibrary(new LocalLibrary(this.ui, e.target.result, filename));
				this.ui.loadLibrary(new Repository(this.ui, e.target.result, filename));
			}
			catch (e)
			{
				this.ui.handleError(e, mxResources.get('errorLoadingFile'));
			}
		});
	
		reader.readAsText(blob);
	});
	
	this.showRepositoryDialog(true, fn);
};

// Display window for selecting a library from repository
Repository.prototype.showRepositoryDialog = function(showFiles, fn)
{
	var content = document.createElement('div');
	content.style.whiteSpace = 'nowrap';
	content.style.overflow = 'hidden';
//	content.style.height = '304px';

	var hd = document.createElement('h3');
	mxUtils.write(hd, mxResources.get((showFiles) ? 'selectFile' : 'selectFolder'));
	hd.style.cssText = 'width:100%;text-align:center;margin-top:0px;margin-bottom:12px';
	content.appendChild(hd);

	var listItem = document.createElement('select');
	listItem.style.textOverflow = 'ellipsis';
	listItem.style.boxSizing = 'border-box';
	listItem.style.overflow = 'hidden';
	listItem.style.padding = '4px';
	listItem.style.width = '100%';
	content.appendChild(listItem);
	
    this.getLibraries("LIBXML", null, mxUtils.bind(this, function(req)
	{
		var libs = JSON && JSON.parse(req.request.responseText) || $.parseJSON(req.request.responseText);
        var arrayLength = libs['param'].length;
        for (var i = 0 in libs['param'])
        {
            let option = document.createElement('option');
            mxUtils.write(option, libs['param'][i].key);
            listItem.appendChild(option);
        }
        var decodeHTML = function (html) {
            var txt = document.createElement('textarea');
            txt.innerHTML = html;
            return txt.value;
        };
        var dlg = new CustomDialog(this.ui, content, mxUtils.bind(this, function()
        {
            fn(listItem.value, decodeHTML(libs['param'][listItem.value].value));
        }));
        this.ui.showDialog(dlg.container, 420, 120, true, true);
	}), mxUtils.bind(this, function(message)
	{
			this.ui.showError(mxResources.get('error'), message, mxResources.get('ok'), null);
	}));

}
