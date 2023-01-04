var HTTPRequestHandler = function(servletURL, rptSrcKey, reportState, useSavedData, bridge, viewerName, viewerType) {
    
    this._sServletUrl = servletURL;
    this._sReportSrcKey = rptSrcKey;
    this._sReportState = reportState;
    this._bUseSavedData = useSavedData;
    this.bridge = bridge;
    this.viewerName = viewerName;
    this.viewerType = viewerType;
    
    this.setUseSavedData = function(b) {
        this._bUseSavedData = b;
    }
    
    this.request = function (arg, callBack) {
        arg.savedData = this._bUseSavedData;
        var pageState = bobj.crv.stateManager.getCompositeState();
        
        if ("dotnet" == this.viewerType) {
            this.bridge.sendAsyncRequest(viewerName, {
                "crprompt": "PromptingEvent", "EventArgument": encodeURIComponent(JSON.stringify(arg)),
                "token": arg.lovNetworkUUID
            }, callBack);
        } else if ("restful" == this.viewerType) {
            this._restfulRequest(arg, callBack);
        } else {
            jQuery.ajax(this._sServletUrl, {
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                data: jQuery.param({
                    "ServletTask": "PromptingEvent",
                    "ReportSourceKey": this._sReportSrcKey,
                    "ReportStateInfo": encodeURIComponent(this._sReportState),
                    "EventArgument": encodeURIComponent(JSON.stringify(arg)),
                    "CRVCompositeViewState": encodeURIComponent(JSON.stringify(pageState)),
                    "CRVEventTarget": this.viewerName,
                    "isUI5Request": "true"
                }),
                success: function(response) {
                    if (typeof(response) == "object") {
                        callBack(false, response);
                    }
                    else {
                        callBack(false, JSON.parse(response));
                    }
                },
                error: function (response) {
                    callBack(true, JSON.parse(response));
                }
            });
        }
    };

    this._lovQueryString = function (arg) {
        var result = "useSavedData=" + this._bUseSavedData;
        if (this._sReportState)
            result += "&" + this._sReportState;
        for (var key in arg) {
            if (arg[key]) {
                result += "&";
                if (Array.isArray(arg[key]) || typeof arg[key] === 'object')
                    result += encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(arg[key]));
                else
                    result += encodeURIComponent(key) + "=" + encodeURIComponent(arg[key]);
            }
        }
        return result;
    }

    this._restfulRequest = function (arg, callBack) {
        switch (arg.eventType) {
            case "nextGenPromptingFetchLOV":
            case "nextGenPromptingSearchLOV": {
                jQuery.ajax(this._sServletUrl + "/v1/infostore/" + this._sReportSrcKey + "/rpt/prompts/" + arg.lovNetworkUUID + "/lovs", {
                    type: "GET",
                    headers: {
                        "x-sap-logontoken": BILaunchpadApp.getlogonToken(),
                        "Accept": "application/json"
                    },
                    data: this._lovQueryString(arg),
                    success: function (response) {
                        if (response.message && response.error_code) {
                            sap.m.MessageBox.warning(response.message);
                            callBack(true, response);
                        } else {
                            callBack(false, response);
                        }
                    },
                    error: function (response) {
                        sap.m.MessageBox.error(response.responseJSON.message);
                        callBack(true, response.responseJSON);
                    }
                });
                break;
            }
            default: {
                // unsupported request
                callBack();
                break;
            }
        }
    }
};
