jQuery.sap.require("ui5prompting.utils.PromptingEvent");

var DependencyManager = function(httpHandler) {
    this._forwardDependency = {};
    this._backwardDependency = {};
    this._promptUnitIDArray = [];
    this._promptIDArray = [];
    this._promptUnitIDToPromptIDArrayMap = {};
    this._promptIDToPromptComponentMap = {};
    this._promptingEventHandler = undefined;
    this._fetchValuesTokens = [];
    this._httpHandler = httpHandler;
};

DependencyManager.prototype.clear = function() {
    var oEventBus = sap.ui.getCore().getEventBus();
    for (var i = 0; i < this._promptIDArray.length; i++) {
        var promptComponent = this._promptIDToPromptComponentMap[this._promptIDArray[i]];
        oEventBus.unsubscribe(promptComponent.promptData.id, bobj.crv.fiori.event.FETCH_LOV, this.onFetchLOV, this);
        oEventBus.unsubscribe(promptComponent.promptData.id, bobj.crv.fiori.event.VALIDATE_VALUE, this.onComponentValidation, this);
        oEventBus.unsubscribe(promptComponent.promptData.id, bobj.crv.fiori.event.SEARCH_LOV, this.onSearchLOV, this);
    }
};

/**
 * Add a new dependency
 */
DependencyManager.prototype.addDependency = function(dependeeID, dependentID) {
    DependencyManager.addDependencyPair(dependeeID, dependentID, this._forwardDependency);
    DependencyManager.addDependencyPair(dependentID, dependeeID, this._backwardDependency);
};

DependencyManager.addDependencyPair = function(key, value, dependency) {
    var valueArray = dependency[key];
    if (!valueArray) {
        valueArray = [];
        dependency[key] = valueArray;
    }
    valueArray.push(value);
};

/**
 * Remove an existing dependency
 */
DependencyManager.prototype.removeDependency = function(id) {
    DependencyManager.removeDependencyPair(id, this._forwardDependency);
    DependencyManager.removeDependencyPair(id, this._backwardDependency);
};

DependencyManager.removeDependencyPair = function(key, dependency) {
    delete dependency.key;
};

/**
 * Get the ids of all the prompts that this prompt depends on. In the Country -> Region -> City example,
 * if the id for "region" is passed in the id for "country" would be returned.
 */
DependencyManager.prototype.getDependeeIDs = function(dependentID, filterOutFunction, recursive) {
    recursive = typeof recursive != 'undefined' ? recursive : true;
    return DependencyManager.getIDs(dependentID, this._backwardDependency, filterOutFunction, recursive);
};

/**
 * Get the ids of all the prompts that this prompt depends on. In the Country -> Region -> City example,
 * if the id for "region" is passed in the id for "country" would be returned.
 */
DependencyManager.prototype.getDependeeIDsForLOVFetching = function(dependentID, filterOutFunction, recursive) {
    recursive = typeof recursive != 'undefined' ? recursive : true;
    var pc = this._promptIDToPromptComponentMap[dependentID]
    if (pc && !pc.promptData.prerequisiteInfoAvailable)
        return this.getAllPromptIDsWithDependencyInfoNotAvailable(dependentID);
    else
        return this.getDependeeIDs(dependentID, filterOutFunction, recursive);
};

/**
 * Get the ids of all the prompts that depend on this prompt. In the Country -> Region -> City example,
 * if the id for "region" is passed in the id for "city" would be returned.
 */
DependencyManager.prototype.getDependentIDs = function(dependeeID, filterOutFunction, recursive) {
    recursive = typeof recursive != 'undefined' ? recursive : true;
    return DependencyManager.getIDs(dependeeID, this._forwardDependency, filterOutFunction, recursive);
};

