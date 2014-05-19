chromeMyAdmin.factory("configurationService", ["$rootScope", "$q", "Configurations", function($rootScope, $q, Configurations) {
    "use strict";

    return {
        getDatabaseInfoAutoUpdateSpan: function() {
            var deferred = $q.defer();
            chrome.storage.sync.get("configurations", function(items) {
                var configurations = items.configurations || {};
                var result =
                        configurations[Configurations.DATABASE_INFO_AUTO_UPDATE_SPAN];
                if (result) {
                    deferred.resolve(result);
                } else {
                    deferred.resolve(
                        Configurations.DEFAULT_DATABASE_INFO_AUTO_UPDATE_SPAN);
                }
            });
            return deferred.promise;
        },
        setDatabaseInfoAutoUpdateSpan: function(span) {
            var deferred = $q.defer();
            chrome.storage.sync.get("configurations", function(items) {
                var configurations = items.configurations || {};
                configurations[Configurations.DATABASE_INFO_AUTO_UPDATE_SPAN] = span;
                chrome.storage.sync.set({configurations: configurations}, function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        }
    };
}]);
