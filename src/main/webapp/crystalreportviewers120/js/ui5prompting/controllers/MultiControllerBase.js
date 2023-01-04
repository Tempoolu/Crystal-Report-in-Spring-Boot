jQuery.sap.require("ui5prompting.utils.Formatter");
jQuery.sap.declare("ui5prompting.controllers.MultiControllerBase.Discrete");
jQuery.sap.declare("ui5prompting.controllers.MultiControllerBase.Range");

var START_PART = bobj.crv.fiori.range.START_PART;
var END_PART = bobj.crv.fiori.range.END_PART;
var RANGE_TOKEN = bobj.crv.fiori.range.RANGE_TOKEN;

ui5prompting.controllers.MultiControllerBase.Range = {

    updateValues: function(oEvent) {
        var curVals = this.getModelValues();
        var valuesObj = this.getValueObj(oEvent);
        for (var i = 0; i < valuesObj.length; i++) {
            var index = curVals.findIndex(function(x) { return this.isEqual(x, valuesObj[i]); }.bind(this));
            if (index == -1) {
                curVals.push(valuesObj[i]);
            } else {
                curVals[index] = valuesObj[i];
            }
        }
        // remove duplicates
        for (var j = 0; j < curVals.length; j++) {
            if (!curVals[j][RANGE_TOKEN]) {
                curVals.splice(j, 1);
            }
        }
        this.setModelValues(curVals);
    },

    onRemoveValues: function(aRemovedIds) {
        for (var i = 0; i < aRemovedIds.length; i++) {
            var curVals = this.getModelValues();
            var index = curVals.findIndex(function(x) { return x[RANGE_TOKEN].value == aRemovedIds[i]; });
            if (index != -1) {
                curVals.splice(index, 1);
            }
            this.setModelValues(curVals);
        }
        this.updateAll(this.typeValidation());
    },

    typeValidation: function() {
        if (this.isValueRequired()) {
            this.getView().getMultiInput().setValueStateText(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
            return false;
        }
        return true;
    },

    getValueObj: function(oEvent) {
        var values = [];
        if (oEvent[START_PART] || oEvent[END_PART]) {
            var valueHolder = this.generateRangeObj(oEvent);
            if (valueHolder[RANGE_TOKEN]) {
                values.push(valueHolder);
            }
        } else if (oEvent.values) {
            var newValues = oEvent.values;
            for (var i = 0; i < newValues.length; i++) {
                values.push(this.generateRangeObj(newValues[i]));
            }
        }

        return values;
    },

    generateRangeObj: function(oValue) {
        var range = {};
        if (oValue[START_PART]) {
            range[START_PART] = oValue[START_PART];
        }
        if (oValue[END_PART]) {
            range[END_PART] = oValue[END_PART];
        }

        if (oValue[START_PART] || oValue[END_PART]) {
            var formattedValue = ValueFormatter.FormatRangeForDisplay(oValue);
            range[RANGE_TOKEN] = {
                value: formattedValue,
                labels: [formattedValue],
                labelsPair: formattedValue
            };
        }

        return range;
    },

    removeAll: function() {
        var curVals = this.getModelValues();
        curVals.splice(0, curVals.length);
        this.setModelValues(curVals);
        this.updateAll(this.typeValidation());
    },

    setValues: function(values) {
        if (values && values.length > 0) {
            this.updateValues({values: values});
        }
        this.updateAll(this.typeValidation());
    },

    isEqual: function(oRange1, oRange2) {
        return this.isPartEqual(oRange1[START_PART], oRange2[START_PART])
            && this.isPartEqual(oRange1[END_PART], oRange2[END_PART]);
    },

    isPartEqual: function(oRangePart1, oRangePart2) {
        if (!oRangePart1 && !oRangePart2) {
            return true;
        } else if ((oRangePart1 && !oRangePart2) || (!oRangePart1 && oRangePart2)) {
            return false;
        } else {
            return (oRangePart1.value == oRangePart2.value && oRangePart1.inc == oRangePart2.inc);
        }
    }
}

ui5prompting.controllers.MultiControllerBase.Discrete = {

    updateValues: function(oEvent) {
        var valuesObj = this.getValueObj(oEvent);
        var curVals = this.getModelValues();
        for (var i = 0; i < valuesObj.length; i++) {
            var index = curVals.findIndex(function(x) { return x.value == valuesObj[i].value; });
            if (index == -1)
                curVals.push(valuesObj[i]);
            else
                curVals[index] = valuesObj[i];
        }
        this.setModelValues(curVals);
    },

    onRemoveValues: function(aRemovedIds) {
        for (var i = 0; i < aRemovedIds.length; i++) {
            var curVals = this.getModelValues();
            var index = curVals.findIndex(function(v){ return v.value == aRemovedIds[i].value; });
            if (index != -1) {
                curVals[index].selected = false;
                curVals.splice(index, 1);
            }
            this.setModelValues(curVals);
        }
        this.updateAll(this.typeValidation());
    },

    typeValidation: function() {
        if (this.isValueRequired()) {
            this.getView().getMultiInput().setValueStateText(sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueRequired"));
            return false;
        }
        return true;
    },

    getValueObj: function(oEvent) {
        var values = [];
        if (oEvent.value != undefined) {
            values.push({
                value: oEvent.value,
                labels: oEvent.labels,
                labelsPair: oEvent.labelsPair
            });
        } else if (oEvent.values) {
            values = oEvent.values;
        }

        return values;
    },

    removeAll: function() {
        this.getModelValues().forEach(function(v) {
            v.selected = false;
        })
        this.setModelValues([]);
        this.updateAll(this.typeValidation());
    },

    setValues: function(values) {
        if (values && values.length > 0)
            this.updateValues({values : values});
        this.updateAll(this.typeValidation());
    }
}