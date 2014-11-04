chromeMyAdmin.factory("anyQueryExecuteService", ["$rootScope", "Events", function($rootScope, Events) {
    "use strict";

    return {
        showQueryPanel: function(query) {
            $rootScope.$broadcast(Events.SHOW_QUERY_PANEL, {query: query});
        },
        showAndExecuteQueryPanel: function(query) {
            $rootScope.$broadcast(Events.SHOW_AND_EXECUTE_QUERY_PANEL, {query: query});
        }
    };

}]);
