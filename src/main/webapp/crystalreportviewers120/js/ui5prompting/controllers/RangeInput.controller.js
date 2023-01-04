'use strict';

var START_PART = bobj.crv.fiori.range.START_PART;
var END_PART = bobj.crv.fiori.range.END_PART;

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./BasePromptController"
], function (Controller, BasePromptController) {

    return BasePromptController.extend("ui5prompting.controllers.RangeInput", {

        updateValues: function(oEvent) {
            var valueObj = this.getValueObj(oEvent);
            var curVals = this.getModelValues();
            if (curVals.length != 0) {
                curVals.splice(0, curVals.length);
            }
            if (valueObj[START_PART] != undefined || valueObj[END_PART] != undefined) {
                curVals.push(valueObj);
            }
            this.setModelValues(curVals);
        },

        typeValidation: function() {
            // Twin no-bound range value is error when optional & null not allowed
            if (this.isValueRequired()) {
                this.getView().getStartInput().setInputFail(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
                this.getView().getEndInput().setInputFail(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
                return false;
            }
            return true;
        },

        getValueObj: function (oEvent) {
            var partHolder = {};
            if (oEvent[START_PART]) {
                partHolder[START_PART] = {
                    value: oEvent[START_PART].value,
                    labels: oEvent[START_PART].labels,
                    inc: oEvent[START_PART].inc
                };
            }
            if (oEvent[END_PART]) {
                partHolder[END_PART] = {
                    value: oEvent[END_PART].value,
                    labels: oEvent[END_PART].labels,
                    inc: oEvent[END_PART].inc
                };
            }

            return partHolder;
        },

        removeAll: function() {
            this.getView().getInput().setValue(undefined);
            this.getView().getInput().fireValueChange();
        },

        setValues: function(values) {
            if (values && values.length > 0) {
                this.getView().getInput().setValue(values[0]);
                this.updateValues(values[0]);
            } else {
                this.getView().getInput().setValue(undefined);
            }
            this.updateAll(this.typeValidation());
        }
    });
});
