"use strict";

jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");

sap.ui.define([ "sap/ui/core/mvc/Controller" ], function(Controller) {
    return Controller.extend("ui5prompting.controllers.BasePromptController", {
        onInit: function() {
            this.promptData = this.getView().getViewData().promptData;
            this.formatOptions = this.getView().getViewData().options;

            // setup model path
            var sViewerName = this.getView().getViewData().viewerName;
            this.valueModelName = ModelPathBuilder.GetValueModleName(this.getView().getViewData().viewerName);
            this.viewModelName = ModelPathBuilder.GetViewModleName(this.getView().getViewData().viewerName);

            this.lovPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOV, this.promptData);
            this.lovSizePath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSIZE, this.promptData);
            this.lovTotalSizePath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVTOTAL, this.promptData);
            this.valuesPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VALUE_VALUES, this.promptData);
            this.enablePath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_ENABLED, this.promptData);
            this.lovBusyPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVBUSY, this.promptData);
            this.lovGrowingPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVGROWING, this.promptData);
            this.lovSearchBusyPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSEARCHBUSY, this.promptData);
            this.searchLovResultPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSEARCH, this.promptData);
            this.searchLovExceed = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSEARCHEXCEED, this.promptData);
            this.validationPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_VALIDATION, this.promptData);
            this.expandPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_EXPANDED, this.promptData);

            if (this.promptData.allowRangeValue && !this.promptData.allowDiscreteValue) {
                this.validateRangeValues();
            }

            // set initial values
            this.setValues(this.promptData.values);
        },

        // ********************* Events *********************
        onSubmit: function(oEvent) {
            if (oEvent.result) {
                this.updateValues(oEvent);
                this.updateAll(this.typeValidation());
            } else {
                this.updateAll(oEvent.result);
            }
        },

        // ********************* Model *********************
        getModelValues: function() {
            return sap.ui.getCore().getModel(this.valueModelName).getProperty(this.valuesPath).slice();
        },

        setModelValues: function(oValues) {
            return sap.ui.getCore().getModel(this.valueModelName).setProperty(this.valuesPath, oValues);
        },

        isNull: function() {
            return sap.ui.getCore().getModel(this.valueModelName).getProperty(ModelPathBuilder.BuildPath(ModelPathBuilder.VALUE_ISNULL, this.promptData));
        },

        updateValidation: function(sState) {
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.validationPath, sState);
        },

        valid: function() {
            sap.ui.getCore().getModel(this.viewModelName).getProperty(this.validationPath);
        },

        getReadonly: function() {
            sap.ui.getCore().getModel(this.viewModelName).getProperty(this.enablePath);
        },

        setReadonly: function(b) {
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.enablePath, !b);
        },

        expand: function() {
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.expandPath, true);
        },

        collapse: function() {
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.expandPath, false);
        },

        updateItems: function(prompt, context) {
            var lov = prompt.lov;
            if (!lov.values)
                return;

            if (context.lovPathNextLevel && context.promptID && context.promptID != prompt.id)
                return;

            this._preProcessLov(lov.values);

            var lovs;
            // hierarchy lov
            if (context.lovPathNextLevel) {
                if (lov.values.length >= bobj.crv.fiori.config.SIZE_LIMIT) {
                    sap.m.MessageToast.show(sap.ui.getCore().getModel("ui5ResourceBundle").getText("OverLOVLimit"), {
                        duration : 10000,
                        autoClose: false
                    });
                }
                sap.ui.getCore().getModel(this.viewModelName).setProperty(context.lovPathNextLevel, lov.values);
            } else { // flat lov
                // check growing
                sap.ui.getCore().getModel(this.viewModelName).setProperty(this.lovGrowingPath, lov.values.length >= this.formatOptions.maxNumParameterDefaultValues);

                // get model candidate
                if (context.growing || context.all) {
                    lovs = sap.ui.getCore().getModel(this.viewModelName).getProperty(this.lovPath).slice(0);
                } else {
                    if (lov.isTotalKnown) {
                        sap.ui.getCore().getModel(this.viewModelName).setProperty(this.lovTotalSizePath, parseInt(lov.total));
                        lovs = Array(parseInt(lov.total)).fill({});
                    } else {
                        lovs = [];
                    }
                    if ((lov.values.length == 0 || lov.values[0].value != undefined) && // if already add an no value, don't do it again
                        ((this.promptData.isOptionalPrompt || this.promptData.allowNullValue) && !this.promptData.allowMultiValue))
                        lov.values.unshift({ value : undefined, labels : [sap.ui.getCore().getModel("ui5ResourceBundle").getText("NoValue")]});
                }

                // update model
                sap.ui.getCore().getModel(this.viewModelName).setProperty(this.lovSizePath, parseInt(lov.start) + lov.values.length);
                var args = [parseInt(lov.start), lov.values.length].concat(lov.values);
                Array.prototype.splice.apply(lovs, args);

                if (!lov.isTotalKnown && this.lovGrowing()) // enable growing
                    lovs.push({placeholder : true});
                sap.ui.getCore().getModel(this.viewModelName).setProperty(this.lovPath, lovs);
            }

            // do callback
            if (context.callback)
                context.callback(context.all ? lovs : lov.values);
        },

        handleLOVError: function(context) {
            if (context.lovPathNextLevel) {
                var rootNode = sap.ui.getCore().getModel(this.viewModelName).getProperty(context.lovPathFetchValuesNode);
                if (rootNode) {
                    rootNode.hasChildren = false;
                    rootNode.lov = undefined;
                    sap.ui.getCore().getModel(this.viewModelName).setProperty(context.lovPathFetchValuesNode, rootNode);
                }
            }
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.lovPath, []);
        },

        lovIsTotalKnown: function() {
            var totalSize = sap.ui.getCore().getModel(this.viewModelName).getProperty(this.lovTotalSizePath);
            return (totalSize && !isNaN(totalSize) && (totalSize >= 0));
        },

        lovGrowing: function() {
            return sap.ui.getCore().getModel(this.viewModelName).getProperty(this.lovGrowingPath);
        },

        lovTotalSize: function() {
            return sap.ui.getCore().getModel(this.viewModelName).getProperty(this.lovTotalSizePath);
        },

        lovSize: function() {
            return sap.ui.getCore().getModel(this.viewModelName).getProperty(this.lovSizePath);
        },

        showWaitState: function() {
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.lovBusyPath, true);
        },

        clearWaitState: function() {
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.lovBusyPath, false);
        },

        _preProcessLov: function(lov) {
            for (var i = 0; i < lov.length; i++) {
                lov[i].isLov = true;
                lov[i].selected = false;

                if (lov[i].hasChildren) {
                    lov[i].lov = new Array({placeholder : true});
                }

                if (lov[i].labels) {
                    lov[i].labelsPair = "";
                    for (var j = 0; j < lov[i].labels.length; j++) {
                        if (this.promptData.hiddenLovFields.findIndex(function(v) {return v == j;}) != -1) {
                            continue;
                        }
                        if (lov[i].labels[j] && lov[i].labels[j].length > 0)
                            lov[i].labelsPair += lov[i].labelsPair == "" ? lov[i].labels[j] : " - " + lov[i].labels[j];
                    }
                }
            }
        },

        _mapSearchWithLov: function(lov) {
            var aMainLov = sap.ui.getCore().getModel(this.viewModelName).getProperty(this.lovPath);
            if (this.promptData.isHierarchy) {
                var fDFS = function(v, aTree) {
                    for (var j = 0; j < aTree.length; j++) {
                        if (aTree[j].hasChildren && !aTree[j].lov[0].placeholder) {
                            var result = fDFS(v, aTree[j].lov);
                            if (result)
                                return result;
                        }
                        if (aTree[j].value == v)
                            return aTree[j];
                    }
                    return undefined;
                }
                for (var i = 0; i < lov.length; i++) {
                    var result = fDFS(lov[i].value, aMainLov);
                    if (result)
                        lov[i] = result;
                }
            } else {
                var j = 0;
                for (var i = 0; i < lov.length; i++) {
                    while(j < this.lovSize()) {
                        if (lov[i].value == aMainLov[j].value) {
                            lov[i] = aMainLov[j];
                            break;
                        }
                        j++;
                    }
                    if (j == this.lovSize())
                        break;
                }
            }
        },

        updateSearchLOVResult: function(searchResult, context) {
            if (!searchResult || !searchResult.lov)
                return;
            this._preProcessLov(searchResult.lov);
            this._mapSearchWithLov(searchResult.lov);
            if (context.callback)
                context.callback(searchResult.lov);
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.searchLovResultPath, searchResult.lov);
            sap.ui.getCore().getModel(this.viewModelName).setProperty(this.searchLovExceed, searchResult.searchExceedLimit ? true : false);
        },

        // ********************* Others *********************
        notifyDependency: function(result) {
            sap.ui.getCore().getEventBus().publish(this.promptData.id, bobj.crv.fiori.event.VALIDATE_VALUE, {result : result});
        },

        updateAll: function(result) {
            this.updateValidation(result);
            this.notifyDependency(result);
        },

        isValueRequired: function() {
            if (!this.promptData.isOptionalPrompt && this.isNoValue() && !this.isNull())
                return true;
            return false;
        },

        isNoValue: function() {
            var curVals = this.getModelValues();
            if (curVals.length == 0
                || (curVals[0].value == undefined && curVals[0][bobj.crv.fiori.range.START_PART] == undefined && curVals[0][bobj.crv.fiori.range.END_PART] == undefined)) {
            	if (this.promptData.valueDataType == "s"
            		&& !this.promptData.allowMultiValue
            		&& !this.promptData.allowRangeValue
            		&& this.promptData.fetchLOV == "false"){
            		var emptyString = [{"labels":"", "labelsPair":"", "value":""}];
            		this.setModelValues(emptyString);
            		return false;
            	}
                return true;
            } else {
                return false;
            }
        },

        validateRangeValues: function() {
            if (this.promptData.values == undefined) {
                return;
            }

            for (var i = 0; i < this.promptData.values.length; i++) {
                var value = this.promptData.values[i];
                if (!value[START_PART] && !value[END_PART] && value.value != undefined) {
                    // set a vlidate initial range value
                    var partValue = {
                        value: value.value,
                        labels: value.labels,
                        inc: true
                    };
                    var range = {};
                    range[START_PART] = partValue;
                    range[END_PART] = partValue;
                    this.promptData.values[i] = range;
                }
            }
        }
    });
});