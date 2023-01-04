'use strict';
jQuery.sap.require("ui5prompting.utils.Formatter");

jQuery.sap.require("ui5prompting.controllers.MultiControllerBase");

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./BasePromptController"
], function (Controller, BasePromptController) {
    return BasePromptController.extend("ui5prompting.controllers.MultiDiscreteRange", {

        updateValues: function (oEvent) {
            var curVals = this.getModelValues();
            var valuesObj = this.getValueObj(oEvent);

            for (var i = 0; i < valuesObj.length; i++) {
                var index = curVals.findIndex(function (x) {
                    return x[RANGE_TOKEN].value == valuesObj[i][RANGE_TOKEN].value;
                });
                if (index == -1) {
                    curVals.push(valuesObj[i]);
                } else {
                    curVals[index] = valuesObj[i];
                }
            }

            this.setModelValues(curVals);
        },

        getValueObj: function (oEvent) {
            var isRange = function (oValue) {
                return oValue[START_PART] || oValue[END_PART];
            }

            var paddingRange = function(oValue) {
                oValue[RANGE_TOKEN] = {
                    value : oValue.value,
                    labels: oValue.labels,
                    labelsPair: oValue.labelsPair    
                };
                return oValue;
            }

            var values = [];
            if (oEvent.values) {
                var newValues = oEvent.values;
                for (var i = 0; i < newValues.length; i++) {
                    if (isRange(newValues[i]))
                        values.push(ui5prompting.controllers.MultiControllerBase.Range.generateRangeObj(newValues[i]));
                    else
                        values.push(paddingRange(newValues[i]));
                }
            } else if (isRange(oEvent)) {
                var valueHolder = ui5prompting.controllers.MultiControllerBase.Range.generateRangeObj(oEvent);
                if (valueHolder[RANGE_TOKEN]) {
                    values.push(valueHolder);
                }
            } else {
                values = [paddingRange(ui5prompting.controllers.MultiControllerBase.Discrete.getValueObj(oEvent)[0])];
            }

            return values;
        },

        onRemoveValues: function (aRemovedIds) {
            for (var i = 0; i < aRemovedIds.length; i++) {
                var curVals = this.getModelValues();
                var index = curVals.findIndex(function (x) {
                    return x[RANGE_TOKEN].value == aRemovedIds[i].value;
                });
                if (index != -1) {
                    curVals.splice(index, 1);
                }
                this.setModelValues(curVals);
            }
            this.updateAll(this.typeValidation());
        },

        typeValidation: function () {
            if (this.isValueRequired()) {
                this.getView().getMultiInput().setValueStateText(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
                return false;
            }
            return true;
        },

        removeAll: function () {
            var curVals = this.getModelValues();
            curVals.splice(0, curVals.length);
            this.setModelValues(curVals);
            this.updateAll(this.typeValidation());
        },

        setValues: function (values) {
            if (values && values.length > 0) {
                this.updateValues({ values: values });
            }
            this.updateAll(this.typeValidation());
        }
    });
});


