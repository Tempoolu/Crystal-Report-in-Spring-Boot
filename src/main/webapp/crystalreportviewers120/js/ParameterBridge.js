/* Copyright (c) Business Objects 2006. All rights reserved. */

if (typeof (bobj) == 'undefined') {
    bobj = {};
}

if (typeof (bobj.crv) == 'undefined') {
    bobj.crv = {};
}

if (typeof (bobj.crv.params) == 'undefined') {
    bobj.crv.params = {};
}

/*
================================================================================
ParameterBridge

Base functionality for prompting UI bridge
================================================================================
*/
bobj.crv.params.ParameterBridge = {
    _domObjID : [],
    _domObj : [],
    _cb : [],
    _isRTL : false,
    /*  You can think of this as a flag to tell us "I want to see the viewer.  It is used by parallel loading */
    _isInitializing : undefined,
    
    // TODO: Ryan - clean this up when the CAF actions are also cleaned up
    _promptData : [],
    
    _viewerType : "",

    setPromptData : function(id, d) {
        this._promptData[id] = d;
    },
    
    setMasterCallBack : function(viewerName, callBack) {
        this._cb[viewerName] = callBack;
    },
    
    getDomObj : function(viewerName) {
        if (this._domObj[viewerName]) {
         return this._domObj[viewerName];
        } else {
         var obj = document.getElementById(this._domObjID[viewerName]);
         this._domObj[viewerName] = obj;
         return obj;
        }
    },
    
    clearDomObj : function(viewerName) {
        if (this._domObj[viewerName]) {
         this._domObjID[viewerName] = null;
         this._domObj[viewerName] = null;
        }
    },
    
    getInstallHTML: function() {
        return L_bobj_crv_FlashRequired.replace("{0}", "<br><a href='http://www.adobe.com/go/getflash/' target='_blank'>") + "</a>";
    },
    
    checkFlashPlayer: function() {
        return swfobject.hasFlashPlayerVersion("11.0.0");
    },
    
    /**
    * Creates the SWF/UI5 object and replaces the div specified with the object.
    */
    createDomObj: function(viewerName, divID, servletURL, showMinUI, locale, rptSrcKey, isRTL, isInitializing, promptingType, viewerType, promptType) {
        this._isRTL = isRTL;
        this._isInitializing = isInitializing;
        var cb = this._cb[viewerName];
        if (!cb) {
            return;
        }
        
        if (typeof (promptingType) == 'undefined') {
            promptingType = 'flex';  // Some callers (Flex users) don't specify all the arguments, so leave them that way.
        }
        
        var domId = cb.getDomId();
        var useSavedData = cb.getUseSavedData ? cb.getUseSavedData(viewerName) : false;
        var useOKCancelButtons = cb.getUseOKCancelButtons ? cb.getUseOKCancelButtons(viewerName) : false;
        var isDialog = cb.getIsDialog ? cb.getIsDialog (viewerName) : false;
        var allowFullScreen = cb.getAllowFullScreen ? cb.getAllowFullScreen (viewerName) : false;
        var enforceRequiredPrompt = cb.getEnforceRequiredPrompt ? cb.getEnforceRequiredPrompt () : true;
        var shouldAutoResize = cb.getShouldAutoResize ? cb.getShouldAutoResize(viewerName) : false;
        var isIPIONT = viewerType == "dotnetcaf";
        
        // Use hardcoded constants, since the CAF case does not have access to bobj.crv.Viewer.PromptingTypes.
        if (promptingType == 'flex') {
    
            if (cb.logger) {
                cb.logger('Create the SWF');
            }
       
            if (this.checkFlashPlayer()) {
            
                var swfBaseURL = cb.getSWFBaseURL();
                var swfPath = swfBaseURL + "prompting.swf";
                
                var flashvars = {
                    "eventTarget":viewerName,
                    "locale":locale,
                    "showMinUI":showMinUI,
                    "baseURL":swfBaseURL,
                    "servletURL":servletURL,//The SWF will use javascript to handle all async requests if this is null or empty
                    "reportSourceKey":rptSrcKey,
                    "useSavedData":useSavedData,
                    "useOKCancelButtons":useOKCancelButtons,
                    "isDialog":isDialog,
                    "allowFullScreen":allowFullScreen,
                    "enforceRequiredPrompt":enforceRequiredPrompt,
                    "shouldAutoResize":shouldAutoResize,
                    "isRTL":isRTL
                };
            
                // Important: Do not specify play=true as one of the params. If this
                // is set to true we could end up in an infinite loop reloading
                // the swf when viewing using the embedded browser in eclipse.
                var params = {
                    menu:"false",
                    wmode:"window",
                    AllowScriptAccess:"always"
                };
                
                var attributes = {
                    id:domId,
                    name:domId,
                    style:'z-index:'+cb.getZIndex()
                };
            
                if (cb.processingDelayedShow) {
                    cb.processingDelayedShow('hidden', divID);
                }
            
                var h = cb.getObjHeight ? cb.getObjHeight(viewerName) + "" : "600"; 
                var w = cb.getObjWidth ? cb.getObjWidth(viewerName) + "" : "800"; 
                
                swfobject.embedSWF(swfPath, divID, w, h, "11.0.0", "", flashvars, params, attributes);
                this._domObjID[viewerName] = domId;
            
                if (cb.processingDelayedShow) {
                    cb.processingDelayedShow();
                }
                //We need to resize here for performance reasons.  Waiting until the init() to do a resize has some very bad performance problems.         
                this.resize(viewerName, 6, 6, false);
                //Need to move the top left as the progress dialog will block the rendering of the flash component making it slower.
                this.move(viewerName, 1, 1);
            
            
                } else {
                    document.getElementById(divID).innerHTML = "<p>" + cb.getInstallHTML() + "</p>";
                }
                
        }
        else if (promptingType == 'ui5') {  
            //For UI5 prompting in .net viewer
            this._viewerType = viewerType;
        
            sap.ui.getCore().attachInit(function() {
                var loadPrompt = function() {
                    if (cb.logger) {
                        cb.logger('Create UI5 container');
                    }
                    
                    var oI18nModel = new sap.ui.model.resource.ResourceModel({
                        bundleUrl: bobj.crvUri("../ui5prompting/resources/prompting.properties"), bundleLocale:locale
                    });
                    var oResourceBundle = oI18nModel.getResourceBundle();
                    sap.ui.getCore().setModel(oResourceBundle, "ui5ResourceBundle");
                    sap.ui.getCore().getConfiguration().setRTL(this._isRTL);
                    sap.ui.getCore().getConfiguration().setLanguage(locale);
    
                    jQuery.sap.registerModulePath("ui5prompting", bobj.crvUri("../ui5prompting"));
                    
                    //Require this object to adjust modal layering
                    jQuery.sap.require("sap.ui.core.Popup");
                    jQuery.sap.require("ui5prompting.utils.UI5Polyfill");
                    jQuery.sap.require("ui5prompting.views.PromptDialog");
                    jQuery.sap.require("ui5prompting.views.LogonDialog");
    
                    //Set modal layering
                    sap.ui.core.Popup.setInitialZIndex(cb.getZIndex());
    
                    if (cb.processingDelayedShow) {
                        cb.processingDelayedShow('hidden', divID);
                    }
                    
                    var dialog;
                    if(promptType == 'logon'){
                        dialog = new ui5prompting.views.LogonDialog(domId, {
                            adaptor: cb,
                            viewerName: viewerName,
                            viewerType: viewerType,
                            rptSrcKey: rptSrcKey,
                            servletURL: servletURL,
                            onCommit: function(viewerName, logonData) {this.logon(viewerName, logonData)}.bind(this),
                            afterClose: function() {
                                if (!isIPIONT) {
                                    this.closeDialog(viewerName);
                                }
                            }.bind(this),
                            afterOpen: function() {
                                var h = cb.getObjHeight ? cb.getObjHeight(viewerName) + "" : "600"; 
                                var w = cb.getObjWidth ? cb.getScreenWidth(viewerName) + "" : "800"; 
                                setTimeout(function() {this.resize(viewerName, h, w, true);}.bind(this), 200);
                                // we should support non-dialog mode in the future, current workaround for IPIONT
                                if (!isDialog && isIPIONT) {
                                    dialog.parentNode.parentNode.style.height = h;
                                    dialog.parentNode.parentNode.style.width = w;
                                    dialog.parentNode.parentNode.style.position = "relative";
                                }
                            }.bind(this)
                        })
                    }else{
                        dialog = new ui5prompting.views.PromptDialog(domId, {
                            adaptor: cb,
                            viewerName: viewerName,
                            viewerType: viewerType,
                            rptSrcKey: rptSrcKey,
                            servletURL: servletURL,
                            afterClose: function() {
                                if (!isIPIONT) {
                                    this.closeDialog(viewerName);
                                }
                            }.bind(this),
                            afterOpen: function() {
                                var h = cb.getObjHeight ? cb.getObjHeight(viewerName) + "" : "600"; 
                                var w = cb.getObjWidth ? cb.getScreenWidth(viewerName) + "" : "800"; 
                                setTimeout(function() {this.resize(viewerName, h, w, true);}.bind(this), 200);
                                // we should support non-dialog mode in the future, current workaround for IPIONT
                                if (!isDialog && isIPIONT) {
                                    dialog.parentNode.parentNode.style.height = h;
                                    dialog.parentNode.parentNode.style.width = w;
                                    dialog.parentNode.parentNode.style.position = "relative";
                                }
                            }.bind(this)
                        })
                    }
                    dialog.parentNode = document.getElementById(divID);
                    
                    this._domObjID[viewerName] = domId;
                    this._domObj[viewerName] = dialog;
                    
                    if (cb.processingDelayedShow) {
                        cb.processingDelayedShow();
                    }
    
                    dialog.open(); 

                }
                
                if (bobj.crv.config.resources) {
                    bobj.loadJSResourceAndExecCallBack(bobj.crv.config.resources.ParameterControllerAndDeps, loadPrompt.bind(this));
                } else {
                    jQuery.sap.registerModulePath("external", bobj.crvUri("../external"));
                    jQuery.sap.registerModulePath("crviewer", bobj.crvUri("../crviewer"));
                    jQuery.sap.registerModulePath("MochiKit", bobj.crvUri("../MochiKit"));
                    jQuery.sap.require("external.date");
                    jQuery.sap.require("crviewer.ParameterController");
                    jQuery.sap.require("crviewer.Parameter");
                    jQuery.sap.require("MochiKit.Iter");
                    
                    loadPrompt.apply(this);
                }
            }.bind(this));
        }
    },
    
    initViewer : function(viewerName, promptingType) {
        this._isInitializing = false;
        this.init(viewerName, promptingType);
    },
    
    /**
     * This function will initialize the data in the flex swf with the
     * current state of the parameter ui. The Flex swf will call back to 
     * this method when it has first been created and all external interface
     * connections have been setup. If the swf has already been created this will 
     * be called when showing the parameter UI.
     */
    
   init: function(viewerName, promptingType) {
        if (!viewerName) {
         return;
        }
        
        var cb = this._cb[viewerName];
        var obj = this.getDomObj(viewerName);
        if (!obj || !cb) {
         return;
        }
        
        // Use a hardcoded constant, since the CAF case does not have access to bobj.crv.Viewer.PromptingTypes.
        if (promptingType == 'flex') {
            
            var swf = obj;
                
            if (cb.logger) {
                cb.logger('Init the SWF');
            }
            
            if (swf.setIsInitializing) {
                swf.setIsInitializing(this._isInitializing);
            }
            
            
            if(swf.setShowMinUI && cb.getShowMinUI) {
                swf.setShowMinUI(cb.getShowMinUI(viewerName));
            }
            
            if(swf.setUseSavedData && cb.getUseSavedData) {
                swf.setUseSavedData(cb.getUseSavedData(viewerName));
            }
            
            if(swf.setUseOKCancelButtons && cb.getUseOKCancelButtons) {
               swf.setUseOKCancelButtons(cb.getUseOKCancelButtons(viewerName));
            }
           
            if(swf.setAllowFullScreen && cb.getAllowFullScreen) {
                swf.setAllowFullScreen(cb.getAllowFullScreen(viewerName));
            }
        
            if (swf.setReportStateInfo && cb.getReportStateInfo) {
                swf.setReportStateInfo(cb.getReportStateInfo(viewerName));
            }
           
            if (swf.setPromptData) {
                if (cb.getPromptData && cb.getPromptData(viewerName)) {
                    swf.setPromptData(cb.getPromptData(viewerName));
                } else {
                    swf.setPromptData(this._promptData[viewerName]);
                }
            }
           
            if (cb.getShouldAutoResize && cb.getShouldAutoResize(viewerName)) {
                if (this._isInitializing == false) {
                    //If we are not initializing, this should already have been taken care of in the createSWF command 
                    //this.resize(viewerName, 6, 6, false);
                    //this.move(viewerName, 1, 1);
                    
                    // IE doesn't like the 2nd time resizing and will stay at 6 pixels (IE 11.0.48 and Flash player 27.0.0.187)
                    // So we only need to make the swf/div visible by calling setVisibility (which resize is calling at the end of the function)
                    cb.setVisibility(viewerName);
                }
        
            }
            else if (cb.getObjHeight && cb.getObjWidth) {
                this.resize(viewerName, cb.getObjHeight(viewerName), cb.getObjWidth(viewerName), true);
            }
        }
        else if (promptingType == bobj.crv.Viewer.PromptingTypes.UI5) {
            sap.ui.getCore().attachInit( function () {
                obj.open();
            }.bind(this));
        }
    },
    /**
    * Callback for closing the current dialog window.
    */ 
    closeDialog : function (viewerName){
        var cb = this._cb[viewerName];
        if (cb && cb.closeDialog) {
            cb.closeDialog(viewerName);
        }
    },
    
    /**
    * Callback for adjusting the size of the swf to fit the number of
    * prompts being displayed.
    */   
    resize : function(viewerName, height, width, shouldCenter, fitToScreen) {
        var domObj = this.getDomObj(viewerName);
        var cb = this._cb[viewerName];
        if (domObj && cb) {
            cb.logger('Resizing the SWF h:' + height + ' w:' + width);
        
            if (cb.getScreenHeight && cb.getScreenWidth)
            {
                var screenHeight = cb.getScreenHeight(viewerName);
                var screenWidth = cb.getScreenWidth(viewerName);
                var p = MochiKit.Style.getElementPosition(domObj.parentNode);
                
                // Do not allow resizing beyond the screen size
                if (width > screenWidth) {
                    width = screenWidth;
                }
                if (!shouldCenter && !fitToScreen) { // resizing by dragging the corner?
                    if (this._isRTL) {
                        // Since element is positioned using left property width change affects the right edge of the element
                        // In RTL mode in order to visually show that the element is positioned on right we need to move the 
                        // the element on the left using the change in width value. 
                        var widthInc = width - domObj.parentNode.offsetWidth;
                        var x = p.x - widthInc;
                        var vX = 0;
                        // If viewer is not own the page calculate the left offset of the viewer
                        if (getLayer) {
                            var l = getLayer(viewerName);
                            if (l) vX = l.offsetLeft;
                        }
                        // If resizing trying to exceed the left edge limit the resize and stay as it is
                        if (x < vX) {
                            width += (x - vX);
                            x = vX;
                        }
                        // Only update the left property is necessary
                        if (x != p.x) {
                            domObj.parentNode.style.left = x + 'px';
                        }
                    }
                    else {
                        if ((p.x >= 0) && ((p.x + width) >= screenWidth)) {
                            width = screenWidth - p.x;
                        }
                    }
                }
                
                if ((p.y >= 0) && ((p.y + height) >= screenHeight) && !shouldCenter) {
                    height = screenHeight - p.y;
                }
                else if (height > screenHeight) {
                    height = screenHeight;
                }
                if (height < 0)
                {
                    height = 1;
                }
            }
            if (shouldCenter) {
                this.move(viewerName, ((screenWidth - width) / 2), ((screenHeight - height) / 2));
            }          
            
            if(domObj.setWidth && domObj.setHeight) {
                domObj.setWidth(width);
                domObj.setHeight(height);
            }
            
            if (domObj.style) {
                domObj.style.width = width + 'px';
                domObj.style.height = height + 'px';
            }
                              
            cb.setVisibility(viewerName);
            
            domObj._isMaximized = false;
            
            if (cb.resize) {
                cb.resize();
            }
        }
    },
    
    fitScreen : function (viewerName){
        var domObj = this.getDomObj(viewerName);
        var cb = this._cb[viewerName];
        if (domObj && cb && cb.getScreenHeight && cb.getScreenWidth && domObj.setHeight && domObj.setWidth) {
            cb.logger('Fitting SWF to the screen');
            var h = cb.getScreenHeight(viewerName);
            var w = cb.getScreenWidth(viewerName);
            
            // Resize the html object
            // We must call move before resize so that we can calculate the width/height appropriately when resizing
            this.move(viewerName, 0, 0);
            this.resize(viewerName, h, w, false, true);
            
            domObj._isMaximized = true;
        }
    },
    
    startDrag : function(viewerName) {
        var cb = this._cb[viewerName];
        if (cb && cb.startDrag) {
            cb.startDrag(viewerName);
        }
    },
    
    stopDrag : function(viewerName) {
        var cb = this._cb[viewerName];
        if (cb && cb.stopDrag) {
            cb.stopDrag(viewerName);
        }
    },
    
    drag : function(viewerName, x, y) {
        var cb = this._cb[viewerName];
        if (cb && cb.drag) {
            cb.drag(viewerName, x, y);
        }
    },
    
    move : function(viewerName, x, y) {
        var cb = this._cb[viewerName];
        if (cb && cb.move) {
            cb.move(viewerName, x, y);
        }
    },
    
    setParamValues : function(viewerName, paramData) {
        var cb = this._cb[viewerName];
        if (cb && cb.setParamValues) {
            cb.setParamValues(viewerName, paramData);
        }
    },
    
    logon : function(viewerName, logonData) {
        var cb = this._cb[viewerName];
        if (cb && cb.logon) {
            cb.logon(viewerName, logonData);
        }
    },
    
    setReportStateInfo : function(viewerName, rsInfo) {
        var cb = this._cb[viewerName];
        if (cb && cb.setReportStateInfo) {
            cb.setReportStateInfo(viewerName, rsInfo);
        }
    },
    
    sendAsyncRequest : function(viewerName, args, dotnetCallBack) {
        var cb = this._cb[viewerName];

        if ("dotnet" == this._viewerType) {
            cb.dotnetCallBack = dotnetCallBack;
        }

        if (cb && cb.sendAsyncRequest) {
            cb.sendAsyncRequest(viewerName, args);
        }
    },
    
    handleAsyncResponse : function(viewerName, args) {
        if ("dotnet" == this._viewerType) {
            var cb = this._cb[viewerName];
            cb.dotnetCallBack(false, args.result);
        }
        else {
            var domObj = this.getDomObj(viewerName);
            if (domObj && domObj.handleAsyncResponse){
                domObj.handleAsyncResponse(args);
            }
        }
    },
    
    readyToShow: function(viewerName) {
        var cb = this._cb[viewerName];
        if (cb && cb.readyToShow) {
            cb.readyToShow(viewerName);
        }
        this._isInitializing = false;
    }
};
