/* Copyright (c) Business Objects 2006. All rights reserved. */

if (typeof (bobj) == 'undefined') {
    bobj = {};
}

// If we are in CAF, we need to return a relative URI
if (typeof (bobj.crvUri) == 'undefined') {
    bobj.crvUri = function (uri) {
        return  "../crystalreportviewers120/js/crviewer/" + uri;
    }
}

if (typeof (bobj.crv) == 'undefined') {
    bobj.crv = {};
}

// Similar method defined in crviewer/crv.js
if (typeof (bobj.crv._loadJavaScriptEx) == 'undefined') {
    bobj.crv._loadJavaScriptEx = function (jsonSpec) {
        if (jsonSpec && jsonSpec.src) {
            var scriptTag = "<script language=\"javascript\" src=\"" + jsonSpec.src + "\"";
            if (jsonSpec.props) {
                for (var key in jsonSpec.props) {
                    scriptTag += " " + key + "=\"" + jsonSpec.props[key] + "\"";
                }
            }
            scriptTag += "></script>";
            document.write(scriptTag);
        }
    };
}

//Bootstrap UI5 (we may not want to bootstrap fiori launchpad?)
if (typeof (BILaunchpadApp) == 'undefined') {
    var srcLoc;
	srcLoc = "https://openui5.hana.ondemand.com/1.70.0/resources/sap-ui-core.js ";
	/*srcLoc = '/Your project Name/openui5/resources/sap-ui-core.js';
	var request = new XMLHttpRequest();
    request.open('HEAD', srcLoc, false);
	request.send();*/

    bobj.crv._loadJavaScriptEx({
        src : bobj.nodeResources ? bobj.nodeResources : srcLoc,
        props : {
            "id" : "sap-ui-bootstrap",
            "data-sap-ui-libs" : "sap.ui.commons, sap.m, sap.ui.core",
            "data-sap-ui-theme" : "sap_belize",
            "data-sap-ui-compatVersion-sapMDialogWithPadding" : "edge"
        }
    });
}

if (typeof (bobj.crv.fiori) == 'undefined') {
    bobj.crv.fiori = {};

    // Config
    bobj.crv.fiori.config = {};
    bobj.crv.fiori.config.SIZE_LIMIT = 1000;

    // Constants
    bobj.crv.fiori.date = {};
    bobj.crv.fiori.date.DATE_PREFIX = "Date(";
    bobj.crv.fiori.date.DATETIME_PREFIX = "DateTime(";
    bobj.crv.fiori.date.TIME_PREFIX = "Time(";
    bobj.crv.fiori.date.DATE_SUFFIX = ")";
    bobj.crv.fiori.date.DATE_SEP = ",";

    bobj.crv.fiori.range = {};
    bobj.crv.fiori.range.START_PART = "start";
    bobj.crv.fiori.range.END_PART = "end";
    bobj.crv.fiori.range.CONDITION_VALUE = "rangeConditionValue";
    bobj.crv.fiori.range.RANGE_TOKEN = "rangetoken";

    // Events
    bobj.crv.fiori.event = {};
    bobj.crv.fiori.event.VALIDATE_VALUE = "ValidateValue";
    bobj.crv.fiori.event.FETCH_LOV = "nextGenPromptingFetchLOV";
    bobj.crv.fiori.event.SEARCH_LOV = "nextGenPromptingSearchLOV";
    bobj.crv.fiori.event.SET_LOGON = "nextGenPromptingSetLogon";
    bobj.crv.fiori.event.FETCH_LOGON = "nextGenPromptingFetchLogon";

    bobj.crv.fiori.event.UI_CHANNEL = "promptUIChannel";
    bobj.crv.fiori.event.ON_FOCUS = "onFocus";

    // Global Methods
    bobj.crv.fiori.GetViewName = function (oPromptData) {
        var range = oPromptData.allowRangeValue;
        var multi = oPromptData.allowMultiValue;
        var discrete = oPromptData.allowDiscreteValue ? oPromptData.allowDiscreteValue : !range;
        var conditionRange = oPromptData.IsConditionRange;

        if (multi) {
            if (conditionRange) {
                return "ui5prompting.views.MultiConditionRange";
            } else if(discrete && range) {
                return "ui5prompting.views.MultiDiscreteRange";
            } else if (range) {
                return "ui5prompting.views.MultiRange";
            } else {
            return "ui5prompting.views.MultiInput";
            }
        } else {
            if (conditionRange) {
                return "ui5prompting.views.ConditionRangeInput";
            } else if (range) {
                return "ui5prompting.views.RangeInput";
            } else {
                return "ui5prompting.views.DiscreteInput";
            }
        }
    };
}