DependencyManager.prototype.getDependentIDsForLOVFetching = function(dependeeID, filterOutFunction, recursive) {
    recursive = typeof recursive != 'undefined' ? recursive : true;
    var pc = this._promptIDToPromptComponentMap[dependeeID]
    if (pc && !pc.promptData.prerequisiteInfoAvailable)
        return this.getAllPromptIDsWithDependencyInfoNotAvailable(dependeeID);
    else
        return this.getDependentIDs(dependeeID, filterOutFunction, recursive);
};

DependencyManager.prototype.getAllPromptIDsWithDependencyInfoNotAvailable = function(skipThisPrompt) {
    var idArray = [];
    for ( var i in this._promptIDArray) {
        var id = this._promptIDArray[i];
        if (id == skipThisPrompt)
            continue;

        var pc = this._promptIDToPromptComponentMap[id]
        if (pc && !pc.promptData.prerequisiteInfoAvailable)
            idArray.push(id);
    }
    return idArray;
};

DependencyManager.prototype.getAllPromptValuesWithDependencyInfoNotAvailable = function(skipThisPrompt) {
    var valueArray = [];
    for ( var i in this._promptIDArray) {
        var id = this._promptIDArray[i];
        if (id == skipThisPrompt)
            continue;

        var pc = this._promptIDToPromptComponentMap[id]
        if (pc && !pc.promptData.prerequisiteInfoAvailable) {
            var values = pc.getModelValues();
            valueArray.push(values);
        }
    }

    return valueArray;
};

DependencyManager.getIDs = function(targetID, dependency, filterOutFunction, recursive) {
    recursive = typeof recursive != 'undefined' ? recursive : true;

    var idArray = [];
    for ( var i in dependency[targetID]) {
        var id = dependency[targetID][i];
        if (filterOutFunction && filterOutFunction(id))
            continue;

        idArray.push(id);

        if (recursive) {
            var allLevelIdArray = DependencyManager.getIDs(id, dependency, filterOutFunction, recursive);
            idArray = idArray.concat(allLevelIdArray);
        }
    }

    return idArray;
};

/**
 * Get the values of all the prompts that this prompt depends on. In the Country -> Region -> City example,
 * if the id for "region" is passed in values for "country" would be returned.
 */
DependencyManager.prototype.getDependeeValues = function(dependentID, filterOutFunction, recursive) {
    recursive = typeof recursive != 'undefined' ? recursive : true;

    return this.getValues(dependentID, this._backwardDependency, filterOutFunction, recursive);
};

/**
 * Get the values of all the prompts that this prompt depends on. In the Country -> Region -> City example,
 * if the id for "region" is passed in values for "country" would be returned.
 */
DependencyManager.prototype.getDependeeValuesForLOVFetching = function(dependentID, filterOutFunction, recursive) {
    var pc = this._promptIDToPromptComponentMap[dependentID]
    if (pc != undefined && !pc.promptData.prerequisiteInfoAvailable)
        return this.getAllPromptValuesWithDependencyInfoNotAvailable(dependentID);
    else
        return this.getDependeeValues(dependentID, filterOutFunction, recursive);
};

/**
 * Get the values of all the prompts that depend on this prompt. In the Country -> Region -> City example,
 * if the id for "region" is passed in values for "city" would be returned.
 */
DependencyManager.prototype.getDependentValues = function(dependeeID, filterOutFunction, recursive) {
    return this.getValues(dependeeID, this._forwardDependency, filterOutFunction, recursive);
};

DependencyManager.prototype.getValues = function(targetID, dependency, filterOutFunction, recursive) {
    var valueArray = [];
    for (var i in dependency[targetID]) {
        var id = dependency[targetID][i];
        if (filterOutFunction && filterOutFunction(id))
            continue;

        var promptComponent = this._promptIDToPromptComponentMap[id];
        var values = promptComponent.getModelValues();
        valueArray.push(values);

        recursive = typeof recursive != 'undefined' ? recursive : true;
        if (recursive) {
            var allLevelValueArray = this.getValues(id, dependency, filterOutFunction, recursive);
            valueArray = valueArray.concat(allLevelValueArray);
        }
    }

    return valueArray;
};

