'use strict'
jQuery.sap.includeStyleSheet(bobj.crvUri("../../css/ui5prompting.css"));

// PromptUnit Definition (Wrapping FlexBox)
sap.m.FlexBox.extend("PromptUnitFlexBox", {

    renderer: "sap.m.FlexBoxRenderer",

    constructor: function(id, mSettings) {
        sap.m.FlexBox.call(this, id, mSettings);
        this.addStyleClass("promptUnitFlex");
    }

});

// PromptPanel Definition (Wrapping Panel)
sap.m.Panel.extend("PromptPanel", {
    metadata: {
        properties: {
            selected: {type: "boolean", defaultValue: false}
        }
    },

    renderer: "sap.m.PanelRenderer",

    constructor: function(id, mSettings) {
        sap.m.Panel.call(this, id, mSettings);
        this.addStyleClass("promptPanel");
    },

    setSelected: function(bSelected) {
        bSelected = this.validateProperty("selected", bSelected);
        this.toggleStyleClass("promptPanelSelected", bSelected);
        this.setProperty("selected", bSelected, true);
    },

    getSelected: function() {
        return this.getProperty("selected");
    }
});
