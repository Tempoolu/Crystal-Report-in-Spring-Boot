'use strict';
jQuery.sap.require("ui5prompting.utils.UI5Polyfill");
jQuery.sap.require("external.date");
if (typeof (bobj) == 'undefined') {
    bobj = {};
}
if (typeof (bobj.crv) == 'undefined') {
    bobj.crv = {};
}
if (typeof (bobj.crv.params) == 'undefined') {
    bobj.crv.params = {};
}
if (typeof bobj.uniqueId == 'undefined') {
    jQuery.sap.require("crviewer.common");
}
if (typeof bobj.crv.params.Parameter == 'undefined') {
    jQuery.sap.require("crviewer.Parameter");
}
if (typeof bobj.crv.params.ParameterController == 'undefined') {
    jQuery.sap.require("crviewer.ParameterController");
}
jQuery.sap.require("MochiKit.Base");
jQuery.sap.require("MochiKit.Iter");

sap.m.Dialog.extend("ui5prompting.views.PromptDialog", {
    renderer: "sap.m.DialogRenderer",

    constructor: function(id, mSettings) {
        mSettings.title = sap.ui.getCore().getModel("ui5ResourceBundle").getText("PromptingTitleUI5")
        mSettings.draggable = true;
        mSettings.verticalScrolling = false;
        mSettings.horizontalScrollin = false;
        mSettings.resizable = true;
        mSettings.escapeHandler = function (oPromise){
            oPromise.reject(); // Don't close dialog with escape key. 
        };

        sap.m.Dialog.call(this, id, mSettings);
        
        this.addStyleClass("sapUiSizeCompact");
        
        this.attachBeforeOpen(function() {
            this.addContent(sap.ui.view({
                viewName : "ui5prompting.views.Prompting",
                type : sap.ui.core.mvc.ViewType.JS,
                height : "100%",
                viewData : {
                    getPromptData : function() {
                        return mSettings.adaptor.getPromptData(mSettings.viewerName)
                    },
                    getReportState : function() {
                        return mSettings.adaptor.getReportStateInfo(mSettings.viewerName)
                    },
                    getUseSavedData : function() {
                        return mSettings.adaptor.getUseSavedData ? mSettings.adaptor.getUseSavedData(mSettings.viewerName) : false;
                    },
                    getParameterBridge: function() {
                        return mSettings.adaptor.getParameterBridge ? mSettings.adaptor.getParameterBridge() : bobj.crv.params.ParameterBridge;
                    },
                    getDisableEncoding: function() { 
                        // encoding should be made by external callers since not all callers will use values in url, but flash prompting has the encoding behavior
                        // by default ui5 prompting will make encoding, using this property to disable
                        return mSettings.adaptor.getDisableEncoding ? mSettings.adaptor.getDisableEncoding(mSettings.viewerName) : false;
                    },
                    viewerName : typeof mSettings.viewerName == "function" ? mSettings.viewerName() : mSettings.viewerName,
                    viewerType : mSettings.viewerType,
                    rptSrcKey : typeof mSettings.rptSrcKey == "function" ? mSettings.rptSrcKey() : mSettings.rptSrcKey,
                    servletURL : mSettings.servletURL
                }
            }));
            
            var confirmBtn = undefined;
            var rejectBtn = undefined;
            var resetBtn = undefined;
            if (mSettings.adaptor.getUseOKCancelButtons(mSettings.viewerName)) {
                confirmBtn = new sap.m.Button({ text:sap.ui.getCore().getModel("ui5ResourceBundle").getText("OK") });
                if (mSettings.adaptor.getIsDialog(mSettings.viewerName))
                    rejectBtn = new sap.m.Button({ text:sap.ui.getCore().getModel("ui5ResourceBundle").getText("Cancel") });
            } else {
                confirmBtn = new sap.m.Button({ text:sap.ui.getCore().getModel("ui5ResourceBundle").getText("Run") });
                resetBtn = new sap.m.Button({ text:sap.ui.getCore().getModel("ui5ResourceBundle").getText("Reset") });
            }
            
            confirmBtn.attachPress(function() { 
                var contents = this.getContent();
                var closeDialog = true;
                if (contents && contents.length > 0) {
                    closeDialog = contents[0].getController().run();
                }
                
                if (closeDialog)
                    this.close();
            }.bind(this));
            
            this.addButton(confirmBtn);
            
            if (rejectBtn) {
                rejectBtn.attachPress(function() {
                    this.close();
                    if (mSettings.onCancel)
                        mSettings.onCancel();
                }.bind(this));
                this.addButton(rejectBtn);
            }

            if (resetBtn) {
                resetBtn.attachPress(function() {
                    location.reload();
                }.bind(this));
                this.addButton(resetBtn);
            }
        }.bind(this));
        
        this.attachAfterClose(function() {
            this.destroyButtons();
            this.destroyContent();
            if (mSettings.afterClose)
                mSettings.afterClose();
        }.bind(this));
    },
    
    setHeight: function(height) {
        if (height) {
            height += "px";
            this.setContentHeight(height);
        }
    },
    
    setWidth: function (width) {
        if (width) {
            width += "px";
            this.setContentWidth(width);
        }
    }
});