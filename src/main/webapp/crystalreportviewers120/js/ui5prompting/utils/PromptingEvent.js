
var PromptingEvent = function() {
};

PromptingEvent.NEEDS_RELOAD = "needsReload";
PromptingEvent.FETCH_LOV = "FetchLOV";
PromptingEvent.SEARCH_LOV = "SearchLOV";
PromptingEvent.SET_LOGON = "SetLogon";
PromptingEvent.FETCH_LOGON = "FetchLogon";
PromptingEvent.FETCH_LOV_COMPLETE = "FetchLOVComplete";
PromptingEvent.SEARCH_COMPLETE = "SearchLOVComplete";
PromptingEvent.SET_LOGON_COMPLETE = "SetLogonComplete";
PromptingEvent.FETCH_LOGON_COMPLETE = "FetchLogonComplete";
PromptingEvent.FETCH_LOV_ERROR = "FetchLOVError";
PromptingEvent.SEARCH_ERROR = "SearchLOVError";
PromptingEvent.SET_LOGON_ERROR = "SetLogonError";
PromptingEvent.FETCH_LOGON_ERROR = "FetchLogonError";
PromptingEvent.USE_DELEGATED_SEARCH = "UseDelegatedSearch";

PromptingEvent.createFetchLOVEvent = function(httpHandler, callback, lovNetworkID, promptIDs,
        promptValues, startIndex, endIndex, dependentPromptIDs, dependentPromptValues, path) {
    var arg = {
        "eventType" : "nextGenPromptingFetchLOV",
        "lovNetworkUUID" : lovNetworkID,
        "promptUUIDs" : promptIDs,
        "promptValues" : promptValues,
        "dependentPromptUUIDs" : dependentPromptIDs,
        "dependentPromptValues" : dependentPromptValues,
        "startIndex" : startIndex,
        "endIndex" : endIndex,
        "path" : path
    };
    
    httpHandler.request(arg, callback);
};

PromptingEvent.createSearchLOVEvent = function(httpHandler, callback, lovNetworkID, promptID, searchString,
        useDelegatedSearch, dependentPromptIDs, dependentPromptValues) {
    var eventArgs = {
        "eventType" : "nextGenPromptingSearchLOV",
        "lovNetworkUUID" : lovNetworkID,
        "promptUUID" : promptID,
        "dependentPromptUUIDs" : dependentPromptIDs,
        "dependentPromptValues" : dependentPromptValues,
        "searchString" : searchString,
        "delegatedSearch" : useDelegatedSearch
    };

    httpHandler.request(eventArgs, callback);
};

PromptingEvent.createFetchLogonEvent = function(token, lovNetworkID) {
    var eventArgs = {
        "eventType" : "nextGenPromptingFetchLogon",
        "lovNetworkUUID" : lovNetworkID
    };

    return new PromptingEvent(FETCH_LOGON, token, eventArgs);
};
