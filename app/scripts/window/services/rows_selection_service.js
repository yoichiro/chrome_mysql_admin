chromeMyAdmin.factory("rowsSelectionService", ["$rootScope", "Events", function($rootScope, Events) {
    "use strict";

    var selectedRow = null;

    return {
        reset: function() {
            selectedRow = null;
        },
        setSelectedRows: function(newSelectedRow) {
            selectedRow = newSelectedRow;
            $rootScope.$broadcast(Events.ROWS_SELECTION_CHANGED, selectedRow);
        },
        getSelectedRows: function() {
            return selectedRow;
        },
        confirmDeleteSelectedRow: function() {
            $rootScope.$broadcast(Events.CONFIRM_DELETE_SELECTED_ROW, selectedRow);
        },
        requestDeleteSelectedRow: function() {
            $rootScope.$broadcast(Events.REQUEST_DELETE_SELECTED_ROW, selectedRow);
        }
    };

}]);
