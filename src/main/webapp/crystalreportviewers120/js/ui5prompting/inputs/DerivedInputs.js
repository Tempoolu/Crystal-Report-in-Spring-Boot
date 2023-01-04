/* ===================================================== Helper Functions/Objects ===================================================== */

function CreateInputUnit(oSettings) {
    // rename
    var type = oSettings.promptData.valueDataType;
    if (oSettings.placeholder == undefined) {
        oSettings.placeholder = sap.ui.getCore().getModel("ui5ResourceBundle").getText("hintDiscrete");
    }

    return new InputUnit(oSettings);
};

sap.m.FlexBox.extend("NullCheckBox", {

    renderer: "sap.m.FlexBoxRenderer",
    
    constructor: function (oSettings) {
        sap.m.FlexBox.call(this, {
            justifyContent: sap.m.FlexJustifyContent.End,
            items: [
                new sap.m.CheckBox({
                    text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("NullValueLabel"),
                    enabled: '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_ENABLED, oSettings.promptData, oSettings.viewerName) + '}',
                    selected: '{' + ModelPathBuilder.BuildFullValuePath(ModelPathBuilder.VALUE_ISNULL, oSettings.promptData, oSettings.viewerName) + '}',
                    visible: oSettings.promptData.allowNullValue
                })
            ]
        });
    }
})

// InputUnit
sap.m.FlexBox.extend("InputUnit", {

    renderer: "sap.m.FlexBoxRenderer",

    constructor: function (oSettings) {
        var needExValueHelp = false;
        var type = oSettings.promptData.valueDataType;
        switch (type) {
            case bobj.crv.params.DataTypes.STRING:
                this.oInput = new StringInput(oSettings);
                break;
            case bobj.crv.params.DataTypes.CURRENCY:
            case bobj.crv.params.DataTypes.NUMBER:
                this.oInput = new NumberInput(oSettings);
                break;
            case bobj.crv.params.DataTypes.BOOLEAN:
                this.oInput = new BooleanInput(oSettings);
                break;
            case bobj.crv.params.DataTypes.DATE_TIME:
                this.oInput = new DateTimeInput(oSettings);
                needExValueHelp = true;
                break;
            case bobj.crv.params.DataTypes.DATE:
                this.oInput = new DateInput(oSettings);
                needExValueHelp = true;
                break;
            case bobj.crv.params.DataTypes.TIME:
                this.oInput = new TimeInput(oSettings);
                needExValueHelp = true;
                break;
            default:
                // TODO: Logging, how are we going to handle?
                console.error("Tried to create unknown component type: " + type);
        }

        // If this is a single DATE_TIME/DATE/TIME input with LOV, we need to render an extra LOV button beside the Input
        if (needExValueHelp && this.oInput.needShowValueHelp()) {
            this.oInput.setWidth("calc(100% - 2rem)");
            var oExValueHelp = new sap.m.Button({
                icon: "sap-icon://value-help",
                layoutData: new sap.m.FlexItemData({ baseSize: "2rem" }),
                type: sap.m.ButtonType.Default,
                enabled: {
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
                },
                press: function (oEvent) {
                    sap.ui.getCore().getEventBus().publish(bobj.crv.fiori.event.UI_CHANNEL, bobj.crv.fiori.event.ON_FOCUS, { unitID: oSettings.promptData.lovNetworkID , promptID: oSettings.promptData.id,  updateSummary: true });
                    this.oInput.openLovDialog();
                }.bind(this)
            });
            oSettings.items = [this.oInput, oExValueHelp];
        } else {
            this.oInput.setWidth("100%");
            oSettings.items = [this.oInput];
        }

        if (oSettings.width == undefined) {
            oSettings.width = "100%";
        }
        oSettings.renderType = sap.m.FlexRendertype.Bare;
        sap.m.FlexBox.call(this, oSettings);
    },

    getInput: function () {
        return this.oInput;
    }
});

/* ================================================== Derived Base Components ===================================================== */
'use strict';
jQuery.sap.require("ui5prompting.inputs.BaseInput");

// StringInput
ui5prompting.inputs.BaseInput.extend("StringInput", {
    renderer: "sap.m.InputRenderer",

    constructor: function(oSettings) {
        ui5prompting.inputs.BaseInput.call(this, oSettings);
    },

    getSubmitValue: function() {
        var sValue = this.getValue();
        if (sValue != "")
            return sValue;
    },

    getCurrentValue: function() {
        return this.getValue();
    },

    getCRValidationValue: function() {
        return this.getCurrentValue();
    }

});

ui5prompting.inputs.BaseInput.extend("NumberInput", {

    renderer: "sap.m.InputRenderer",

    constructor: function(oSettings) {
        oSettings.type = "Number";
        ui5prompting.inputs.BaseInput.call(this, oSettings);
    },

    getSubmitValue: function() {
        var newValue = this.getCurrentValue();
        if (!isNaN(newValue))
           return newValue;
    },

    getCurrentValue: function() {
        return parseFloat(this.getValue());
    },

    getCRValidationValue: function() {
        return this.getCurrentValue();
    }

});

