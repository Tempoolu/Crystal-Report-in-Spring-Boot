'use strict'

jQuery.sap.require("ui5prompting.inputs.InputRow");
jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");
jQuery.sap.require("ui5prompting.views.PromptComponentViews");

sap.ui.jsview("ui5prompting.views.MultiConditionRange", {

    getControllerName: function() {
        return "ui5prompting.controllers.MultiConditionRange";
    },

    createContent: function(oController) {
        var viewData = this.getViewData();

        this.multiInput = CreateMultiInput({
            promptData: viewData.promptData,
            viewerName: viewData.viewerName,
            showValueHelp: false,
            tokenPrefix: bobj.crv.fiori.range.RANGE_TOKEN + "/"
        });
        this.multiInput.attachTokenRemove(function(removedIds) {
            oController.onRemoveValues(removedIds);
        });

        this.oInputRow = CreateConditionRangeInput({
            promptData: viewData.promptData,
            options: viewData.options,
            viewerName: viewData.viewerName
        });

        this.oInputRow.attachOperatorChange(function(oEvent) {
            var oItem = oEvent.getParameters("selectedItem");
            this.updateInput(oItem.selectedItem.getKey());
        }.bind(this.oInputRow));

        this.oInputRow.getRangeInput().getPartInput(START_PART).attachValueChange(function(oPartEvent) {
            oPartEvent.partType = START_PART;
            this.updateAddButton(this.getRangeInput().updatePartValue(oPartEvent).result);
        }.bind(this.oInputRow));
        this.oInputRow.getRangeInput().getPartInput(END_PART).attachValueChange(function(oPartEvent) {
            oPartEvent.partType = END_PART;
            this.updateAddButton(this.getRangeInput().updatePartValue(oPartEvent).result);
        }.bind(this.oInputRow));

        this.oInputRow.attachAddAction(function() {
            oController.onSubmit(this.oInputRow.validate());
            this.oInputRow.cleanInput();
        }.bind(this));

        var aContent = [ this.oInputRow, this.multiInput ];

        return new PromptPanel({
            headerText: viewData.promptData.fDescription,
            content: aContent,
            expandable: true,
            expanded: '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_EXPANDED, viewData.promptData, viewData.viewerName) + '}',
            selected: '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_SELECTED, viewData.promptData, viewData.viewerName) + '}'
        });
    },

    getInputRow: function() {
        return this.oInputRow;
    },

    getMultiInput: function() {
        return this.multiInput;
    }
});