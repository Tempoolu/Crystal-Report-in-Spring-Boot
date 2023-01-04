'use strict';

var CONDITION_VALUE = bobj.crv.fiori.range.CONDITION_VALUE;

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./RangeInput.controller"
], function (Controller, RangeInputController) {

    return RangeInputController.extend("ui5prompting.controllers.ConditionRangeInput", {

        getValueObj: function (oEvent) {
            var partHolder = RangeInputController.prototype.getValueObj(oEvent);
            partHolder[CONDITION_VALUE] = oEvent[CONDITION_VALUE];

            return partHolder;
        }
    });
});
