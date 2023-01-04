/* ===================================================== Helper Functions/Objects ===================================================== */

function CreateDiscreteInput(oSettings) {
    return new DiscreteInput(oSettings);
};

function CreateMultiInput(oSettings) {
    return new MultiInput(oSettings);
};

function CreateRangeInput(oSettings) {
    return new RangeInput(oSettings);
};

function CreateConditionRangeInput(oSettings) {
    return new ConditionRangeInput(oSettings);
};

/* ================================================== Derived Complicated Components ===================================================== */
'use strict';
jQuery.sap.require("ui5prompting.inputs.DerivedInputs");

function valueStateBinding(promptData, viewerName) {
    return {
        parts: [
            { path: ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_VALIDATION, promptData, viewerName) },
            { path: ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_INITIAL, promptData, viewerName) },
            { path: ModelPathBuilder.BuildFullValuePath(ModelPathBuilder.VALUE_ISNULL, promptData, viewerName) }
        ],
        formatter: function (value, initial, isNull) {
            if (initial) {
                return sap.ui.core.ValueState.None;
            } else if (value || isNull) {
                return sap.ui.core.ValueState.Success;
            } else {
                return sap.ui.core.ValueState.Error;
            }
        }
    }
}

// DiscreteInput
sap.m.FlexBox.extend("DiscreteInput", {

    renderer: "sap.m.FlexBoxRenderer",

    constructor: function(oSettings) {
        this.promptData = oSettings.promptData;

        oSettings.placeholder = sap.ui.getCore().getModel("ui5ResourceBundle").getText("hintDiscrete");
        oSettings.valueState = valueStateBinding(oSettings.promptData, oSettings.viewerName);
        this.oInputUnit = CreateInputUnit(oSettings);
        this.oInput = this.oInputUnit.getInput();

        this.oAddButton = new sap.m.Button({
            icon: "sap-icon://add",
            type: sap.m.ButtonType.Transparent,
            enabled: false,
            visible: false
        });

        oSettings.items = [this.oInputUnit, this.oAddButton];
        oSettings.width = "calc(100% - 2rem)";
        oSettings.renderType = sap.m.FlexRendertype.Bare;
        sap.m.FlexBox.call(this, oSettings);
    },

    getInput: function() {
        return this.oInput;
    },

    getAddButton: function(){
        return this.oAddButton;
    },

    cleanInput: function() {
        this.oInput.setValue(undefined);
        this.oInput.setValueState(sap.ui.core.ValueState.None);
        this.oAddButton.setEnabled(false);
    },

    updateAddButton: function(isValid) {
        if (isValid && !this.oInput.isEmpty()) {
            this.oAddButton.setEnabled(true);
        } else {
            this.oAddButton.setEnabled(false);
        }
    },

    attachAddAction: function(addAction) {
        this.oAddButton.attachPress(addAction);
        this.oAddButton.setVisible(true);
        this.setWidth("100%");
    }
});

