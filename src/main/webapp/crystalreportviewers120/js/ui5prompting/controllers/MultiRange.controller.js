'use strict';
jQuery.sap.require("ui5prompting.controllers.MultiControllerBase");

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./BasePromptController"
], function (Controller, BasePromptController) {
    return BasePromptController.extend("ui5prompting.controllers.MultiRange", ui5prompting.controllers.MultiControllerBase.Range);
});


