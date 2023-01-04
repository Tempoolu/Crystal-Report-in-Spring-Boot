"use strict";

var TableType = {
    MAIN : 1,
    SEARCH : 2,
    SELECTION : 3
};

sap.m.TableSelectDialog.extend("ui5prompting.inputs.FlatLovDialog", {
    metadata: {
        properties: {
            lazyLoad: {type: "boolean", defaultValue: false},
            totalLovSize: {type: "number", defaultValue: -1},
            actualLovSize: {type: "number", defaultValue: 0}
        }
    },

    constructor: function (oSettings) {
        this.selectionModel = new sap.ui.model.json.JSONModel();
        this.selectedValues = [];
        var oPromptData = this.promptData = oSettings.promptData;
        var sViewerName = oSettings.viewerName;
        this.options = oSettings.options;
        this.allowMultiValue = oSettings.allowMultiSelect;

        this.modelName = ModelPathBuilder.GetViewModleName(sViewerName);
        this.lovPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOV, oPromptData);
        this.searchLovResultPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSEARCH, oPromptData);
        this.searchExceedPath = ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSEARCHEXCEED, oPromptData);
        this.showSelected = false;

        oSettings.title = sap.ui.getCore().getModel("ui5ResourceBundle").getText("ChooseValues") + " " + oPromptData.name;

        oSettings.items = {
            path: this.lovPath,
            template: new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({text: "{labels/0}"}),
                    new sap.m.Text({text: "{labels/1}"})
                ],
                visible: "{= ${disable} ? false : true}",
                selected: "{selected}",
                customData: [
                    new sap.ui.core.CustomData({
                        key: "value",
                        value: "{}"
                    })
                ]
            })
        };

        oSettings.columns = [
            new sap.m.Column({header: new sap.m.Text({text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueHeader")})}),
            new sap.m.Column({header: new sap.m.Text({text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("DescriptionHeader")})})
        ];

        oSettings.search =  function (oEvent) {
            var sValue = oEvent.getParameter("value");
            if (sValue && sValue.length > 0) {
                sap.ui.getCore().getEventBus().publish(oPromptData.id, bobj.crv.fiori.event.SEARCH_LOV, {
                    text : sValue,
                    callback : function(aValues) {
                        this._enforceSelection(this.selectedValues, aValues, false);
                    }.bind(this)
                });
                this._showTable(TableType.SEARCH);
            } else {
                this._showTable(TableType.MAIN);
            }
        };

        oSettings.confirm = function(oEvent) {
            if (this.confirmCB) {
                this.confirmCB(this.selectedValues);
            }
        }

        oSettings.busyIndicatorDelay = 0;
        oSettings.rememberSelections = false;
        oSettings.multiSelect = this.allowMultiValue;
        oSettings.busy = '{' + ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVBUSY, oPromptData) + '}';
        oSettings.lazyLoad = '{' + ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVGROWING, oPromptData) + '}';
        oSettings.totalLovSize = '{' + ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVTOTAL, oPromptData) + '}';
        oSettings.actualLovSize = '{' + ModelPathBuilder.BuildPath(ModelPathBuilder.VIEW_LOVSIZE, oPromptData) + '}';

        sap.m.TableSelectDialog.call(this, oSettings);

        this.bindModel();

        if (this._oTable && this._oDialog) {
            this._updateSelectionIndicator = function() {
                var iSelectedContexts = this.selectedValues.reduce(function(accumulator, currentValue) {
                    return accumulator += currentValue.isLov ? 1 : 0;
                }, 0);
                this.oSelectionButton.setText(iSelectedContexts);
            };
            
            // remember selection for calc two times difference
            this.open = function(aCurrentValues) {
                if (aCurrentValues) {
                    this.selectedValues = aCurrentValues;
                } else {
                    this.selectedValues = [];
                }
                sap.m.TableSelectDialog.prototype.open.call(this);
                var aData = sap.ui.getCore().getModel(this.modelName).getProperty(this.lovPath);
                if (aData) {
                    this._enforceSelection(this.selectedValues, aData, true);
                } else {
                    if (!this.getBusy()) // if it is busy loading, means it trigger by dcp and it should not have pre defiend value
                        sap.ui.getCore().getEventBus().publish(oPromptData.id, bobj.crv.fiori.event.FETCH_LOV, { 
                            callback: function(aValues) {
                                this._enforceSelection(this.selectedValues, aValues, true);
                            }.bind(this)
                        });
                }
                
                this._showTable(TableType.MAIN);
            }

            this._customizeMainTable();
            this._customizeSearchTable();
            this._customizeSelectedTable();
        }
    },
    
    attachSelected: function(cb) {
        this.confirmCB = cb;
    },

    setLazyLoad: function(bLazy) {
        this.lazyLoad = bLazy;
    },
    
    setActualLovSize: function(n) {
        this.actualLovSize = n;
    },
    
    getActualLovSize: function() {
        return this.actualLovSize;
    },

    getLazyLoad: function() {
        return this.lazyLoad;
    },
    
    setTotalLovSize: function(n) {
        this.totalLovSize = n;
        if (n > 0) {
            this._oTable.setGrowingScrollToLoad(false);
            this._oTable._getSelectAllCheckbox().setVisible(true)
        } else {
            this._oTable.setGrowingScrollToLoad(true);
            this._oTable._getSelectAllCheckbox().setVisible(false)
        }
    },
    
    getTotalLovSize: function() {
        return this.totalLovSize; 
    },
    
    _cleanSearchTable: function() {
        sap.ui.getCore().getModel(this.modelName).setProperty(this.searchLovResultPath, []);
        sap.ui.getCore().getModel(this.modelName).setProperty(this.searchExceedPath, false);
        this._oSearchTable.removeSelections(true);
    },
    
    _getSourceByTableType: function(eTableType, bData) {
        switch(eTableType) {
        case TableType.MAIN: 
            return bData ? sap.ui.getCore().getModel(this.modelName).getProperty(this.lovPath) : this._oTable;
        case TableType.SEARCH: 
            return bData ? sap.ui.getCore().getModel(this.modelName).getProperty(this.searchLovResultPath) : this._oSearchTable;
        case TableType.SELECTION:
            return bData ? this.selectionModel.getProperty("/select") : this._oSelectionTable;
        }
    },
    
    _onSelectionChange: function(oEvent, eTableType) {
        var param = oEvent.getParameters();
        var oSource = this._getSourceByTableType(eTableType, false);
        // select/de-select all
        if (param.selectAll || (oSource.getSelectedItems().length == 0 && !param.selected && param.listItems.length > 1)) {
            var aLovs = this._getSourceByTableType(eTableType, true);
            
            if (eTableType == TableType.MAIN) {
                // for large lov, select all need to delegate
                if (param.selected && this.getLazyLoad()) {
                    sap.ui.getCore().getEventBus().publish(this.promptData.id, bobj.crv.fiori.event.FETCH_LOV, {
                        callback: function(results) {
                            this._setSelectedValue(results, false, true);
                            this._updateSelectionIndicator();
                        }.bind(this),
                        all: true
                    });
                } else {
                    this._setSelectedValue(aLovs, !param.selected);
                }
            } else {
                this._setSelectedValue(aLovs, !param.selected);
            }
        } else {
            this._setSelectedValue([param.listItem.data("value")], !param.selected);
        }
        this._updateSelectionIndicator();
    },
    
    _enforceSelection: function(aValues, aTarget, bFast) {
        if (aTarget && aTarget.length > 0) {
            for (var i = 0; i < aValues.length; i++) {
                if (aValues[i].selected && bFast)
                    continue;
                for (var j = 0; j < aTarget.length; j++) {
					var targetValue = aTarget[j].value;
                	if((typeof aValues[i].value) == "number")
                		targetValue = parseFloat(aTarget[j].value);
                    if (targetValue == aValues[i].value) {
                        aTarget[j].selected = true;
                        aValues[i] = aTarget[j];
                        break;
                    }
                }
            }
            
            sap.ui.getCore().getModel(this.modelName).refresh();
        }
    },
    
    _setSelectedValue: function() {
        if (this.allowMultiValue) {
            this._setMultiSelectedValue.apply(this, arguments);
        } else {
            this._setSingleSelectedValue.apply(this, arguments);
        }
    },
    
    _setSingleSelectedValue: function(oValue) {
        if (this.selectedValues.length > 0) 
            this.selectedValues[0] = oValue[0];
        else 
            this.selectedValues.push(oValue[0]);
    },

    _setMultiSelectedValue: function(aValues, bRemove, bAll) {
        aValues.map(function(v) { v.selected = !bRemove; });
        // opt performance for very large lov
        if (bAll) {
            if (bRemove)
                this.selectedValues = [];
            else 
                this.selectedValues = aValues.slice(0);
        } else {
            for (var i = 0; i < aValues.length; i++) {
                if (!bRemove) {
                    // add to selected 
                    var nSIndex = this.selectedValues.findIndex(function(v) { return v.value == aValues[i].value; });
                    if (nSIndex == -1)
                        this.selectedValues.push(aValues[i]);
                } else {
                    // remove from selected
                    var nRIndex = this.selectedValues.findIndex(function(v) { return v.value == aValues[i].value; });
                    if (nRIndex != -1)
                        this.selectedValues.splice(nRIndex, 1);                
                }
            }
        }
    },
    
    _resetScroll: function() {
        var dom = this._oDialog.$().find("section.sapMDialogSection");
        dom.scrollTop(0);
    },
    
    _showTable: function(type) {
        this._oTable.setVisible(type == TableType.MAIN);
        this._oSearchTable.setVisible(type == TableType.SEARCH);
        this._oSelectionTable.setVisible(type == TableType.SELECTION);
        
        // to enhance performance make main table empty if possible
        if (type == TableType.MAIN) {
            this._oTable.getBinding("items").filter([]);
            this._resetScroll();
            if (this.showSelected) {
                this.showSelected = false;
                this.oSelectionButton.setPressed(false);
            }
        } else {
            var oFilter = new sap.ui.model.Filter({
                path : "labels/0", 
                test : function(item) { return false; },
            });
            this._oTable.getBinding("items").filter([oFilter]);
        }
        
        this.oSelectionButton.setEnabled(type != TableType.SEARCH);

        if (type == TableType.SELECTION) {
            this.selectionModel.setProperty("/select", this.selectedValues.slice());
        }
    },
    
    _customizeMainTable: function() {
        this._oTable.setGrowing(true);
        this._oTable.setGrowingThreshold(this.options.maxNumParameterDefaultValues);
        this._oTable.setGrowingScrollToLoad(true);

        this._oTable.attachSelectionChange(function (oEvent) {
            this._onSelectionChange(oEvent, TableType.MAIN);
        }.bind(this));

        // lazy load
        this._oTable.attachUpdateStarted(function(oEvent) {
            if (this.getLazyLoad() && oEvent.getParameters().reason == 'Growing') {
                if (oEvent.getParameters().actual + this.options.maxNumParameterDefaultValues > this.getActualLovSize())
                    sap.ui.getCore().getEventBus().publish(this.promptData.id,  bobj.crv.fiori.event.FETCH_LOV, { 
                        growing: true, 
                        callback : function(aValues) {
                            this._enforceSelection(this.selectedValues, aValues, false);
                        }.bind(this)});
            }
        }.bind(this));
    },
    
    _customizeSearchTable: function() {
        this._oSearchTable = new sap.m.Table({
            items: {
                path: this.searchLovResultPath,
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({text: "{labels/0}"}),
                        new sap.m.Text({text: "{labels/1}"})
                    ],
                    selected: "{selected}",
                    customData: [
                        new sap.ui.core.CustomData({
                            key: "value",
                            value: "{}"
                        })
                    ]
                })
            },
            
            infoToolbar: new sap.m.Toolbar({
                visible: false,
                active: false,
                content: [
                    new sap.m.Label({
                        text: this._oTable.getInfoToolbar().getContent()[0].getText()
                    })
                ]
            }),
            
            headerToolbar: new sap.m.Toolbar({
                visible: '{' + this.searchExceedPath + '}',
                active: false,
                content: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://message-warning"
                    }).addStyleClass("lovNotificationFont"),
                    new sap.m.Text({
                        text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("SearchExceedLimit")
                    }).addStyleClass("lovNotificationFont")
                ]
            }).addStyleClass("lovNotificationBar").setModel(sap.ui.getCore().getModel(this.modelName)),

            columns: [
                new sap.m.Column({header: new sap.m.Text({text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueHeader")})}),
                new sap.m.Column({header: new sap.m.Text({text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("DescriptionHeader")})})
            ],
            selectionChange: function (oEvent) {
                this._onSelectionChange(oEvent, TableType.SEARCH);
                if (!this.allowMultiValue) {
                    this._fireConfirmAndUpdateSelection();
                    this._oDialog.close();
                }
            }.bind(this),
            growing: true,
            growingThreshold: this.options.maxNumParameterDefaultValues,
            growingScrollToLoad: false
        });
        
        if (this.allowMultiValue) {
            this._oSearchTable.setMode(sap.m.ListMode.MultiSelect);
            this._oSearchTable.setIncludeItemInSelection(true);
        } else {
            this._oSearchTable.setMode(sap.m.ListMode.SingleSelectMaster);
        }
        this._oSearchTable.setModel(sap.ui.getCore().getModel(this.modelName));
        this._oSearchTable.setVisible(false);
        this._oDialog.addContent(this._oSearchTable)
    },
    
    _customizeSelectedTable: function() {
        this.oSelectionButton = new sap.m.ToggleButton({
            icon : "sap-icon://complete",
            text : 0,
            tooltip : sap.ui.getCore().getModel("ui5ResourceBundle").getText("toolTipShowAllSelected"),
            press: function() {
                this.showSelected = !this.showSelected;
                this._showTable(this.showSelected ? TableType.SELECTION : TableType.MAIN);
            }.bind(this)
        });
        //this.oSelectionButton.setLayoutData(new sap.m.ToolbarLayoutData({minWidth : "7.375rem"}));

        this._oDialog.setSubHeader(new sap.m.Toolbar ({
            content: [
                this._oSearchField,
                this.oSelectionButton
            ]
        }));
        
        this._oSelectionTable = new sap.m.Table({
            items: {
                path: "/select",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({text: "{labels/0}"}),
                        new sap.m.Text({text: "{labels/1}"})
                    ],
                    selected: "{selected}",
                    customData: [
                        new sap.ui.core.CustomData({
                            key: "value",
                            value: "{}"
                        })
                    ]
                })
            },
            
            infoToolbar: new sap.m.Toolbar({
                visible: false,
                active: false,
                content: [
                    new sap.m.Label({
                        text: this._oTable.getInfoToolbar().getContent()[0].getText()
                    })
                ]
            }),

            columns: [
                new sap.m.Column({header: new sap.m.Text({text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("ValueHeader")})}),
                new sap.m.Column({header: new sap.m.Text({text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("DescriptionHeader")})})
            ],
            // sync selection to main dialog
            selectionChange: function (oEvent) {
                this._onSelectionChange(oEvent, TableType.SELECTION);
            }.bind(this),
            growing: true,
            growingThreshold: this.options.maxNumParameterDefaultValues,
            growingScrollToLoad: false
        });
        
        if (this.allowMultiValue) {
            this._oSelectionTable.setMode(sap.m.ListMode.MultiSelect);
            this._oSelectionTable.setIncludeItemInSelection(true);
        } else {
            this._oSelectionTable.setMode(sap.m.ListMode.SingleSelectMaster);
        }
        this._oSelectionTable.setModel(this.selectionModel);
        this._oSelectionTable.setVisible(false);
        this._oDialog.addContent(this._oSelectionTable)

    },

    bindModel: function() {
        this.setModel(sap.ui.getCore().getModel(this.modelName));
    },

    unbindModel: function() {
        this.setModel(null);
    }
});
