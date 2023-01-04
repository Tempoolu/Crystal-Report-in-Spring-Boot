sap.m.Input.extend("NoEmptyInput", {
    renderer: "sap.m.InputRenderer",

    onAfterRendering: function(){
        sap.m.Input.prototype.onAfterRendering.call(this);
        this.valiate();
    },
    oninput: function(oEvent){
        sap.m.Input.prototype.oninput.call(this, oEvent);
        this.valiate();
    },
    onmousedown: function(oEvent){
        sap.m.Input.prototype.onmousedown.call(this, oEvent);
        this.valiate();
    },

    valiate: function(){
        if(this.getValue() == null || this.getValue().trim() == ""){
            this.setValueState(sap.ui.core.ValueState.Error);
            this.setValueStateText(sap.ui.getCore().getModel("ui5ResourceBundle").getText("NoValueText"));
        }else{
            this.setValueState(sap.ui.core.ValueState.Success);
        }
    }
});

sap.m.Dialog.extend("ui5prompting.views.LogonDialog", {
    renderer: "sap.m.DialogRenderer",

    constructor: function (id, mSettings) {
        mSettings.title = sap.ui.getCore().getModel("ui5ResourceBundle").getText("LogonTitle");
        mSettings.draggable = true;
        mSettings.verticalScrolling = true;
        mSettings.horizontalScrolling = false;
        mSettings.resizable = false;

        sap.m.Dialog.call(this, id, mSettings);
        this.addStyleClass('sapUiSizeCompact');

        var rawData = mSettings.adaptor.getPromptData(mSettings.viewerName);
        var oPromptData = typeof rawData == "string" ? JSON.parse(rawData) : rawData;
        this.logonModel = new sap.ui.model.json.JSONModel();
        this.logonModel.setProperty('/logons', oPromptData.logons);

        this.addContent(new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                columnsM: 1,
                columnsXL: 1,
                columnsL: 1
            }),
            formContainers: {
                path: '/logons',
                template: new sap.ui.layout.form.FormContainer({
                    formElements: [
                        new sap.ui.layout.form.FormElement({
                            label: '{serverLabel}',
                            fields: [
                                new sap.m.Text({
                                    text: '{server}'
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: '{dbLabel}',
                            fields: [
                                new sap.m.Text({
                                    text: '{db}',
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: '{userLabel}',
                            fields: [
                                new NoEmptyInput({
                                    value: '{user}'
                                })
                            ],

                        }),
                        new sap.ui.layout.form.FormElement({
                            label: '{pwLabel}',
                            fields: [
                                new NoEmptyInput({
                                    type: sap.m.InputType.Password,
                                    value: '{pw}'
                                    })
                            ]
                        })
                    ]
                })
            }
        }).setModel(this.logonModel));

        this.addButton(new sap.m.Button({
            text: sap.ui.getCore().getModel("ui5ResourceBundle").getText("OK"),
            press: function () {
                var aLogons = this.logonModel.getProperty('/logons');
                for(var i=0;i<aLogons.length;i++){
                    var oLogon = aLogons[i];
                    if(oLogon.user == null || oLogon.user.trim() == "" || oLogon.pw == null || oLogon.pw.trim() == "")
                        return;
                    if (oLogon.pw)
                        oLogon.pw = btoa(oLogon.pw);
                }
                mSettings.onCommit(mSettings.viewerName,aLogons);
                this.close();
            }.bind(this)
        }));
    }
});