// MultiInput
sap.m.MultiInput.extend("MultiInput", {

    renderer: "sap.m.MultiInputRenderer",

    constructor: function(oSettings) {
        this.onRemoveToken;

        var sValueModelName = ModelPathBuilder.GetValueModleName(oSettings.viewerName);
        var sValuesPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VALUE_VALUES, oSettings.promptData);
        //var sEnabledPath = '{=${' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_ENABLED, oSettings.promptData, oSettings.viewerName)
            //+ '} && !${' + ModelPathBuilder.BuildFullValuePath(ModelPathBuilder.VALUE_ISNULL, oSettings.promptData, oSettings.viewerName) + '}}';

        var sEnabledPath = {
            parts: [
                { path: ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_ENABLED, oSettings.promptData, oSettings.viewerName) },
                { path: ModelPathBuilder.BuildFullValuePath(ModelPathBuilder.VALUE_ISNULL, oSettings.promptData, oSettings.viewerName) }
            ],
            formatter: function(viewEnabled, isNull) {
                if (viewEnabled && !isNull) {
                    return true;
                } else {
                    return false;
                }
            }
        };

       // Binding labels to list
        var tokenPrefix = oSettings.tokenPrefix ? oSettings.tokenPrefix : "";
        var oItemSelectTemplate = new sap.m.Token({
            key: "{" + tokenPrefix + "value}",
            text: "{" + tokenPrefix + "labelsPair}"
        });

        oSettings.enableMultiLineMode = true;
        oSettings.enabled = sEnabledPath;
        oSettings.valueState = valueStateBinding(oSettings.promptData, oSettings.viewerName);
        oSettings.width = "calc(100% - 2rem)";
        sap.m.MultiInput.call(this, undefined, oSettings);

        this.setModel(sap.ui.getCore().getModel(sValueModelName));
        this.bindAggregation("tokens", {
            path: sValuesPath,
            template: oItemSelectTemplate
        });

        this.attachTokenUpdate(function(oEvent) {
            var allTokens = oEvent.getParameters().removedTokens;
            if (allTokens) {
                var removedIds = [];
                for (var i = 0; i < allTokens.length; i++) {
                    removedIds.push(allTokens[i].getKey());
                }
                this.onRemoveToken(removedIds);
            }
        });

        this.attachBrowserEvent('click', function() {
            sap.ui.getCore().getEventBus().publish(bobj.crv.fiori.event.UI_CHANNEL, bobj.crv.fiori.event.ON_FOCUS, { unitID: oSettings.promptData.lovNetworkID , promptID: oSettings.promptData.id,  updateSummary: true });
        }.bind(this));
    },

    attachTokenRemove: function(removeToken) {
        this.onRemoveToken = removeToken;
    },

    onAfterRendering: function() {
        sap.m.MultiInput.prototype.onAfterRendering.call(this);
        this.$().find("input").attr("readonly", "true");
        this.$().css("height", "auto");
        this.$().find(".sapMInputDivWrapper").css("height", "auto");
        this.removeTokenCount();
        this.$().find(".sapMTokenizerScrollContainer").children().each(function() {
            jQuery(this).attr("tabindex", 0); // no idea why $ does not define as jQuery in ipiont fix first
         });
    },

    _showIndicator: function() {
        sap.m.MultiInput.prototype._showIndicator.call(this);
        this.removeTokenCount();
    },

    removeTokenCount: function() {
        var maxTokens = bobj.crv.fiori.config.SIZE_LIMIT;
        var curTokens = this.getTokens().length;
        if (curTokens > maxTokens - 1) {
            var sSpanText = "<span class=\"sapMMultiInputIndicator\">" + this._oRb.getText("MULTIINPUT_SHOW_MORE_TOKENS", " ") + "</span>";
            this.$().find(".sapMMultiInputIndicator").replaceWith(sSpanText);
        }
    }

});

var START_PART = bobj.crv.fiori.range.START_PART;
var END_PART = bobj.crv.fiori.range.END_PART;
var CONDITION_VALUE = bobj.crv.fiori.range.CONDITION_VALUE;