/**
 * Registers a prompt component with the dependency manager.
 */
DependencyManager.prototype.addPromptComponent = function(promptComponent) {
    this._promptIDArray.push(promptComponent.promptData.id);
    this._promptIDToPromptComponentMap[promptComponent.promptData.id] = promptComponent;

    var promptIDArrayOfPromptUnit = this._promptUnitIDToPromptIDArrayMap[promptComponent.promptData.lovNetworkID];
    if (!promptIDArrayOfPromptUnit) {
        promptIDArrayOfPromptUnit = [];
        this._promptUnitIDToPromptIDArrayMap[promptComponent.promptData.lovNetworkID] = promptIDArrayOfPromptUnit;
        this._promptUnitIDArray.push(promptComponent.promptData.lovNetworkID);
    }
    promptIDArrayOfPromptUnit.push(promptComponent.promptData.id);

    var oEventBus = sap.ui.getCore().getEventBus();
    oEventBus.subscribe(promptComponent.promptData.id, bobj.crv.fiori.event.FETCH_LOV, this.onFetchLOV, this);
    oEventBus.subscribe(promptComponent.promptData.id, bobj.crv.fiori.event.VALIDATE_VALUE, this.onComponentValidation, this);
    oEventBus.subscribe(promptComponent.promptData.id, bobj.crv.fiori.event.SEARCH_LOV, this.onSearchLOV, this);
};

DependencyManager.prototype.onComponentValidation = function(sChannel, sEvent, oEvent) {
    if (oEvent.result) {
        this.onValueChanged(sChannel);
        this.validateDependents(sChannel);
    } else {
        this.invalidateDependents(sChannel);
    }
}

DependencyManager.prototype.enforceDependeeValidation = function(targetID) {
    var dependees = this._backwardDependency[targetID];
    if (!dependees || dependees.length == 0)
        return;

    for (var i in dependees) {
        var id = dependees[i];
        var promptComponent = this._promptIDToPromptComponentMap[id];
        promptComponent.updateValidation(true);
    }

};

DependencyManager.prototype.isLeaf = function(targetID) {
    var dependency = this._forwardDependency[targetID];
    var dependee = this._backwardDependency[targetID];
    return (!dependency || dependency.length == 0) && (dependee && this._backwardDependency[targetID].length != 0); 
};

/**
 * Will be called when the LOV fetch request returns.
 *
 * This method will be responsible for the following:
 *   1. Processing the LOVs returned
 *   2. Updating the prompts with the new LOVs
 *   4. Updating the state of the dependency graph
 */
DependencyManager.prototype.onFetchLOVComplete = function(response, context) {
    var lovs = response.lovs;
    if (lovs) {
        for (var i = 0; i < lovs.length; i++) {
            var prompt = lovs[i];
            var promptID = prompt.id;
            var promptComponent = this._promptIDToPromptComponentMap[promptID];
            if (!promptComponent)
                continue;

            var lov = prompt.lov;
            if (!lov || !lov.values) {
                promptComponent.handleLOVError(context);
                continue;
            }

            // TODO delegated search
            /*
            var delegatedSearchObj = prompt.delegatedSearch;
            var delegatedSearch = false;

            if (delegatedSearchObj && typeof (delegatedSearchObj) == "string") {
                var delegatedSearchString = delegatedSearchObj;
                delegatedSearch = ValueFormatter.BooleanFromFormulaString(delegatedSearchString);
            }

            if (delegatedSearch) {
                //promptComponent.dispatchEvent(new Event(PromptingEvent.USE_DELEGATED_SEARCH, true));
                // TODO: do we need an event buffer here? or just fire off an async delegated search
                continue;
            }
            */

            promptComponent.updateItems(prompt, context);
        }
    }
};

/**
 * Will be called when we fail to fetch an LOV for some reason. In this case we need to
 * allow for custom value entry in all prompts in the dependency.
 */
