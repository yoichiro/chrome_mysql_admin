chromeMyAdmin.factory("queryHistoryService", function(
    $rootScope,
    $q,
    Events
) {
    "use strict";

    var trim = function(str) {
        return str.replace(/^[ 　\t\r\n]+|[ 　\t\r\n]+$/g, "");
    };

    return {
        add: function(query) {
            var trimed = trim(query);
            var deferred = $q.defer();
            chrome.storage.sync.get("queries", function(items) {
                var queries = items.queries || [];
                var exists = false;
                angular.forEach(queries, function(target) {
                    if (target === trimed) {
                        exists = true;
                    }
                });
                if (!exists) {
                    queries.push(trimed);
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

});
