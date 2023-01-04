'use strict'
jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");

sap.ui.jsview("ui5prompting.views.PromptSummary", {

    scrollArea: undefined,
    promptData: undefined,

    getControllerName: function() {
        return "ui5prompting.controllers.PromptSummary";
    },

    getScrollableArea: function() {
        return this.scrollArea;
    },

    createContent: function(oController) {
        var oPromptData = this.getViewData().promptData;
        var sViewerName = this.getViewData().viewerName;
        var sValuePath = null;
        var sSelectedPath = null;
        var sValidationPath = null;

        if (oPromptData) {
            var aLabels = [];
            if (oPromptData.promptUnits) {
                for (var i = 0; i < oPromptData.promptUnits.length; i++) {
                    var oUnit = oPromptData.promptUnits[i];
                    for (var j = 0; j < oUnit.prompts.length; j++) {
                        var oPrompt = oUnit.prompts[j];
                        sValuePath = {
                            parts: [
                                { path: ModelPathBuilder.BuildFullValuePath(ModelPathBuilder.VALUE_VALUES, oPrompt, sViewerName) },
                                { path: ModelPathBuilder.BuildFullValuePath(ModelPathBuilder.VALUE_ISNULL, oPrompt, sViewerName) }
                            ],
                            formatter: oController.formatter.formatValues
                        };

                        sSelectedPath = '{' + ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_SELECTED, oPrompt, sViewerName) + '}';
                        sValidationPath = {
                            parts: [
                                { path: ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_VALIDATION, oPrompt, sViewerName) },
                                { path: ModelPathBuilder.BuildFullViewPath(ModelPathBuilder.VIEW_INITIAL, oPrompt, sViewerName) },
                                { path: ModelPathBuilder.BuildFullValuePath(ModelPathBuilder.VALUE_ISNULL, oPrompt, sViewerName) }
                            ],
                            formatter: function(v, i, n) {
                                if (i) {
                                    return sap.ui.core.Priority.None;
                                } else if (v || n) {
                                    return sap.ui.core.Priority.Low;
                                } else {
                                    return sap.ui.core.Priority.High;
                                }
                            }
                        }
                        var oListItem = new sap.m.NotificationListItem({
                            title: oPrompt.fDescription,
                            selected: sSelectedPath,
                            description: sValuePath,
                            showCloseButton: false,
                            priority: sValidationPath
                        })
                        oListItem.sUnitId = oUnit.id;
                        oListItem.sPromptId = oPrompt.id;
                        oListItem.level = j;

                        oListItem.attachPress(function() {
                            sap.ui.getCore().getEventBus().publish(bobj.crv.fiori.event.UI_CHANNEL, bobj.crv.fiori.event.ON_FOCUS, { unitID: this.sUnitId, promptID: this.sPromptId,  updateSummary: false });
                        }.bind(oListItem));
                        
                        oListItem.addEventDelegate({
                            onAfterRendering: function() {
                                // indent
                                var dir = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";
                                this.$().find("div.sapMNLI-Header, div.sapMNLI-Body").css(dir, this.level + "rem");
                                
                                // change notification style
                                var priorityDiv = this.$().find("div.sapMNLB-Priority");
                                var domElements = "<div class='iconDivOuter' style='position:absolute;display:table;width:100%;height:100%;'>" + 
                                "<div class='iconDivInner' style='display:table-cell;vertical-align: middle;text-align: {1};'><span>{0}</span></div></div>";
                                if(dir == "left") {
                                    domElements = domElements.replace("{1}", "right");
                                } else {
                                    domElements = domElements.replace("{1}", "left");
                                }
                                if (priorityDiv.attr("class").indexOf("sapMNLB-Low") != -1) {
                                    priorityDiv.append(domElements.replace("{0}", "&#xe05b"));
                                } else if (priorityDiv.attr("class").indexOf("sapMNLB-High") != -1) {
                                    priorityDiv.append(domElements.replace("{0}", "&#xe03e"));
                                }
                                
                                // selection state
                                this.updateSelectedDOM(this.getSelected(), this.$());
                            }.bind(oListItem)
                        });
                        
                        aLabels.push(oListItem);
                    }
                }
            }

            this.scrollArea = new sap.m.ScrollContainer({
                width: "100%",
                height: "100%",
                horizontal: true,
                vertical: true,
                focusable: true,
                content: aLabels
            });

            return new sap.m.Panel({
                headerText: sap.ui.getCore().getModel("ui5ResourceBundle").getText("PromptSummaryTitle"),
                height: '100%',
                content: [this.scrollArea]
            });
        }
    }

});