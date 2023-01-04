'use strict'

jQuery.sap.require("ui5prompting.inputs.InputRow");
jQuery.sap.require("ui5prompting.inputs.LOVDialogCreator");
jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");

sap.ui.jsview("ui5prompting.views.MultiDiscreteRange", {

    getControllerName: function () {
        return "ui5prompting.controllers.MultiDiscreteRange";
    },

    createContent: function (oController) {
        var viewData = this.getViewData();

        this.multiInput = CreateMultiInput({
            promptData: viewData.promptData,
            viewerName: viewData.viewerName,
            showValueHelp: viewData.promptData.fetchLOV && viewData.promptData.fetchLOV.toLowerCase() == "true",
            tokenPrefix: bobj.crv.fiori.range.RANGE_TOKEN + "/"
        });
        this.multiInput.attachTokenRemove(function (removedIds) {
            oController.onRemoveValues(removedIds.map(function (v) { return { value: v }; }));
        });

        // Set up list of values dialog
        this.multiInput.attachValueHelpRequest(function () {
            if (!this._oDialog) {
                this._oDialog = CreateLOVDialog({
                    promptData: viewData.promptData,
                    viewerName: viewData.viewerName,
                    baseInputId: this.sId,
                    options: viewData.options,
                    allowMultiSelect: true
                });

                this._oDialog.attachSelected(function (values) {
                    var aCurrentValues = oController.getModelValues();
                    for (var i = 0; i < aCurrentValues.length; i++) {
                        if (!aCurrentValues[i].value)
                        values.push(aCurrentValues[i]);
                    }
                    oController.setModelValues([]);
                    oController.setValues(values);
                    this._bindAllDiscreteLovDialog();
                }.bind(this));

                this.addDependent(this._oDialog);
            }
            this._unbindAllDiscreteLovDialog();
            var aCurrentValues = oController.getModelValues();
            var aCurrentDiscreteValues = [];
            for (var i = 0; i < aCurrentValues.length; i++) {
                if (aCurrentValues[i].value)
                    aCurrentDiscreteValues.push(aCurrentValues[i]);
            }
            this._oDialog.open(aCurrentDiscreteValues);
        }.bind(this));

        this.oDiscreteInputRow = CreateDiscreteInput({
            promptData: viewData.promptData,
            options: viewData.options,
            viewerName: viewData.viewerName,
            allowShowValueHelp: false,
            visible: viewData.promptData.allowCustomValue
        });

        this.oDiscreteInputRow.getInput().attachValueChange(function (oEvent) {
            this.updateAddButton(oEvent.result);
        }.bind(this.oDiscreteInputRow));

        this.oDiscreteInputRow.attachAddAction(function () {
            oController.onSubmit(this.oDiscreteInputRow.getInput().validate());
            this.oDiscreteInputRow.cleanInput();
        }.bind(this));

        this.oRangeInputRow = CreateRangeInput({
            promptData: viewData.promptData,
            options: viewData.options,
            viewerName: viewData.viewerName
        });

        this.oRangeInputRow.getPartInput(START_PART).attachValueChange(function (oPartEvent) {
            oPartEvent.partType = START_PART;
            this.updateAddButton(this.updatePartValue(oPartEvent).result);
        }.bind(this.oRangeInputRow));
        this.oRangeInputRow.getPartInput(END_PART).attachValueChange(function (oPartEvent) {
            oPartEvent.partType = END_PART;
            this.updateAddButton(this.updatePartValue(oPartEvent).result);
        }.bind(this.oRangeInputRow));

        this.oRangeInputRow.attachAddAction(function () {
            oController.onSubmit(this.oRangeInputRow.validate());
            this.oRangeInputRow.cleanInput();
        }.bind(this));


        var aContent = [this.oDiscreteInputRow, this.oRangeInputRow, this.multiInput, new NullCheckBox({
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

    getMultiInput: function () {
        return this.multiInput;
    },

    _unbindAllDiscreteLovDialog: function() {
        this.oDiscreteInputRow.getInput().getLOVDialog().unbindModel();
        this.oRangeInputRow.getPartInput(START_PART).getLOVDialog().unbindModel();
        this.oRangeInputRow.getPartInput(END_PART).getLOVDialog().unbindModel();
    },

    _bindAllDiscreteLovDialog: function() {
        this.oDiscreteInputRow.getInput().getLOVDialog().bindModel();
        this.oRangeInputRow.getPartInput(START_PART).getLOVDialog().bindModel();
        this.oRangeInputRow.getPartInput(END_PART).getLOVDialog().bindModel();
    }
});