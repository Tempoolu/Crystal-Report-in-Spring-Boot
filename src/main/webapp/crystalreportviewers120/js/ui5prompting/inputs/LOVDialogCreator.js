jQuery.sap.require("ui5prompting.utils.ModelPathBuilder");
jQuery.sap.require("ui5prompting.inputs.FlatLOVDialog");
jQuery.sap.require("ui5prompting.inputs.HierarchyLOVDialog");

function CreateLOVDialog(oSettings) {
    if (oSettings.promptData.isHierarchy) {
        return new ui5prompting.inputs.HierarchyLOVDialog(oSettings);
    } else {
        return new ui5prompting.inputs.FlatLovDialog(oSettings);
    }
};
