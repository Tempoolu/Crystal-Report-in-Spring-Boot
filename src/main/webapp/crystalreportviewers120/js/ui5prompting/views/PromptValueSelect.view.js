sap.ui.jsview("ui5prompting.views.PromptValueSelect", {
    
    scrollArea : undefined,
    
    getScrollableArea: function() {
        return this.scrollArea;
    },
    
    getControllerName : function() {
        return "ui5prompting.controllers.PromptValueSelect";
    },
 
    createContent : function(oController) {
        var oPromptUnits = this.getViewData().promptUnits;
        var dependencyMananer = this.getViewData().dependencyManager;
        var aViewComponents = [];
        if (oPromptUnits) {            
            for (var i = 0; i < oPromptUnits.length; i++) {
               var oUnit = oPromptUnits[i];
               var oUnitView = sap.ui.view({
                   viewName: "ui5prompting.views.PromptUnit",
                   type: sap.ui.core.mvc.ViewType.JS,
                   viewData : {
                       promptUnit: oUnit,
                       viewerName: this.getViewData().viewerName,
                       options: this.getViewData().options,
                       dependencyManager: dependencyMananer
                   }
               });
               aViewComponents.push(oUnitView);
            }
        }
        
        this.scrollArea = new sap.m.ScrollContainer({
            width: "100%",
            height: "100%",
            horizontal: true,
            vertical: true,
            focusable: true,
            content: aViewComponents
        })
        

        var ohidePanelButtonModel = new sap.ui.model.json.JSONModel({
            hidePanelButtonTextKey: "HidePromptSummary"
        });
        sap.ui.getCore().setModel(ohidePanelButtonModel);
        var headerToolBox = new sap.m.OverflowToolbar({
            content: [
                new sap.m.ToolbarSpacer(),
                new sap.m.Title({
                    text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("PromptDetailTitle"),
                    level: sap.ui.core.TitleLevel.H1,
                    titleStyle: sap.ui.core.TitleLevel.H1,
                    textAlign: sap.ui.core.TextAlign.Center
                }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                    text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ActionButtonLabel"),
                    press: function(event) { 
                        if(!this.popover) {                  
                            this.popover = new sap.m.Popover({
                                showHeader: false,
                                placement: sap.m.PlacementType.Bottom,
                                content:[
                                    new sap.m.Button({
                                        text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ExpandAllPrompts"),
                                        type: sap.m.ButtonType.Transparent,
                                        press: function() {
                                            dependencyMananer.expandAll();
                                            this.getParent().close();
                                        }
                                    }),
                                    new sap.m.Button({
                                        text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("CollapseAllPrompts"),
                                        type: sap.m.ButtonType.Transparent,
                                        press: function() {
                                            dependencyMananer.collapseAll();
                                            this.getParent().close();
                                        }
                                    }),
                                    new sap.m.Button({
                                        text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ExpandOptionalPrompts"),
                                        type: sap.m.ButtonType.Transparent,
                                        press: function() {
                                            dependencyMananer.expandAll(true);
                                            this.getParent().close();
                                        }
                                    }),
                                    new sap.m.Button({
                                        text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("CollapseOptionalPrompts"),
                                        type: sap.m.ButtonType.Transparent,
                                        press: function() {
                                            dependencyMananer.collapseAll(true);
                                            this.getParent().close();
                                        }
                                    }),
                                    new sap.m.Button({
                                        text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("HidePromptSummary"),
                                        type: sap.m.ButtonType.Transparent,
                                        press: function() {                                        
                                            var leftPane = sap.ui.getCore().byId("leftPane");
                                            var btnTextKey = sap.ui.getCore().getModel().oData.hidePanelButtonTextKey;
                                            if(btnTextKey == "HidePromptSummary") {
                                                btnTextKey = "ShowPromptSummary";
                                                var btnText = sap.ui.getCore().getModel("ui5ResourceBundle").getText(btnTextKey);
                                                this.setText(btnText);
                                                var oSplitterLayoutData = new sap.ui.layout.SplitterLayoutData({size: "0%"});
                                                leftPane.setLayoutData(oSplitterLayoutData); 
                                            } else {
                                                btnTextKey = "HidePromptSummary";
                                                var btnText = sap.ui.getCore().getModel("ui5ResourceBundle").getText(btnTextKey);
                                                this.setText(btnText);
                                                var oSplitterLayoutData = new sap.ui.layout.SplitterLayoutData({size: "25%"});
                                                leftPane.setLayoutData(oSplitterLayoutData); 
                                            }  
                                            sap.ui.getCore().getModel().oData.hidePanelButtonTextKey = btnTextKey;
                                            this.getParent().close();
                                        }
                                    })
                                ]
                            }).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");
                        }
                        this.popover.openBy(event.getSource());
                    }
                })
            ]
        });

        return new sap.m.Panel({
            headerToolbar: headerToolBox,
            height: '100%',
            content: [this.scrollArea]
        });
    }
});
