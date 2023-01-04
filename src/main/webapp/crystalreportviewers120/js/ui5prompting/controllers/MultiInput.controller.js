'use strict';
jQuery.sap.require("ui5prompting.controllers.MultiControllerBase");

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./BasePromptController"
], function (Controller, BaseInputController) {

    return BaseInputController.extend("ui5prompting.controllers.MultiInput", ui5prompting.controllers.MultiControllerBase.Discrete);

});


