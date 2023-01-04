'use strict'
jQuery.sap.require("ui5prompting.utils.HTTPRequestHandler");
jQuery.sap.require("ui5prompting.utils.DependencyManager");
jQuery.sap.require("ui5prompting.utils.ScrollSyncManager");
jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");
jQuery.sap.require("ui5prompting.utils.Formatter");

sap.ui.controller("ui5prompting.controllers.Prompting", {

    bridge: undefined,
    oPromptData: undefined,
    viewerName: undefined,
    aPromptUnitValues: undefined,
    oPromptUnitModelMap: undefined,
    oRequestHandler: undefined,
    oDependencyManager: undefined,
    oScrollManager: undefined,

    setParameterBridge: function (oBridge) {
        this.bridge = oBridge;
    },

    onExit: function () {
        this.oDependencyManager.clear();
        this.oScrollManager.clear();
    },

    getDependencyManager: function() {
        return this.oDependencyManager;
    },

    createViewModel: function() {
        var oViewModel = {};
        for (var i = 0; i < this.oPromptData.promptUnits.length; i++) {
            var oModelUnit = {};
            var oDataUnit = this.oPromptData.promptUnits[i];
            oModelUnit.id = oDataUnit.id;
            oModelUnit.prompts = [];
            for (var j = 0; j < oDataUnit.prompts.length; j++) {
                var oModelPrompt = {};
                var oDataPrompt = oDataUnit.prompts[j];
                oModelPrompt.id = oDataPrompt.id;
                oModelPrompt[ModelPathBuilder.VIEW_SELECTED] = false;
                oModelPrompt[ModelPathBuilder.VIEW_VALIDATION] = false;
                oModelPrompt[ModelPathBuilder.VIEW_INITIAL] = true;
                oModelPrompt[ModelPathBuilder.VIEW_ENABLED] = true;
                oModelPrompt[ModelPathBuilder.VIEW_LOVSIZE] = 0;
                oModelPrompt[ModelPathBuilder.VIEW_LOVTOTAL] = -1;
                oModelPrompt[ModelPathBuilder.VIEW_LOVBUSY] = false;
                oModelPrompt[ModelPathBuilder.VIEW_LOVSEARCHBUSY] = true;
                oModelPrompt[ModelPathBuilder.VIEW_LOVGROWING] = false;
                oModelPrompt[ModelPathBuilder.VIEW_EXPANDED] = !oDataPrompt.isOptionalPrompt;
                oModelPrompt[ModelPathBuilder.VIEW_LOVSEARCHEXCEED] = false;
                oModelUnit.prompts.push(oModelPrompt);
            }
            oViewModel[oModelUnit.id] = oModelUnit;
        }
        var oModel = new sap.ui.model.json.JSONModel(oViewModel);
        oModel.setSizeLimit(bobj.crv.fiori.config.SIZE_LIMIT);
        sap.ui.getCore().setModel(oModel, ModelPathBuilder.GetViewModleName(this.viewerName));
    },

    createValueModel: function() {
        this.aPromptUnitValues = [];
        this.oPromptUnitModelMap = {};
        for (var i = 0; i < this.oPromptData.promptUnits.length; i++) {
            var oModelUnit = {};
            var oDataUnit = this.oPromptData.promptUnits[i];
            oModelUnit.id = oDataUnit.id;
            oModelUnit.prompts = [];
            oModelUnit.options = this.oPromptData.options;
            for (var j = 0; j < oDataUnit.prompts.length; j++) {
                var oModelPrompt = {};
                var oDataPrompt = oDataUnit.prompts[j];
                // pre process json data
                if (!oDataPrompt.isOptionalPrompt)
                    oDataPrompt.fDescription = oDataPrompt.description.length > 0 ? "*" + oDataPrompt.description : "*" + oDataPrompt.name;
                else
                    oDataPrompt.fDescription = oDataPrompt.description.length > 0 ? oDataPrompt.description : oDataPrompt.name;
                oDataPrompt.lovNetworkID = oDataUnit.id;
                oDataPrompt.promptIndex = j;
                oDataPrompt.value = [];
                // gen model
                oModelPrompt.id = oDataPrompt.id;
                oModelPrompt.lovValueIndex = oDataPrompt.lovValueIndex;
                oModelPrompt.name = oDataPrompt.name;
                oModelPrompt.lovFieldTypes = oDataPrompt.lovFieldTypes;
                oModelPrompt.isNull = oDataPrompt.isNull ? oDataPrompt.isNull : false;
                oModelPrompt.values = oDataPrompt.values;
                if (!oModelPrompt.values)
                    oModelPrompt.values = [];
                oModelPrompt.values.forEach(function (oValue) {
                    if(oValue!=null){
                        if (oValue.labels) {
                            oValue.labelsPair = ValueFormatter.FormatDiscreteForDisplay(oValue);
                            if (oDataPrompt.allowRangeValue && oDataPrompt.allowMultiValue && oDataPrompt.allowDiscreteValue) {
                                oValue[bobj.crv.fiori.range.RANGE_TOKEN] = {
                                    value: oValue.value,
                                    labels: oValue.labels,
                                    labelsPair: oValue.labelsPair
                                }
                            }
                        }
                        if (oValue[bobj.crv.fiori.range.START_PART] || oValue[bobj.crv.fiori.range.END_PART]) {
                            var formattedValue = ValueFormatter.FormatRangeForDisplay(oValue);
                            oValue[bobj.crv.fiori.range.RANGE_TOKEN] = {
                                value: formattedValue,
                                labels: [formattedValue],
                                labelsPair: formattedValue
                            }
                        }
                    }
                });
                oModelUnit.prompts.push(oModelPrompt);
            }
            this.aPromptUnitValues.push(oModelUnit);
            this.oPromptUnitModelMap[oModelUnit.id] = oModelUnit;
        }
        var oModel = new sap.ui.model.json.JSONModel(this.oPromptUnitModelMap);
        oModel.setSizeLimit(bobj.crv.fiori.config.SIZE_LIMIT);
        sap.ui.getCore().setModel(oModel, ModelPathBuilder.GetValueModleName(this.viewerName));
    },

    createModel: function(oPromptData, viewerName, viewerType) {
        this.setPromptData(oPromptData);
        this.setViewerName(viewerName);
        this.setViewerType(viewerType)

        this.createViewModel();
        this.createValueModel();
    },
    
    createDependencyMananger: function(rptSrcKey, servletURL, fReportState, fUseSavedData) {
        this.oRequestHandler = new HTTPRequestHandler(servletURL, rptSrcKey, fReportState(), fUseSavedData(), this.bridge, this.viewerName, this.viewerType);
        this.oDependencyManager = new DependencyManager(this.oRequestHandler);
        
        // temporary assume all report does not require logon
        if (this.oPromptData.logonRequired) {
            this.oRequestHandler.setUseSavedData(false);
        }
    },

    addScrollSync: function(oSummary, oPrompts) {
        this.oScrollManager = new ScrollSyncManager(oSummary, oPrompts, this.oPromptData, this.viewerName);
    },

    getPromptUnitModel: function (id) {
        return oPromptUnitModelMap[id];
    },

    setPromptData: function (promptData) {
        this.oPromptData = promptData;
    },

    setViewerName: function (viewerName) {
        this.viewerName = viewerName;
    },

    setViewerType: function (viewerType) {
        this.viewerType = viewerType;
    },

    encodeValues: function (promptUnitValues) {
        promptUnitValues.forEach(function (oPromptUnit) {
            oPromptUnit.prompts.forEach(function (oPrompt) {
                oPrompt.name = encodeURIComponent(oPrompt.name);
                oPrompt.values.forEach(function (oValue) {
                    if (oValue.labels) {
                        for (var i = 0; i < oValue.labels.length; i++) {
                            oValue.labels[i] = encodeURIComponent(oValue.labels[i]);
                        }
                        oValue.value = encodeURIComponent(oValue.value);
                        oValue.labelsPair = ValueFormatter.FormatDiscreteForDisplay(oValue);
                    }
                });
            });
        });
        return promptUnitValues;
    },

    run: function () {
        var result = true;
        for (var i = 0; i < this.oPromptData.promptUnits.length; i++) {
            for (var j = 0; j < this.oPromptData.promptUnits[i].prompts.length; j++) {
                var validationPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_VALIDATION, this.oPromptData.promptUnits[i].prompts[j]);
                var initialPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_INITIAL, this.oPromptData.promptUnits[i].prompts[j]);
                var isNullPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VALUE_ISNULL, this.oPromptData.promptUnits[i].prompts[j]);
                var validation = sap.ui.getCore().getModel(ModelPathBuilder.GetViewModleName(this.viewerName)).getProperty(validationPath) ||
                sap.ui.getCore().getModel(ModelPathBuilder.GetValueModleName(this.viewerName)).getProperty(isNullPath);
                sap.ui.getCore().getModel(ModelPathBuilder.GetViewModleName(this.viewerName)).setProperty(initialPath, false);
                result = result && validation;
            }
        }
        if (result) {
            this.bridge.setParamValues(this.viewerName, this.getView().getViewData().getDisableEncoding() ? this.aPromptUnitValues : this.encodeValues(this.aPromptUnitValues));
        }
        return result;
    }

});
