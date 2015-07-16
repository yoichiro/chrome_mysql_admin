chromeMyAdmin.factory("querySelectionService", function(
    $rootScope,
    Events
) {
    "use strict";

    var queryResult = null;
    var selectedRows = null;

    return {
        resetQueryResult: function() {
            queryResult = null;
        },
        resetSelectedRows: function() {
            selectedRows = null;
        },
        setQueryResult: function(result) {
            queryResult = result;
        },
        getQueryResult: function() {
            return queryResult;
        },
        exportQueryResult: function() {
            $rootScope.$broadcast(Events.EXPORT_QUERY_RESULT, null);
        },
        setSelectedRows: function(row) {
            selectedRows = row;
        },
        getSelectedRows: function() {
            return selectedRows;
        },
        copyRowToClipboard: function() {
            $rootScope.$broadcast(Events.COPY_QUERY_RESULT_ROW_TO_CLIPBOARD, selectedRows);
        }
    };

});