DependencyManager.prototype.onFetchLOVError = function(involvedPrompts) {
    for (var i = 0; i < involvedPrompts.length; i++) {
        var promptID = involvedPrompts[i];
        var promptComponent = this._promptIDToPromptComponentMap[promptID];

        // Remove the dependency
        this.removeDependency(promptID);
    }
};

/**
 * When the value of prompt changes we need to fetch the LOV for all of it's
 * dependents.
 */
DependencyManager.prototype.onValueChanged = function(targetID) {
    var targetComponent = this._promptIDToPromptComponentMap[targetID];
    if (!targetComponent)
        return; // Should not happen as all prompt components should be known by dependency manager.

    // Dependents will be all prompts that depend on the id passed in
    var promptIDs = this.getDependentIDs(targetID);
    if (!promptIDs || promptIDs.length == 0) {
        // None of the dependent need to fetch LOV
        return;
    }

    // Pass empty value for the prompts which need to fetch LOV to improve performance for re-prompt case.
    var promptValues = [];
    for (var i = 0; i < promptIDs.length; ++i) {
        promptValues.push([]);
    }

    // When a prompt value changes we need to fetch for all of the prompts that depended on
    // that value. Because of that we need to make sure we send the current values for all the
    // prompts that those prompts depend on. To simplify things we will just send all the current
    // values for each prompt in the same prompt unit.
    var dependeePromptIDs = [];
    var dependeePromptValues = [];
    for ( var key in this._promptIDToPromptComponentMap) {
        var prompt = this._promptIDToPromptComponentMap[key];
        if (prompt.promptData.lovNetworkID == targetComponent.promptData.lovNetworkID) {
            dependeePromptIDs.push(key);
            dependeePromptValues.push(prompt.getModelValues());
        }
    }

    this.sendFetchRequest(targetComponent, promptIDs, promptValues, 0, targetComponent.formatOptions.maxNumParameterDefaultValues, dependeePromptIDs, dependeePromptValues, { refresh: true });

};

DependencyManager.prototype.onFetchLOV = function(sChannel, sEvent, oEvent) {
    var component = this._promptIDToPromptComponentMap[sChannel];
    if (oEvent.growing) {
        this.fetchLOVForPrompt(component, component.lovSize(), component.lovSize() + component.formatOptions.maxNumParameterDefaultValues, oEvent);
    } else if (oEvent.all) {
        this.fetchLOVForPrompt(component, component.lovSize(), component.lovTotalSize(), oEvent);
    } else {
        this.fetchLOVForPrompt(component, 0, component.promptData.isHierarchy ? bobj.crv.fiori.config.SIZE_LIMIT : component.formatOptions.maxNumParameterDefaultValues, oEvent);
    }
};

DependencyManager.prototype.fetchLOVForPrompt = function(prompt, start, end, context) {
    var promptID = prompt.promptData.id;

    // Dependents will be all prompts that depend on the id passed in
    var promptIDs = this.getDependentIDs(promptID);
    var promptValues = this.getDependentValues(promptID);

    promptIDs.unshift(prompt.promptData.id);
    promptValues.unshift(prompt.getModelValues());

    // Dependees will be all prompts that the id depends on
    var dependeePromptIDs = prompt.promptData.isHierarchy ? this.getDependeeIDsForLOVFetching(promptID) : this.getDependeeIDs(promptID);
    var dependeePromptValues = prompt.promptData.isHierarchy ? this.getDependeeValuesForLOVFetching(promptID) : this.getDependeeValues(promptID);

    this.sendFetchRequest(prompt, promptIDs, promptValues, start, end, dependeePromptIDs, dependeePromptValues, context);
};

////////////////////////
// HELPER METHODS

/**
 * Will send the fetch request for the prompts involved.
 */
