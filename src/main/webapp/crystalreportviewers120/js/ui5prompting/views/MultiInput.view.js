'use strict'

jQuery.sap.require("ui5prompting.inputs.InputRow");
jQuery.sap.require("ui5prompting.inputs.LOVDialogCreator");
jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");

sap.ui.jsview("ui5prompting.views.MultiInput", {

    getControllerName: function() {
        return "ui5prompting.controllers.MultiInput";
    },

    createContent: function(oController) {
        var viewData = this.getViewData();

        this.multiInput = CreateMultiInput({
            promptData: viewData.promptData,
            viewerName: viewData.viewerName,
            showValueHelp:  viewData.promptData.fetchLOV && viewData.promptData.fetchLOV.toLowerCase() == "true"
        });
        this.multiInput.attachTokenRemove(function(removedIds) {
            oController.onRemoveValues(removedIds.map(function(v) { return {value: v}; }));
        });

        // Set up list of values dialog
        this.multiInput.attachValueHelpRequest(function() {
            if (!this._oDialog) {
                this._oDialog = CreateLOVDialog({
                    promptData: viewData.promptData,
                    viewerName: viewData.viewerName,
                    baseInputId: this.sId,
                    options: viewData.options,
                    allowMultiSelect: true
                });

                this._oDialog.attachSelected(function(values) {
                    oController.setModelValues([]);
                    oController.setValues(values);
                });

                this.addDependent(this._oDialog);
            }
            this._oDialog.open(oController.getModelValues());
        }.bind(this));

        this.oInputRow = CreateDiscreteInput({
            promptData: viewData.promptData,
            options: viewData.options,
            viewerName: viewData.viewerName,
            allowShowValueHelp: false,
            visible: viewData.promptData.allowCustomValue
        });

        this.getInput().attachValueChange(function(oEvent) {
            this.updateAddButton(oEvent.result);
        }.bind(this.oInputRow));

        this.oInputRow.attachAddAction(function() {
            oController.onSubmit(this.getInput().validate());
            this.oInputRow.cleanInput();
        }.bind(this));

        var aContent = [this.oInputRow, this.multiInput, new NullCheckBox({
            promptData: viewData.promptData,
            viewerName: viewData.viewerName
        })];

        return new PromptPanel({
            headerText: viewData.promptData.fDescription,
            content: aContent,
            expandable: true,
            expanded: '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_EXPANDED, viewData.promptData, viewData.viewerName) + '}',
            selected: '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_SELECTED, viewData.promptData, viewData.viewerName) + '}'
        });
    },

    getInput: function() {
        return this.oInputRow.getInput();
    },

    getMultiInput: function() {
        return this.multiInput;
    },

    getLovDialog: function() {
        return this._oDialog;
    }
});