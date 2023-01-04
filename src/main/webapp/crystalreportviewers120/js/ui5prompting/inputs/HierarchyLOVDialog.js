"use strict";

sap.m.P13nDialog.extend("ui5prompting.inputs.HierarchyLOVDialog", {

    renderer: "sap.m.P13nDialogRenderer",

    constructor: function (oSettings) {
        var oPromptData = oSettings.promptData;
        var sViewerName = oSettings.viewerName;
        var sViewId = oSettings.baseInputId;
        var sModelName = ModelPathBuilder.GetViewModleName(sViewerName);
        this.lovPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOV, oPromptData);
        var sSearchLovResultPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSEARCH, oPromptData);
        this.allowMultiValue = oSettings.allowMultiSelect;
        var sSelectMode = this.allowMultiValue ? "MultiSelect" :"SingleSelectMaster";
        var nCurrentViewIndex = 0;
        var oCurrentSelectedValues = [];
        var oCurrentRemovedValues = [];
        var oHiddenLovFields = oPromptData.hiddenLovFields;

        sap.m.P13nDialog.call(this, {

            id: sViewId + "P13nDialog",

            title: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ChooseValues") + " " + oPromptData.name,

            subHeader: [
                new sap.m.Toolbar ({
                    content: [
                        new sap.m.SearchField({
                            search: function(oEvent) {
                                var bClearButtonPressed = oEvent.getParameter("clearButtonPressed");
                                sap.ui.getCore().getModel(sModelName).setProperty(sSearchLovResultPath, []);
                                if (!bClearButtonPressed) {
                                    var sSearchText = oEvent.getParameter("query");
                                    var oEventBus = sap.ui.getCore().getEventBus();
                                    oEventBus.publish(
                                        oPromptData.id, bobj.crv.fiori.event.SEARCH_LOV,
                                        {
                                            text: sSearchText,
                                            callback: function(targetValues) {
                                                sap.ui.getCore().byId(sViewId + "P13nDialog").enforceSelection(targetValues);
                                            }
                                        }
                                    );
                                    
                                    sap.ui.getCore().byId(sViewId + "P13nDialog").switchViews(1);
                                }
                                else {
                                    sap.ui.getCore().byId(sViewId + "P13nDialog").switchViews(0);
                                }
                            },
                        }),

                        new sap.m.Button({
                            id: sViewId + "Button",
                            
                            text: "0",
                            
                            icon : "sap-icon://complete",
                            
                            tooltip : sap.ui.getCore().getModel("ui5ResourceBundle").getText("toolTipShowAllSelected"),

                            press: function(oEvent) {
                                sap.ui.getCore().getModel(sModelName).setProperty(sSearchLovResultPath, []);
                                if (nCurrentViewIndex != 2) {
                                    var copyCurrentSelectedValues = oCurrentSelectedValues.slice(0);
                                    sap.ui.getCore().getModel(sModelName).setProperty(sSearchLovResultPath, copyCurrentSelectedValues);
                                    sap.ui.getCore().byId(sViewId + "P13nDialog").switchViews(2);
                                }
                                else {
                                    sap.ui.getCore().byId(sViewId + "P13nDialog").switchViews(0);
                                }
                                
                            },
                        })
                    ]
                })
            ],

            content: [
                new sap.m.Tree({

                    id: sViewId + "Tree",

                    mode: sSelectMode,

                    items: {
                        path: this.lovPath,
                        parameters: {
                            arrayNames: ['lov']
                        },
                        template: new sap.m.StandardTreeItem({
                            title: "{labelsPair}",
                            selected: "{selected}"
                        })
                    },

                    toggleOpenState: function(oEvent) {
                        var bExpanded = oEvent.getParameter("expanded");

                        if (bExpanded) {
                            var oItemContext = oEvent.getParameter("itemContext");
                            var sContextPath = oItemContext.getPath();
                            var lovPathNextLevel = sContextPath + "/lov";
                            var oPromptDataNextLevel = sap.ui.getCore().getModel(sModelName).getProperty(lovPathNextLevel);
                            //Only send fetch lov request if next level prompt data has not been fetched
                            if (oPromptDataNextLevel.length == 1 && oPromptDataNextLevel[0].placeholder){
                                var lovObj = sap.ui.getCore().getModel(sModelName).getProperty(sContextPath);

                                var lovObjCopy = jQuery.extend(true, {}, lovObj);

                                var path = lovObjCopy.path;
                                delete lovObjCopy.lov;
                                delete lovObjCopy.path;
                                delete lovObjCopy.labelsPair;
                                delete lovObjCopy.children;

                                var pathValues = new Array();
                                path.values.push(lovObjCopy);

                                sap.ui.getCore().getEventBus().publish(
                                    oPromptData.id,
                                    bobj.crv.fiori.event.FETCH_LOV,
                                    {
                                        path: path,
                                        lovPathFetchValuesNode: sContextPath,
                                        lovPathNextLevel: lovPathNextLevel,
                                        callback: function(targetValues) {
                                            sap.ui.getCore().byId(sViewId + "P13nDialog").enforceSelection(targetValues);
                                        },
                                        promptID: oPromptData.id
                                    }
                                );
                            }
                        }
                    },
                    
                    selectionChange: function(oEvent) {
                        var treeItem = oEvent.getParameters("listItem");
                        //when selecting all values: selectAll==true&&selected==true, deseleting all values: selectAll==false&&selected==false
                        if (treeItem.selectAll != treeItem.selected){
                                var itemContextPath = treeItem.listItems[0].getItemNodeContext().context.getPath();
                                var lovObj = sap.ui.getCore().getModel(sModelName).getProperty(itemContextPath);
                                sap.ui.getCore().byId(sViewId + "P13nDialog").setSelectedValues(lovObj, treeItem.selected);
                        }else{
                                var treeListItems = treeItem.listItems;
                                for(var i=0;i<treeListItems.length;i++){
                                        var itemContextPath = treeListItems[i].getItemNodeContext().context.getPath();
                                        var lovObj = sap.ui.getCore().getModel(sModelName).getProperty(itemContextPath);
                                        sap.ui.getCore().byId(sViewId + "P13nDialog").setSelectedValues(lovObj, treeItem.selected);
                                }
                        }
                        sap.ui.getCore().byId(sViewId + "P13nDialog").updateSelectionIndicator();
                    }
                }),
                
                new sap.m.List({

                    id: sViewId + "SearchList",

                    mode: sSelectMode,

                    items: {
                        path: sSearchLovResultPath,
                        template: new sap.m.StandardListItem({
                            title: "{labelsPair}",
                            selected: "{selected}"
                        }).addStyleClass("hierachyLOVDialogFontStyle")
                    },

                    selectionChange : function (oEvent) {
                        var searchListItem = oEvent.getParameters("listItem");
                        var itemContextPath = searchListItem.listItems[0].getBindingContext().getPath();
                        var lovObj = sap.ui.getCore().getModel(sModelName).getProperty(itemContextPath);
                        sap.ui.getCore().byId(sViewId + "P13nDialog").setSelectedValues(lovObj, searchListItem.selected);
                        sap.ui.getCore().byId(sViewId + "P13nDialog").updateSelectionIndicator();
                    }
                })
            ],

            ok: function (oEvent) {
                if (this.confirmCB) {
                    this.confirmCB(oCurrentSelectedValues, oCurrentRemovedValues);
                }
                oEvent.getSource().close();
            },

            cancel: function (oEvent) {
                oEvent.getSource().close();
            },

            busy: '{' + ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVBUSY, oPromptData) + '}',
            busyIndicatorDelay: 0
        });

        this.attachSelected = function(cb) {
            this.confirmCB = cb;
        }.bind(this);

        this.removeSelection = function(index) {
            if (index == 0) {
                var oTree = sap.ui.getCore().byId(sViewId + "Tree");
                oTree.removeSelections(true);
            }
            else if (index == 1) {
                var searchList = sap.ui.getCore().byId(sViewId + "SearchList");
                searchList.removeSelections(true);
            }
            
        };

        this.setSelectedValues = function(oValue, bSelected) {
            if (this.allowMultiValue) {
                if (bSelected) {   
                    var index = oCurrentRemovedValues.findIndex(function(v) {return v.value == oValue.value;});                        
                    if (index != -1) {
                        oCurrentRemovedValues.splice(index, 1);
                    }
                    oCurrentSelectedValues.push(oValue);
                }
                else {
                    var index = oCurrentSelectedValues.findIndex(function(v) {return v.value == oValue.value;});                        
                    if (index != -1) {
                        oCurrentSelectedValues.splice(index, 1);
                    }
                    oCurrentRemovedValues.push(oValue);
                }
            }
            else {
                oCurrentSelectedValues = [];
                oCurrentRemovedValues = [];
                oCurrentSelectedValues.push(oValue);
            }
        };
        
        this.enforceSelection = function(targetValues) {
            if (targetValues && targetValues.length > 0) {
                for (var i = 0; i < oCurrentSelectedValues.length; i++) {
                    for (var j = 0; j < targetValues.length; j++) {
                        if (targetValues[j].value == oCurrentSelectedValues[i].value) {
                            targetValues[j].selected = true;
                            oCurrentSelectedValues[i] = targetValues[j];
                        }
                    }
                }
                
                sap.ui.getCore().getModel(sModelName).refresh();
            }
        };
        
        this.switchViews = function(index) {
            sap.ui.getCore().byId(sViewId + "Tree").setVisible(index == 0);
            sap.ui.getCore().byId(sViewId + "SearchList").setVisible(index == 1 || index == 2);

            if (index == 0) {
                sap.ui.getCore().byId(sViewId + "Button").setEnabled(true);
            }
            else if (index == 1) {
                sap.ui.getCore().byId(sViewId + "Button").setEnabled(false);
            }
            else if (index == 2) {
                sap.ui.getCore().byId(sViewId + "Button").setEnabled(true);
            }
            
            nCurrentViewIndex = index;
        };

        this.updateSelectionIndicator = function () {
            sap.ui.getCore().byId(sViewId + "Button").setText(oCurrentSelectedValues.length);
        };

        this.open = function(oLastSelectedItems) {
            sap.ui.getCore().getEventBus().publish(
                oPromptData.id,
                bobj.crv.fiori.event.FETCH_LOV,
                {
                    lovPathNextLevel: this.lovPath,
                    callback: function(targetValues) {
                        this.enforceSelection(targetValues);
                    }.bind(this),
                    promptID: oPromptData.id
                }
            );

            sap.ui.getCore().byId(sViewId + "Tree").collapseAll();

            oCurrentSelectedValues = oLastSelectedItems ? oLastSelectedItems : [];
            oCurrentRemovedValues = [];
            for (var index in oCurrentSelectedValues) {
                oCurrentSelectedValues[index].labelsPair = "";
                oCurrentSelectedValues[index].selected = true;
                if (oCurrentSelectedValues[index].labels) {
                    for (var i in oCurrentSelectedValues[index].labels) {
                        if (oHiddenLovFields.findIndex(function(v) {return v == i;}) != -1) {
                            continue;
                        }
                        oCurrentSelectedValues[index].labelsPair += oCurrentSelectedValues[index].labelsPair == "" ? 
                        oCurrentSelectedValues[index].labels[i] : " - " + oCurrentSelectedValues[index].labels[i];
                    }
                }
            }        

                this.updateSelectionIndicator();

            this.switchViews(0);
            sap.m.P13nDialog.prototype.open.call(this);
        };

        //for unit test
        this.getItems = function() {
            var oItems = sap.ui.getCore().byId(sViewId + "Tree").getItems();
            return oItems;
        };
        
        //for unit test
        this.getNSelectedValues = function() {
            return oCurrentSelectedValues.length;
        };

        //for unit test
        this.getNRemovedValues = function() {
            return oCurrentRemovedValues.length;
        };

        this.setModel(sap.ui.getCore().getModel(sModelName));
    }
});