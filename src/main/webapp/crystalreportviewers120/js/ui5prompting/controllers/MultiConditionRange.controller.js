'use strict';
jQuery.sap.require("ui5prompting.utils.Formatter");

var CONDITION_VALUE = bobj.crv.fiori.range.CONDITION_VALUE;

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./MultiRange.controller"
], function (Controller, MultiRangeController) {
    return MultiRangeController.extend("ui5prompting.controllers.MultiConditionRange", {

        generateRangeObj: function(oValue) {
            var range = MultiRangeController.prototype.generateRangeObj(oValue);
            range[CONDITION_VALUE] = oValue[CONDITION_VALUE];

            return range;
        },

        setValues: function(values) {
            if (values && values.length > 0) {
                this.updateValues({values: values});
                this.getView().getInputRow().updateInput(values[values.length - 1][CONDITION_VALUE]);
            }
            this.updateAll(this.typeValidation());
        },

        isEqual: function(oRange1, oRange2) {
            return MultiRangeController.prototype.isEqual(oRange1, oRange2)
                && oRange1[CONDITION_VALUE] == oRange2[CONDITION_VALUE];
        }
    });
});


