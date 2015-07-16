chromeMyAdmin.factory("rowsSelectionService", function(
    $rootScope,
    Events
) {
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
        copyRowToClipboard: function() {
            $rootScope.$broadcast(Events.COPY_ROWS_PANEL_ROW_TO_CLIPBOARD, selectedRow);
        }
    };

});