DependencyManager.prototype.sendFetchRequest = function (prompt, promptIDs, promptValues, start, end, dependeePromptIDs, dependeePromptValues, context) {
    context.start = start;
    context.end = end;
    if (prompt.promptData.staticLOV) {
        this.onFetchLOVComplete({ lovs: [prompt.promptData] }, context);
        return;
    }
    var isFetchForDependent = !promptIDs.find(function (p) { return p == prompt.promptData.id });
    for (var i = 0; i < promptIDs.length; i++) {
        var id = promptIDs[i];
        var promptComponent = this._promptIDToPromptComponentMap[id];
        promptComponent.showWaitState();

        if (isFetchForDependent) {
            promptComponent.removeAll();
            promptComponent.updateItems({ lov: { values: [] } }, { refresh: true });
        }
    }

    PromptingEvent.createFetchLOVEvent(this._httpHandler,
            function (err, response) {
                if (err || !response.lovs)
                    this.onFetchLOVError(promptIDs);
                else
                    this.onFetchLOVComplete(response, context);

                for (var i = 0; i < promptIDs.length; i++) {
                    var id = promptIDs[i];
                    var promptComponent = this._promptIDToPromptComponentMap[id];
                    promptComponent.clearWaitState();
                }
            }.bind(this),
            prompt.promptData.lovNetworkID, promptIDs, promptValues, start, end, dependeePromptIDs, dependeePromptValues, context.path);
};

/**
 * Will clear the values of all dependents in the graph, and will set them as
 * read-only.
 */
DependencyManager.prototype.invalidateDependents = function(targetID) {
    var dependents = this._forwardDependency[targetID];
    if (!dependents || dependents.length == 0)
        return;

    for ( var i in dependents) {
        var id = dependents[i];
        var promptComponent = this._promptIDToPromptComponentMap[id];
        promptComponent.setReadonly(true);
        promptComponent.removeAll();
        // clear lov
        promptComponent.updateItems({lov: {values: []}}, { refresh: true });
    }
};

/**
 * Will enable all direct dependents and re-validate their values.
 */
DependencyManager.prototype.validateDependents = function(targetID) {
    var dependents = this._forwardDependency[targetID];
    if (!dependents || dependents.length == 0)
        return;

    // Need to enable all direct dependents
    for ( var i in dependents) {
        var id = dependents[i];
        if (this.doAllDependeePromptsHaveValue(id)) {
            var promptComponent = this._promptIDToPromptComponentMap[id];
            promptComponent.setReadonly(false);
        }
    }
};

DependencyManager.prototype.enforceDependency = function() {
    for (var i = 0; i < this._promptUnitIDArray.length; i++) {
        var promptUnitID = this._promptUnitIDArray[i];
        var promptIDArray = this._promptUnitIDToPromptIDArrayMap[promptUnitID];
        if (promptIDArray == undefined)
            continue;

        for (var j = 0; j < promptIDArray.length; j++) {
            var promptID = promptIDArray[j];
            var promptComponent = this._promptIDToPromptComponentMap[promptID]; //TODO: promptComponent UI5 arch??
            if (promptComponent == undefined)
                continue;

            // Enforce should only disabling prompt not enabling it.
            // Otherwise a read-only prompt with no dependee will become editable.
            if (!promptComponent.getReadonly() && !this.doAllDependeePromptsHaveValue(promptID))
                promptComponent.setReadonly(true);
            
            // cascading prompting
            if (this.isLeaf(promptID) && promptComponent.valid()) {
                this.enforceDependeeValidation(promptID);
            }
        }
    }
};

DependencyManager.prototype.doAllDependeePromptsHaveValue = function(targetID) {
    if (!this._backwardDependency[targetID])
        return true;

    for ( var i in this._backwardDependency[targetID]) {
        var id = this._backwardDependency[targetID][i];
        var promptComponent = this._promptIDToPromptComponentMap[id];
        var values = promptComponent.getModelValues();
        if ((values.length == 0 || values[0].value == undefined) && !promptComponent.promptData.optional)
            return false;
    }

    return true;
};

