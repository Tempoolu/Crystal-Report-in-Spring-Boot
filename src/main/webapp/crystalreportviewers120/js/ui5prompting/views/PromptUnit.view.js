'use strict'
jQuery.sap.require("ui5prompting.views.PromptComponentViews");

sap.ui.jsview("ui5prompting.views.PromptUnit", {
    
    getControllerName : function() {
        return "ui5prompting.controllers.PromptUnit";
    },
 
    createContent : function(oController) {
        oController.setDependencyManager(this.getViewData().dependencyManager);
        //Create prompt widgets
        var aPromptUnitComponents = [];
        var oUnit = this.getViewData().promptUnit;
        
        if (oUnit.prompts) {
            for (var j = 0; j < oUnit.prompts.length; j++) {
                // Passing to the prompt view of a specific type
                var sViewName = bobj.crv.fiori.GetViewName(oUnit.prompts[j]);
                var oWidgetView = sap.ui.view({
                    viewName : sViewName,
                    type : sap.ui.core.mvc.ViewType.JS,
                    viewData : {
                        // width: "auto",
                        promptData : oUnit.prompts[j],
                        viewerName : this.getViewData().viewerName,
                        options : this.getViewData().options,
                        dependencyManager: this.getViewData().dependencyManager
                    }
                });
                oController.addPromptDependency(oWidgetView.getController());
                aPromptUnitComponents.push(oWidgetView);
            }
        }

        return new PromptUnitFlexBox({
            direction: "Column",
            items: aPromptUnitComponents
        });
    }

});
