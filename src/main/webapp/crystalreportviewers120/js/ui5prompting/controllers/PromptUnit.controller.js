'use strict'

sap.ui.controller("ui5prompting.controllers.PromptUnit", {
    dependencyManager: undefined,
    
    setDependencyManager: function(depm) {
        this.dependencyManager = depm;
    },
    
    addPromptDependency : function (promptComponent) {
        var oPromptData = promptComponent.promptData;
        this.dependencyManager.addPromptComponent(promptComponent);
        if (oPromptData.dependsOn && oPromptData.dependsOn.length > 0) {
            var aDepArray = oPromptData.dependsOn;
            for (var i = 0; i < aDepArray.length; i++) {
                this.dependencyManager.addDependency(aDepArray[i], oPromptData.id);
            }
        }
    }
});