//BooleanInput
ui5prompting.inputs.BaseSelectInput.extend("BooleanInput", {

    renderer: "sap.m.SelectRenderer",

    constructor: function(oSettings) {
        oSettings.width = "100%";
        oSettings.allowShowValueHelp = false;
        oSettings.forceSelection = false;
        ui5prompting.inputs.BaseSelectInput.call(this, oSettings);

        this.boolOpts = oSettings.options.booleanFormat;
        for (var propName in this.boolOpts) {
            this.addItem(new sap.ui.core.Item( {text: this.boolOpts[propName], key: propName}));
        }
    },

    getSubmitValue: function() {
        var sKey = this.getCurrentValue();
        if (sKey)
            return sKey == "true";
    },

    getCurrentValue: function() {
        var selItem = this.getSelectedItem();
        if (selItem)
            return selItem.getKey();
    },

    getCRValidationValue: function() {
        return this.getSubmitValue();
    },

    setValue: function (bool) {
        if (typeof bool == "string" && bool && bool.length > 0 || typeof bool == "boolean") {
            this.setSelectedKey(bool);
        }
    }
});

// Redefine constants just to shorten the expressions. These will not be exported (see 'use strict')
var DATE_PREFIX = bobj.crv.fiori.date.DATE_PREFIX;
var DATETIME_PREFIX = bobj.crv.fiori.date.DATETIME_PREFIX;
var TIME_PREFIX = bobj.crv.fiori.date.TIME_PREFIX;
var DATE_SUFFIX = bobj.crv.fiori.date.DATE_SUFFIX;
var DATE_SEP = bobj.crv.fiori.date.DATE_SEP;

// DateInput
ui5prompting.inputs.BaseDateInput.extend("DateInput", {

    constructor: function(oSettings) {
        oSettings.displayFormat = oSettings.options.dateFormat;
        ui5prompting.inputs.BaseDateInput.call(this, oSettings);
    },

    getSubmitValue: function() {
        var oDate = this.getCurrentValue();
        if (oDate) {
            return  DATE_PREFIX + oDate.getFullYear() + DATE_SEP + supplyZero(oDate.getMonth() + 1) + DATE_SEP + supplyZero(oDate.getDate()) + DATE_SUFFIX;
        }
    },

    parseSubmitValue: function(sDate) {
        var numList = sDate.substring(DATE_PREFIX.length, sDate.length - DATE_SUFFIX.length).split(DATE_SEP);
        if (numList.length == 3)
            return new Date(numList[0], numList[1]-1, numList[2]);
    }

});

// DateTimeInput
ui5prompting.inputs.BaseDateTimeInput.extend("DateTimeInput", {

    constructor: function(oSettings) {
        oSettings.displayFormat = oSettings.options.dateTimeFormat;
        ui5prompting.inputs.BaseDateTimeInput.call(this, oSettings);
    },

    getSubmitValue: function() {
        var oDateTime = this.getCurrentValue();
        if (oDateTime) {
            return DATETIME_PREFIX + oDateTime.getFullYear() + DATE_SEP + supplyZero(oDateTime.getMonth() + 1) + DATE_SEP + supplyZero(oDateTime.getDate()) + DATE_SEP +
                    supplyZero(oDateTime.getHours()) + DATE_SEP + supplyZero(oDateTime.getMinutes()) + DATE_SEP + supplyZero(oDateTime.getSeconds()) + DATE_SUFFIX;
        }
    },

    parseSubmitValue: function(sDate) {
        var numList = sDate.substring(DATETIME_PREFIX.length, sDate.length - DATE_SUFFIX.length).split(DATE_SEP);
        if (numList.length == 6)
            return new Date(numList[0], numList[1]-1, numList[2], numList[3], numList[4], numList[5]);
    }

});

// TimeInput
ui5prompting.inputs.BaseTimeInput.extend("TimeInput", {

    constructor: function(oSettings) {
        if (oSettings.width == undefined) {
            oSettings.width = "100%";
        }
        oSettings.displayFormat = oSettings.options.timeFormat;
        ui5prompting.inputs.BaseTimeInput.call(this, oSettings);
    },

    getSubmitValue: function() {
        var oTime = this.getCurrentValue();
        if (oTime) {
            return TIME_PREFIX + supplyZero(oTime.getHours()) + DATE_SEP + supplyZero(oTime.getMinutes()) + DATE_SEP + supplyZero(oTime.getSeconds()) + DATE_SUFFIX;
        }
    },

    parseSubmitValue: function(sDate) {
        var numList = sDate.substring(TIME_PREFIX.length, sDate.length - DATE_SUFFIX.length).split(DATE_SEP);
        if (numList.length == 3)
            return new Date(0, 0, 0, numList[0], numList[1], numList[2]);
    }

});

function supplyZero(sParam) {
    sParam += "";
    for (var i = sParam.length; i < 2; i++) {
        sParam = '0'+sParam;
    }
    return sParam;
};