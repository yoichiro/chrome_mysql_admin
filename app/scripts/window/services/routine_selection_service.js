chromeMyAdmin.factory("routineSelectionService", function(
    $rootScope,
    Events
) {
    "use strict";

    var selectedRoutine = null;

    return {
        reset: function() {
            selectedRoutine = null;
            $rootScope.$broadcast(Events.ROUTINE_SELECTION_CHANGED, selectedRoutine);
        },
        setSelectedRoutine: function(newSelectedRoutine) {
            selectedRoutine = newSelectedRoutine;
            $rootScope.$broadcast(Events.ROUTINE_SELECTION_CHANGED, selectedRoutine);
        },
        getSelectedRoutine: function() {
            return selectedRoutine;
        },
        showCreateRoutineDialog: function() {
            $rootScope.$broadcast(Events.SHOW_CREATE_ROUTINE_DIALOG, null);
        },
        executeSelectedProcedure: function() {
            $rootScope.$broadcast(Events.EXECUTE_SELECTED_PROCEDURE, selectedRoutine);
        }
    };

});