// RangeInput
sap.m.FlexBox.extend("RangeInput", {

    renderer: "sap.m.FlexBoxRenderer",

    constructor: function(oSettings) {
        this.skipBoundsCheck = oSettings.skipBoundsCheck ? true : false;
        this.promptData = oSettings.promptData;
        this.oRangeValue = {};

        this.oStartInputUnit = CreateInputUnit({
            promptData: oSettings.promptData,
            options: oSettings.options,
            viewerName: oSettings.viewerName,
            width: "calc(50% - 3.5rem)",
            placeholder: sap.ui.getCore().getModel("ui5ResourceBundle").getText("hintRangeStart"),
            valueState : valueStateBinding(oSettings.promptData, oSettings.viewerName)
        });
        this.oEndInputUnit = CreateInputUnit({
            promptData: oSettings.promptData,
            options: oSettings.options,
            viewerName: oSettings.viewerName,
            width: "calc(50% - 3.5rem)",
            placeholder: sap.ui.getCore().getModel("ui5ResourceBundle").getText("hintRangeEnd"),
            valueState : valueStateBinding(oSettings.promptData, oSettings.viewerName)
        });
        this.oStartInput = this.oStartInputUnit.getInput();
        this.oEndInput = this.oEndInputUnit.getInput();

        this.oStartArrow  = new RangeDropDownArrow({
            bindingInput: this.oStartInput
        });
        this.oEndArrow  = new RangeDropDownArrow({
            bindingInput: this.oEndInput
        });

        this.oRangeIcon = new IntervalEndpointIndicator({
            alignItems: "Center",
            justifyContent: "Center",
            color: "#427cac",
            size: "0.875rem",
            width: "3rem",
            height: "2rem",
            rangeInput: this
        });
        this.oRangeIcon.addStyleClass("sapUiSmallMarginBegin");
        this.oRangeIcon.addStyleClass("sapUiSmallMarginEnd");

        this.oAddButton = new sap.m.Button({
            icon: "sap-icon://add",
            type: sap.m.ButtonType.Transparent,
            enabled: false,
            visible: false
        });

        oSettings.items = [this.oStartInputUnit, this.oStartArrow, this.oRangeIcon, this.oEndInputUnit, this.oEndArrow, this.oAddButton];
        oSettings.width = "calc(100% - 2rem)";
        oSettings.renderType = sap.m.FlexRendertype.Bare;
        sap.m.FlexBox.call(this, oSettings);
    },

    getPartInputUnit: function (partType) {
        return (partType == END_PART) ? this.oEndInputUnit : this.oStartInputUnit;
    },

    getPartInput: function(partType) {
        return (partType == END_PART) ? this.oEndInput : this.oStartInput;
    },

    getPartArrow: function(partType) {
        return (partType == END_PART) ? this.oEndArrow : this.oStartArrow;
    },

    getRangeIcon: function(){
        return this.oRangeIcon;
    },

    getAddButton: function(){
        return this.oAddButton;
    },

    cleanInput: function() {
        this.setValue(undefined);
        this.oStartInput.setValueState(sap.ui.core.ValueState.None);
        this.oEndInput.setValueState(sap.ui.core.ValueState.None);
        this.oAddButton.setEnabled(false);
    },

    isEmpty: function() {
        return !this.oRangeValue[START_PART] && !this.oRangeValue[END_PART];
    },

    validate: function(oPartEvent) {
        var startIsValid = this.oStartInput.validate().result;
        var endIsValid = this.oEndInput.validate().result;
        var bInBounds = this.valuesInBounds();

        if (startIsValid && endIsValid && !bInBounds) {
            this.oStartInput.setInputFail(sap.ui.getCore().getModel("ui5ResourceBundle").getText("RangeStartValueGreaterThanEnd"));
            this.oEndInput.setInputFail(sap.ui.getCore().getModel("ui5ResourceBundle").getText("RangeStartValueGreaterThanEnd"));
        }
        var result = startIsValid && endIsValid && bInBounds;

        this.updateAddButton(result);

        var oEvent = {
            result: result
        };

        if (this.oRangeValue[START_PART]) {
            oEvent[START_PART] = this.oRangeValue[START_PART];
        }
        if (this.oRangeValue[END_PART]) {
            oEvent[END_PART] = this.oRangeValue[END_PART];
        }

        return oEvent;
    },

    fireValueChange: function() {
        this.notifyAll();
    },

    notifyAll: function(oEvent) {
        if (!oEvent || oEvent.result == undefined) {
            oEvent = this.validate();
        }

        if (oEvent[START_PART]) {
            oEvent[START_PART].result = oEvent.result;
            this.oStartInput.notifyAll(oEvent[START_PART]);
        } else {
            this.oStartInput.notifyAll({result: oEvent.result});
        }
        if (oEvent[END_PART]) {
            oEvent[END_PART].result = oEvent.result;
            this.oEndInput.notifyAll(oEvent[END_PART]);
        } else {
            this.oEndInput.notifyAll({result: oEvent.result});
        }
    },

    setValue: function(value) {
        if (value && value[START_PART]) {
            this.oRangeValue[START_PART] = value[START_PART];
        } else {
            delete this.oRangeValue[START_PART];
        }
        if (value && value[END_PART]) {
            this.oRangeValue[END_PART] = value[END_PART];
        } else {
            delete this.oRangeValue[END_PART];
        }

        this.updateInput(true);
    },

    updatePartValue: function(oPartValue) {
        if (oPartValue.partType != undefined) {
            if (oPartValue.value != undefined) {
                this.oRangeValue[oPartValue.partType] = {
                    value: oPartValue.value,
                    currentValue: oPartValue.currentValue,
                    labels: oPartValue.labels,
                    inc: oPartValue.inc
                };
            } else if (oPartValue.value == undefined && oPartValue.inc != undefined) {
                // Only update inclusive value
                this.oRangeValue[oPartValue.partType].inc = oPartValue.inc;
            } else {
                delete this.oRangeValue[oPartValue.partType];
            }

            this.updateInput(false);
        }

        return this.validate();
    },

    updateAddButton: function(isValid) {
        if (isValid && !this.isEmpty()) {
            this.oAddButton.setEnabled(true);
        } else {
            this.oAddButton.setEnabled(false);
        }
    },

    updateInput: function(needSetValue) {
        // Start Input
        if (this.oRangeValue[START_PART]) {
            this.oStartInput.setInclusive(this.oRangeValue[START_PART].inc);
            if (needSetValue) {
                this.oStartInput.setValue(this.oRangeValue[START_PART].value);
                this.oRangeValue[START_PART].currentValue = this.oStartInput.getCurrentValue();
            }
        } else {
            this.oStartInput.setInclusive(undefined);
        }
        // End Input
        if (this.oRangeValue[END_PART]) {
            this.oEndInput.setInclusive(this.oRangeValue[END_PART].inc);
            if (needSetValue) {
                this.oEndInput.setValue(this.oRangeValue[END_PART].value);
                this.oRangeValue[END_PART].currentValue = this.oEndInput.getCurrentValue();
            }
        } else {
            this.oEndInput.setInclusive(undefined);
        }
        // Range icon
        this.oRangeIcon.update(this.oRangeValue);
        // Dropdown Arrow
        if (this.oRangeValue[START_PART]) {
            this.oStartArrow.setButtonEnabled(true);
        } else {
            this.oStartArrow.setButtonEnabled(false);
        }
        if (this.oRangeValue[END_PART]) {
            this.oEndArrow.setButtonEnabled(true);
        } else {
            this.oEndArrow.setButtonEnabled(false);
        }
    },

    attachAddAction: function(addAction) {
        this.oAddButton.attachPress(addAction);
        this.oAddButton.setVisible(true);
        this.setWidth("100%");
        this.oStartInputUnit.setWidth("calc(50% - 4.5rem)");
        this.oEndInputUnit.setWidth("calc(50% - 4.5rem)");
    },

    valuesInBounds: function() {
        if (this.skipBoundsCheck) {
            return true;
        }

        // no bound/single bound are allowed
        if (!this.oRangeValue[START_PART] || !this.oRangeValue[END_PART])
            return true;

        // Date/Datetime/Time should use currentValue to compare
        var valueStart = this.oRangeValue[START_PART].currentValue;
        var valueEnd = this.oRangeValue[END_PART].currentValue;
        var startInc = this.oRangeValue[START_PART].inc;
        var endInc = this.oRangeValue[END_PART].inc;

        switch (this.promptData.valueDataType) {
        case bobj.crv.params.DataTypes.STRING:
            return this.stringsInBounds(valueStart, valueEnd, startInc, endInc);
        case bobj.crv.params.DataTypes.CURRENCY:
        case bobj.crv.params.DataTypes.NUMBER:
            return this.numbersInBounds(valueStart, valueEnd, startInc, endInc);
        case bobj.crv.params.DataTypes.DATE_TIME:
        case bobj.crv.params.DataTypes.DATE:
        case bobj.crv.params.DataTypes.TIME:
            return this.datetimesInBounds(valueStart, valueEnd, startInc, endInc);
        case bobj.crv.params.DataTypes.BOOLEAN:
        default:
            return true;
        }
    },

    stringsInBounds: function(valueStart, valueEnd, startInc, endInc) {
        if (!valueStart || !valueEnd)
            return true;

        valueStart = valueStart.toLocaleUpperCase();
        valueEnd = valueEnd.toLocaleUpperCase();

        var compareResult = valueStart.localeCompare(valueEnd);

        // Find out if the strings only differ by one character (the last character)
        var differsByLastChar = false;
        var lastCharCodeIsAdjacent = false;
        if ((compareResult == -1) && (valueStart.length == valueEnd.length)) {
            for (var i = 0; i < valueStart.length; i++) {
                if (valueStart.charAt(i).localeCompare(valueEnd.charAt(i)) != 0) {
                    if (i == (valueStart.length - 1)) {
                        differsByLastChar = true;
                        if (valueStart.charCodeAt(i) + 1 == valueEnd.charCodeAt(i)) {
                            lastCharCodeIsAdjacent = true;
                        }
                    }
                    break;
                }
            }
        }

        return (compareResult <= 0 &&
               (compareResult < 0 || (startInc && endInc)) &&
               (!lastCharCodeIsAdjacent || startInc || endInc || !differsByLastChar));
    },

    numbersInBounds: function(valueStart, valueEnd, startInc, endInc) {
        if (isNaN(valueStart) || isNaN(valueEnd)) {
            return true;
        }
        return (valueStart <= valueEnd && (valueStart < valueEnd || (startInc && endInc)));
    },

    datetimesInBounds: function(valueStart, valueEnd, startInc, endInc) {
        if (!valueStart || !valueEnd) {
            return true;
        }
        return (valueStart <= valueEnd && (valueStart < valueEnd || (startInc && endInc)));
    }
});

