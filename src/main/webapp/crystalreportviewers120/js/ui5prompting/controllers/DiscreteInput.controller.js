'use strict';

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./BasePromptController"
], function (Controller, BaseInputController) {

    return BaseInputController.extend("ui5prompting.controllers.DiscreteInput", {

        updateValues: function(oEvent) {
            var valueObj = this.getValueObj(oEvent);
            var curVals = this.getModelValues();
            if (curVals.length != 0) {
                curVals.splice(0, curVals.length);
            }
            if (valueObj != undefined) {
                curVals.push(valueObj);
            }
            this.setModelValues(curVals);
        },

        typeValidation: function() {
            if (this.isValueRequired()) {
                this.getView().getInput().setInputFail(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
                return false;
            }
            return true;
        },

        getValueObj: function(oEvent) {
            var valueHolder;
            if (oEvent.value != undefined) {
                valueHolder = {
                    value: oEvent.value,
                    labels: oEvent.labels,
                    labelsPair: oEvent.labelsPair
                };
            }

            return valueHolder;
        },

        removeAll: function() {
            this.getView().getInput().setValue(undefined);
            this.getView().getInput().fireValueChange();
        },

        setValues: function(values) {
            if (values && values.length > 0){
                this.getView().getInput().setValue(values[0].value);
                this.updateValues(values[0]);
            } else {
                this.getView().getInput().setValue(undefined);
            }
            this.updateAll(this.typeValidation());
        }
    });

});


