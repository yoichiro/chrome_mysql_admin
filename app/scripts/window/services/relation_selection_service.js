chromeMyAdmin.factory("relationSelectionService", function(
    $rootScope,
    Events
) {
    "use strict";

    var selectedRelation = null;

    return {
        reset: function() {
            selectedRelation = null;
        },
        setSelectedRelation: function(newSelectedRelation) {
            selectedRelation = newSelectedRelation;
            $rootScope.$broadcast(Events.RELATION_SELECTION_CHANGED, selectedRelation);
        },
        getSelectedRelation: function() {
            return selectedRelation;
        }
    };

});