//Interval Endpoint Indicator (Creating Icon)
sap.m.FlexBox.extend("IntervalEndpointIndicator", {

    renderer: "sap.m.FlexBoxRenderer",

    constructor: function(mSettings) {
        sap.m.FlexBox.call(this, mSettings);
        this.addItem(new sap.ui.core.Icon({
            src: "sap-icon://sys-cancel",
            color: mSettings.color,
            size: mSettings.size
        }));
        this.addItem(new sap.ui.core.Icon({
            src: "sap-icon://less",
            color: mSettings.color,
            size: mSettings.size
        }));
        this.addItem(new sap.ui.core.Icon({
            src: "sap-icon://sys-cancel",
            color: mSettings.color,
            size: mSettings.size
        }));
    },

    update: function(oRange) {
        var bStartInc = oRange[START_PART] ? oRange[START_PART].inc : undefined;
        var bEndInc = oRange[END_PART] ? oRange[END_PART].inc : undefined;
        var icons = this.getItems();
        if (bStartInc == undefined) {
            icons[0].setSrc("sap-icon://sys-cancel");
        } else {
            if (bStartInc == true) {
                icons[0].setSrc("sap-icon://circle-task-2");
            } else {
                icons[0].setSrc("sap-icon://circle-task");
            }
        }
        if (bEndInc == undefined) {
            icons[2].setSrc("sap-icon://sys-cancel");
        } else {
            if (bEndInc == true) {
                icons[2].setSrc("sap-icon://circle-task-2");
            } else {
                icons[2].setSrc("sap-icon://circle-task");
            }
        }
    }
});

