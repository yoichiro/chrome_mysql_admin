chromeMyAdmin.factory("queryHistoryService", ["$rootScope", "$q", "Events", function($rootScope, $q, Events) {
    "use strict";

    return {
        add: function(query) {
            var deferred = $q.defer();
            chrome.storage.sync.get("queries", function(items) {
                var queries = items.queries || [];
                var exists = false;
                angular.forEach(queries, function(target) {
                    if (target === query) {
                        exists = true;
                    }
                });
                if (!exists) {
                    queries.push(query);
                    if (queries.length > 30) {
                        queries = queries.slice(-30);
                    }
                    chrome.storage.sync.set({queries: queries}, function() {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            });
            return deferred.promise;
        },
        getAll: function() {
            var deferred = $q.defer();
            chrome.storage.sync.get("queries", function(items) {
                var queries = items.queries || [];
                deferred.resolve(queries);
            });
            return deferred.promise;
        }
    };

}]);
