var ScrollSyncManager = function(oSummarys, oPrompts, oPromptData, sViewerName) {
    this.promptUnits = {};
    this.promptPrompts = {};

    this.promptData = oPromptData;
    this.viewerName = sViewerName
    this.summary = oSummarys;
    this.prompt = oPrompts;

    sap.ui.getCore().getEventBus().subscribe(bobj.crv.fiori.event.UI_CHANNEL, bobj.crv.fiori.event.ON_FOCUS, this.onFocus, this);
};

ScrollSyncManager.prototype.clear = function() {
    sap.ui.getCore().getEventBus().unsubscribe(bobj.crv.fiori.event.UI_CHANNEL, bobj.crv.fiori.event.ON_FOCUS, this.onFocus, this);
};

ScrollSyncManager.prototype.onFocus = function(sChannel, sEvent, oEvent) {
    var sUnitID = oEvent.unitID;
    var sPromptID = oEvent.promptID;

    var oPromptContent = undefined;
    if (this.promptData.promptUnits) {
        for (var i = 0; i < this.promptData.promptUnits.length; i++) {
            var oUnit = this.promptData.promptUnits[i];
            if (oUnit.id != sUnitID)
                continue;

            var oUnitSummary = this.summary.getContent();
            var oUnitPrompt = this.prompt.getContent()[i];

            for (var j = 0; j < oUnit.prompts.length; j++) {
                var oPrompt = oUnit.prompts[j];
                if (oPrompt.id != sPromptID)
                    continue;
                oPromptContent = oEvent.updateSummary ? oUnitSummary[j + i].$() : oUnitPrompt.getContent()[0].getItems()[j].$().parent();
            }
        }
    }

    var oScrollArea = oEvent.updateSummary ? this.summary.$() : this.prompt.$();

    var nTop = 0;
    if (oPromptContent)
        nTop += oPromptContent.offset().top - oScrollArea.offset().top;

    // element scroll to top
    if (nTop < 0) {
        oScrollArea.scrollTop(oScrollArea.scrollTop() + nTop);
    }
    // element scroll to bottom
    if (nTop + oPromptContent.outerHeight() > oScrollArea.outerHeight()) {
        var a = oScrollArea.scrollTop();
        var b = oPromptContent.outerHeight();
        var c = oScrollArea.outerHeight();
        oScrollArea.scrollTop(oScrollArea.scrollTop() + nTop + oPromptContent.outerHeight() - oScrollArea.outerHeight());
    }

    this.setSelection(sUnitID, sPromptID);
    this.enableValidation(sUnitID, sPromptID);
}

ScrollSyncManager.prototype.enableValidation = function(sUnitId, sPromptId) {
    for (var i = 0; i < this.promptData.promptUnits.length; i++) {
        var oUnit = this.promptData.promptUnits[i];
        for (var j = 0; j < oUnit.prompts.length; j++) {
            var oPrompt = oUnit.prompts[j];
            if (oUnit.id == sUnitId && oPrompt.id == sPromptId) {
                var sPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_INITIAL, oPrompt);
                sap.ui.getCore().getModel(ModelPathBuilder.GetViewModleName(this.viewerName)).setProperty(sPath, false);
            }
        }
    }
}

ScrollSyncManager.prototype.setSelection = function(sUnitId, sPromptId) {
    for (var i = 0; i < this.promptData.promptUnits.length; i++) {
        var oUnit = this.promptData.promptUnits[i];
        for (var j = 0; j < oUnit.prompts.length; j++) {
            var oPrompt = oUnit.prompts[j];
            var sPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_SELECTED, oPrompt);
            if (oUnit.id == sUnitId && oPrompt.id == sPromptId) {
                sap.ui.getCore().getModel(ModelPathBuilder.GetViewModleName(this.viewerName)).setProperty(sPath, true);
            } else {
                sap.ui.getCore().getModel(ModelPathBuilder.GetViewModleName(this.viewerName)).setProperty(sPath, false);
            }
        }
    }
}