// Inclusive Value Selection
sap.m.Button.extend("RangeDropDownArrow", {

    renderer: "sap.m.ButtonRenderer",

    constructor: function(mSettings) {
        sap.m.Button.call(this, {
            icon: "sap-icon://vertical-grip",
            layoutData: new sap.m.FlexItemData({baseSize: "2rem"}),
            type: sap.m.ButtonType.Transparent,
            press: function (oEvent) {
                if (!this._oPopover) {
                    this._oPopover = new RangeDropDown({
                        bindingInput: mSettings.bindingInput
                    });
                    this.addDependent(this._oPopover);
                }
                this._oPopover.openBy(oEvent.getSource());
            }
        });
    },

    setButtonEnabled: function(bEnabled) {
        this.setEnabled(bEnabled);
        // Clean the popover when no value, otherwise the focus info is incorrect
        if (bEnabled == false) {
            if (this._oPopover) {
                this.removeDependent(this._oPopover);
                delete this._oPopover;
            }
        }
    }
});

sap.m.Popover.extend("RangeDropDown", {

    renderer: "sap.m.PopoverRenderer",

    constructor: function(mSettings) {
        sap.m.Popover.call(this, {
            contentMinWidth: "7.5rem",
            showHeader: false,
            showArrow: false,
            title: "",
            offsetX: 0,
            placement: sap.m.PlacementType.PreferredBottomOrFlip,
            enabled: false
        });

        var fnOnPress = function (sInclusiveValue) {
            var including = undefined;

            if (sInclusiveValue == "nobound") {
                including = undefined;
            } else {
                if (sInclusiveValue == "include") {
                    including = true;
                }
                else if (sInclusiveValue == "exclude") {
                    including = false;
                }
            }

            mSettings.bindingInput.setInclusive(including);
            mSettings.bindingInput.notifyAll({
                result: true,
                inc: including
            });

            this.close();
        };

        var inclusiveList = new sap.m.List({
            mode: sap.m.ListMode.None
        });
        inclusiveList.addItem(new sap.m.CustomListItem({
            content: new sap.m.Button({
                text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("IncludeValueText"),
                icon: "sap-icon://circle-task-2",
                type: sap.m.ButtonType.Transparent,
                width: "100%",
                press: fnOnPress.bind(this, "include")
            })
        }));
        inclusiveList.addItem(new sap.m.CustomListItem({
            content: new sap.m.Button({
                text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ExcludeValueText"),
                icon: "sap-icon://circle-task",
                type: sap.m.ButtonType.Transparent,
                width: "100%",
                press: fnOnPress.bind(this, "exclude")
            })
        }));
        inclusiveList.addItem(new sap.m.CustomListItem({
            content: new sap.m.Button({
                text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("NoBoundText"),
                icon: "sap-icon://sys-cancel",
                type: sap.m.ButtonType.Transparent,
                width: "100%",
                press: fnOnPress.bind(this, "nobound")
            })
        }));

        this.addContent(inclusiveList);
    }
});

