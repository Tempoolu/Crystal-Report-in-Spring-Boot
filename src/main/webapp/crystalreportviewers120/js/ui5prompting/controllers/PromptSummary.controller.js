'use strict'

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ui5prompting/utils/Formatter"
], function (Controller, Formatter) {

    return Controller.extend("ui5prompting.controllers.PromptSummary", {
        formatter: Formatter
    });
});
