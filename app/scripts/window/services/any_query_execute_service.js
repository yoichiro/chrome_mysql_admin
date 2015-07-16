chromeMyAdmin.factory("anyQueryExecuteService", function(
    $rootScope,
    Events
) {
    "use strict";

    return {
        showQueryPanel: function(query) {
            $rootScope.$broadcast(Events.SHOW_QUERY_PANEL, {query: query});
        },
        showAndExecuteQueryPanel: function(query, removeEmptyResult) {
            $rootScope.$broadcast(Events.SHOW_AND_EXECUTE_QUERY_PANEL,
                                  {query: query, removeEmptyResult: removeEmptyResult});
        },
        showFindSameRowsDialog: function() {
            $rootScope.$broadcast(Events.SHOW_FIND_SAME_ROWS_DIALOG, null);
        },
        showFindRowsWithTheValueDialog: function() {
            $rootScope.$broadcast(Events.SHOW_FIND_ROWS_WITH_THE_VALUE_DIALOG, null);
        }
    };

});
