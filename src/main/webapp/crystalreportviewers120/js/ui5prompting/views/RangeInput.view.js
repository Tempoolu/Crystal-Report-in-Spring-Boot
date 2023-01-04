'use strict';

var START_PART = bobj.crv.fiori.range.START_PART;
var END_PART = bobj.crv.fiori.range.END_PART;

jQuery.sap.require("ui5prompting.inputs.InputRow");
jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");
jQuery.sap.require("ui5prompting.views.PromptComponentViews");

sap.ui.jsview("ui5prompting.views.RangeInput", {

    getControllerName: function() {
        return "ui5prompting.controllers.RangeInput";
    },

    createContent: function(oController) {
        var viewData = this.getViewData();

        this.oInputRow = CreateRangeInput({
            promptData: viewData.promptData,
            options: viewData.options,
            viewerName: viewData.viewerName
        });

        this.getStartInput().attachValueChange(function(oPartEvent) {
            oPartEvent.partType = START_PART;
            oController.onSubmit(this.oInputRow.updatePartValue(oPartEvent));
        }.bind(this));
        this.getEndInput().attachValueChange(function(oPartEvent) {
            oPartEvent.partType = END_PART;
            oController.onSubmit(this.oInputRow.updatePartValue(oPartEvent));
        }.bind(this));

        return new PromptPanel({
            headerText: viewData.promptData.fDescription,
            content: [this.oInputRow, new NullCheckBox({
                promptData: viewData.promptData,
                viewerName: viewData.viewerName
            })],
            expandable: true,
            expanded: '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_EXPANDED, viewData.promptData, viewData.viewerName) + '}',
            selected: '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_SELECTED, viewData.promptData, viewData.viewerName) + '}'
        });
    },

    getInput: function() {
        return this.oInputRow;
    },

    getStartInput: function() {
        return this.oInputRow.getPartInput(START_PART);
    },

    getEndInput: function() {
        return this.oInputRow.getPartInput(END_PART);
    }
});