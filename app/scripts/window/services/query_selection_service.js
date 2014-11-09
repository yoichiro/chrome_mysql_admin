chromeMyAdmin.factory("querySelectionService", ["$rootScope", "Events", function($rootScope, Events) {
    "use strict";

    var queryResult = null;

    return {
        reset: function() {
            queryResult = null;
        },
        setQueryResult: function(result) {
            queryResult = result;
        },
        getQueryResult: function() {
            return queryResult;
        },
        exportQueryResult: function() {
            $rootScope.$broadcast(Events.EXPORT_QUERY_RESULT, null);
        }
    };

}]);
