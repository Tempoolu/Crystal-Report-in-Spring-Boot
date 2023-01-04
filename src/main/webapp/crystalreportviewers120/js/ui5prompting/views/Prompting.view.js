sap.ui.jsview("ui5prompting.views.Prompting", {

    promptData : undefined,

    getControllerName : function() {
        return "ui5prompting.controllers.Prompting";
    },

    createContent : function(oController) {
        var rawData = this.getViewData().getPromptData();
        var oPromptData = typeof rawData == "string" ? JSON.parse(rawData) : rawData;
        var sViewerName = this.getViewData().viewerName;
        var sViewerType = this.getViewData().viewerType;
        var rptSrcKey = this.getViewData().rptSrcKey;
        var servletURL = this.getViewData().servletURL;
        if (oPromptData && !jQuery.isEmptyObject(oPromptData)) {

            oController.setParameterBridge(this.getViewData().getParameterBridge());
            //Build JSON model
            oController.createModel(oPromptData, sViewerName, sViewerType);
            oController.createDependencyMananger(rptSrcKey, servletURL, this.getViewData().getReportState, this.getViewData().getUseSavedData);

            //Prompting view consists of PromptSummary, and ValueSelect
            var oPromptSummaryView = sap.ui.view({
                viewName: "ui5prompting.views.PromptSummary",
                type: sap.ui.core.mvc.ViewType.JS,
                height: "100%",
                viewData : {
                    promptData: oPromptData,
                    viewerName: sViewerName
                }
            });

            var oPromptValueSelectView = sap.ui.view({
                viewName: "ui5prompting.views.PromptValueSelect",
                type: sap.ui.core.mvc.ViewType.JS,
                height: "100%",
                viewData : {
                    options: oPromptData.options,
                    promptUnits: oPromptData.promptUnits,
                    viewerName: sViewerName,
                    dependencyManager: oController.getDependencyManager()
                }
            });

            //TODO: should be moving this to components js
            oPromptSummaryView.addStyleClass("promptSummary");
            oPromptValueSelectView.addStyleClass("promptValueSelect");

            oController.addScrollSync(oPromptSummaryView.getScrollableArea(), oPromptValueSelectView.getScrollableArea());

            var leftPane = new sap.ui.layout.SplitPane("leftPane", {
                content: oPromptSummaryView,
                requiredParentWidth: 200
            });
            var oSplitterLayoutData= new sap.ui.layout.SplitterLayoutData({size: "25%"});
            leftPane.setLayoutData(oSplitterLayoutData);
            var rightPane = new sap.ui.layout.SplitPane({
                content: oPromptValueSelectView,
                requiredParentWidth: 600
            });
            var paneContainer = new sap.ui.layout.PaneContainer({
                panes: [leftPane, rightPane]
            });

            var allViews = new sap.ui.layout.ResponsiveSplitter("tempViews", {
                rootPaneContainer: paneContainer
            });
            return allViews;
        }
    }
});