DependencyManager.prototype.getPromptComponentIndex = function(id) {
    return this._promptIDArray.indexOf(id);
};

DependencyManager.prototype.isTheOnlyPromptInPromptUnit = function(pc) {
    var promptIDArray = this._promptUnitIDToPromptIDArrayMap[pc.lovNetworkID];

    // For DCP because DCP widget won't be in the promptIDArray (i.e. not known to
    // the dependency manager)
    if (promptIDArray.indexOf(pc.id) == -1)
        return true;

    return (promptIDArray.length == 1);
};

DependencyManager.prototype.isLastItemInPromptUnit = function(pc) {
    var promptIDArray = this._promptUnitIDToPromptIDArrayMap[pc.lovNetworkID];

    // For DCP because DCP widget won't be in the promptIDArray (i.e. not known to
    // the dependency manager)
    if (promptIDArray.indexOf(pc.id) == -1)
        return true;

    return (promptIDArray.indexOf(pc.id) == promptIDArray.length - 1);
};

DependencyManager.prototype.onSearchLOV = function(sChannel, sEvent, oEvent) {
    var component = this._promptIDToPromptComponentMap[sChannel];
    this.searchLOVForPrompt(component, oEvent);
};

DependencyManager.prototype.searchLOVForPrompt = function(prompt, oEvent) {
    var promptID = prompt.promptData.id;

    // Dependents will be all prompts that depend on the id passed in
    var promptIDs = this.getDependentIDs(promptID);

    promptIDs.unshift(prompt.promptData.id);

    // Dependees will be all prompts that the id depends on
    var dependeePromptIDs = prompt.promptData.isHierarchy ? this.getDependeeIDsForLOVFetching(promptID) : this.getDependeeIDs(promptID);
    var dependeePromptValues = prompt.promptData.isHierarchy ? this.getDependeeValuesForLOVFetching(promptID) : this.getDependeeValues(promptID);
    

    var useDelegatedSearch = prompt.useDelegatedSearch || prompt.promptData.isHierarchy || !prompt.lovIsTotalKnown();

    this.sendSearchLOVRequest(prompt, promptIDs, dependeePromptIDs, dependeePromptValues, useDelegatedSearch, oEvent);
};

DependencyManager.prototype.sendSearchLOVRequest = function(prompt, promptIDs, dependeePromptIDs, dependeePromptValues, useDelegatedSearch, oEvent) {
    for (var i = 0; i < promptIDs.length; i++) {
        var id = promptIDs[i];
        var promptComponent = this._promptIDToPromptComponentMap[id];
        promptComponent.showWaitState();
    }

    PromptingEvent.createSearchLOVEvent(this._httpHandler,
            function (err, response) {
                prompt.updateSearchLOVResult(response.searchResult, oEvent);
                for (var i = 0; i < promptIDs.length; i++) {
                    var id = promptIDs[i];
                    var promptComponent = this._promptIDToPromptComponentMap[id];
                    promptComponent.clearWaitState();
                }
            }.bind(this), 
            //oEvent.text is searchString, it is case-sensitive to follow flash logic
            prompt.promptData.lovNetworkID, promptIDs[0], oEvent.text, useDelegatedSearch, dependeePromptIDs, dependeePromptValues);
};

DependencyManager.prototype.expandAll = function(bOnlyOptional) {
    for (var key in this._promptIDToPromptComponentMap) {
        var pc = this._promptIDToPromptComponentMap[key];
        if (!bOnlyOptional || pc.promptData.isOptionalPrompt)
            pc.expand();
    }
}

DependencyManager.prototype.collapseAll = function(bOnlyOptional) {
    for (var key in this._promptIDToPromptComponentMap) {
        var pc = this._promptIDToPromptComponentMap[key];
        if (!bOnlyOptional || pc.promptData.isOptionalPrompt)
            pc.collapse();
    }
}

