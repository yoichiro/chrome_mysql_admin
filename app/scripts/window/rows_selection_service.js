chromeMyAdmin.factory("rowsSelectionService", ["$rootScope", function($rootScope) {
    "use strict";

    var selectedRow = null;

    return {
        reset: function() {
            selectedRow = null;
        },
        setSelectedRows: function(newSelectedRow) {
            selectedRow = newSelectedRow;
            $rootScope.$broadcast("rowsSelectionChanged", selectedRow);
        },
        getSelectedRows: function() {
            return selectedRow;
        },
        confirmDeleteSelectedRow: function() {
            $rootScope.$broadcast("confirmDeleteSelectedRow", selectedRow);
        },
        requestDeleteSelectedRow: function() {
            $rootScope.$broadcast("requestDeleteSelectedRow", selectedRow);
        }
    };

}]);
