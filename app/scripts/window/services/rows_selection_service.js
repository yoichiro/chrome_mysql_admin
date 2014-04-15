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
        }
    };

}]);