// ConditionRangeInput
sap.m.FlexBox.extend("ConditionRangeInput", {

    renderer: "sap.m.FlexBoxRenderer",

    constructor: function(oSettings) {
        this.promptData = oSettings.promptData;

        this.oRangeInput = CreateRangeInput({
            promptData: oSettings.promptData,
            options: oSettings.options,
            viewerName: oSettings.viewerName,
            skipBoundsCheck: false
        });

        this.oOperator = new SelectOperator({
            width: "10.5rem"
        });
        this.oOperator.addStyleClass("sapUiSmallMarginEnd");

        // Initialze UI
        this.updateInput(0);

        oSettings.items = [this.oOperator, this.oRangeInput];
        oSettings.renderType = sap.m.FlexRendertype.Bare;
        sap.m.FlexBox.call(this, oSettings);
    },

    getRangeInput: function() {
        return this.oRangeInput;
    },

    getOperatorSelect: function () {
        return this.oOperator;
    },

    cleanInput: function() {
        this.oRangeInput.cleanInput();
    },

    isEmpty: function() {
        var noStart = this.oRangeInput.getPartInput(START_PART).isEmpty();
        var noRange = this.oRangeInput.isEmpty();
        var isBetween = (parseInt(this.oOperator.getSelectedKey()) == 1 || parseInt(this.oOperator.getSelectedKey()) == 8);

        return (!isBetween && noStart) || (isBetween && noRange);
    },

    validate: function() {
        var result;
        var isBetween = parseInt(this.oOperator.getSelectedKey()) == 1 || parseInt(this.oOperator.getSelectedKey()) == 8;
        var oRange = this.oRangeInput.validate();
        if (!isBetween) {
            var oStart = this.oRangeInput.getPartInput(START_PART).validate();
            result = oStart.result;
        } else {
            var noStart = this.oRangeInput.getPartInput(START_PART).isEmpty();
            var noEnd = this.oRangeInput.getPartInput(END_PART).isEmpty();
            // Need start value
            if (noStart && !noEnd) {
                this.oRangeInput.getPartInput(START_PART).setInputFail(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
            }
            // Need end value
            if (!noStart && noEnd) {
                this.oRangeInput.getPartInput(END_PART).setInputFail(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
            }
            // Single bound is not allowed
            result = oRange.result && !noStart && !noEnd;
        }

        this.updateAddButton(result);

        var oEvent = {
            result: result
        };

        oEvent[CONDITION_VALUE] = parseInt(this.oOperator.getSelectedKey());
        if (oRange[START_PART] != undefined) {
            oEvent[START_PART] = oRange[START_PART];
        }
        if (oRange[END_PART] != undefined) {
            oEvent[END_PART] = oRange[END_PART];
        }

        return oEvent;
    },

    setValue: function(value) {
        this.oRangeInput.setValue(value);

        var conditionValue = value ? value[CONDITION_VALUE] : 0;
        this.updateInput(conditionValue);
    },

    updateAddButton: function(isValid) {
        if (isValid && !this.isEmpty()) {
            this.oRangeInput.getAddButton().setEnabled(true);
        } else {
            this.oRangeInput.getAddButton().setEnabled(false);
        }
    },

    updateInput: function(conditionValue) {
        // Operator
        this.oOperator.setSelectedKey(conditionValue);
        var isBetween = (conditionValue == 1 || conditionValue == 8);
        // RangeInput
        var rangeInput = this.oRangeInput;
        rangeInput.getPartArrow(START_PART).setVisible(false);
        rangeInput.getPartArrow(END_PART).setVisible(false);
        rangeInput.getRangeIcon().setVisible(false);
        rangeInput.getPartInput(END_PART).setVisible(isBetween);
        if (isBetween) {
            rangeInput.getPartInput(START_PART).setPlaceholder(sap.ui.getCore().getModel("ui5ResourceBundle").getText("hintRangeStart"));
            rangeInput.getPartInputUnit(START_PART).setWidth("50%");
            rangeInput.getPartInputUnit(END_PART).setWidth("50%");
            rangeInput.getPartInputUnit(END_PART).addStyleClass("sapUiSmallMarginBegin");
        } else {
            rangeInput.getPartInput(START_PART).setPlaceholder(sap.ui.getCore().getModel("ui5ResourceBundle").getText("hintDiscrete"));
            rangeInput.getPartInputUnit(START_PART).setWidth("100%");
            rangeInput.getPartInput(END_PART).setInclusive(undefined);
        }
    },

    attachOperatorChange: function(OperatorChange) {
        this.oOperator.attachChange(OperatorChange);
    },

    attachAddAction: function(addAction) {
        this.oRangeInput.attachAddAction(addAction);
        // Rangeinput's attachAddAction always reset the width, should set it back here.
        this.updateInput(0);
    }
});

sap.m.Select.extend("SelectOperator", {

    renderer: "sap.m.SelectRenderer",

    constructor: function(mSettings) {
        sap.m.Select.call(this, mSettings);

        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("Equal"), key: 0}));
        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("NotEqual"), key: 7}));
        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("Greater"), key: 2}));
        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("GreaterEqual"), key: 3}));
        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("Less"), key: 4}));
        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("LessEqual"), key: 5}));
        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("Between"), key: 1}));
        this.addItem(new sap.ui.core.Item( {text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("NotBetween"), key: 8}));
    }
});