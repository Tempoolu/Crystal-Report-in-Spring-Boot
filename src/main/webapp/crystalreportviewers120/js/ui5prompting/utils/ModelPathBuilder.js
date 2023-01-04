var ModelPathBuilder = function() {
}

ModelPathBuilder.VALUE_MODEL = '_VAL';
ModelPathBuilder.VALUE_VALUES = 'values';
ModelPathBuilder.VALUE_ISNULL = 'isNull';
ModelPathBuilder.VIEW_MODEL = '_VUE';
ModelPathBuilder.VIEW_SELECTED = 'selected';
ModelPathBuilder.VIEW_VALIDATION = 'validation';
ModelPathBuilder.VIEW_INITIAL = 'initial';
ModelPathBuilder.VIEW_ENABLED = 'enabled';
ModelPathBuilder.VIEW_EXPANDED = 'expanded';
ModelPathBuilder.VIEW_LOV = 'lov';
ModelPathBuilder.VIEW_LOVSIZE = 'lovSize';
ModelPathBuilder.VIEW_LOVTOTAL = 'lovTotalSize';
ModelPathBuilder.VIEW_LOVBUSY = 'lovBusy';
ModelPathBuilder.VIEW_LOVSEARCH = 'lovSearch';
ModelPathBuilder.VIEW_LOVSEARCHBUSY = 'lovSearchBusy';
ModelPathBuilder.VIEW_LOVGROWING = 'lovGrowing';
ModelPathBuilder.VIEW_LOVGDELSEARCH = 'lovDeligateSearch';
ModelPathBuilder.VIEW_LOVSEARCHEXCEED = 'lovSearchExceed';


ModelPathBuilder.BuildFullValuePath = function(key ,oPromptData, sViewerName) {
    return  ModelPathBuilder.GetValueModleName(sViewerName) + '>/' + oPromptData.lovNetworkID + '/prompts/' + oPromptData.promptIndex + '/' + key;
}

ModelPathBuilder.BuildFullViewPath = function(key ,oPromptData, sViewerName) {
    return  ModelPathBuilder.GetViewModleName(sViewerName) + '>/' + oPromptData.lovNetworkID + '/prompts/' + oPromptData.promptIndex + '/' + key;
}

ModelPathBuilder.BuildPath = function(key, oPromptData) {
    return  '/' + oPromptData.lovNetworkID + '/prompts/' + oPromptData.promptIndex + '/' + key;
}

ModelPathBuilder.GetValueModleName = function(sViewerName) {
    return sViewerName + ModelPathBuilder.VALUE_MODEL;
}

ModelPathBuilder.GetViewModleName = function(sViewerName) {
    return sViewerName + ModelPathBuilder.VIEW_MODEL;
}