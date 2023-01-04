sap.ui.define([], function () {
    "use strict";
    return {
        formatValues: function(oValues, bIsNull) {
            if (!oValues || bIsNull) {
                return sap.ui.getCore().getModel("ui5ResourceBundle").getText("NullValue");
            } else if (oValues.length == 0
                || (oValues.length == 1 && oValues[0].value == undefined && oValues[0].start == undefined && oValues[0].end == undefined)) {
                return sap.ui.getCore().getModel("ui5ResourceBundle").getText("NoValue");
            } else {
                var strValues = "";

                for (var i = 0; i < oValues.length; i++) {
                    if (strValues.length > 0) {
                        strValues += ", ";
                    }

                    if (oValues[i][START_PART] || oValues[i][END_PART]) {
                        strValues += ValueFormatter.FormatRangeForDisplay(oValues[i]);
                    } else {
                        strValues += ValueFormatter.FormatDiscreteForDisplay(oValues[i]);
                    }
                }

                return strValues;
            }
        }
    };
});

var ValueFormatter = function() {
}

ValueFormatter.FormatDiscreteForDisplay = function(oValue, isHierarchy) {
    if (oValue.labels.length > 1 && oValue.labels[1] && oValue.labels[1].length > 0)
        return oValue.labels[0] + ' - ' + oValue.labels[1]
    else
        return oValue.labels[0];
}

var START_PART = bobj.crv.fiori.range.START_PART;
var END_PART = bobj.crv.fiori.range.END_PART;
var CONDITION_VALUE = bobj.crv.fiori.range.CONDITION_VALUE;

ValueFormatter.FormatSimpleRangeForDisplay = function(oRange) {
    var oRangeStart = oRange[START_PART];
    var oRangeEnd = oRange[END_PART];
    var sRangeLabel = "";

    if (oRangeStart && oRangeStart.value != undefined) {
        sRangeLabel += (oRangeStart.inc == true) ? "[" : "(";
        sRangeLabel += ValueFormatter.FormatDiscreteForDisplay(oRangeStart);
    }
    else {
        sRangeLabel += "(" + sap.ui.getCore().getModel("ui5ResourceBundle").getText("NoBegin");
    }

    sRangeLabel += ", ";

    if (oRangeEnd && oRangeEnd.value != undefined) {
        sRangeLabel += ValueFormatter.FormatDiscreteForDisplay(oRangeEnd);
        sRangeLabel += (oRangeEnd.inc == true) ? "]" : ")";
    }
    else {
        sRangeLabel += sap.ui.getCore().getModel("ui5ResourceBundle").getText("NoEnd") + ")";
    }
    return sRangeLabel;
}

ValueFormatter.FormatRangeForDisplay = function(oValue) {
    var sRangeLabel = "";

    if (oValue[CONDITION_VALUE] == undefined) {
        return ValueFormatter.FormatSimpleRangeForDisplay(oValue);
    }

    var isBetween = oValue[CONDITION_VALUE] == 1 || oValue[CONDITION_VALUE] == 8;
    if (isBetween) {
        sRangeLabel = ValueFormatter.FormatSimpleRangeForDisplay(oValue);

        if (oValue[CONDITION_VALUE] == 8) {
            sRangeLabel = "!" + sRangeLabel;
        }

        return sRangeLabel;
    } else {
        sRangeLabel = ValueFormatter.FormatDiscreteForDisplay(oValue[START_PART]);

        switch (oValue[CONDITION_VALUE]) {
        case 0:
            return "= " + sRangeLabel;
        case 2:
            return "> " + sRangeLabel;
        case 3:
            return ">= " + sRangeLabel;
        case 4:
            return "< " + sRangeLabel;
        case 5:
            return "<= " + sRangeLabel;
        case 7:
            return "<> " + sRangeLabel;
        default:
            return sRangeLabel;
        }
    }
}