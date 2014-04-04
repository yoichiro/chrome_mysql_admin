chromeMyAdmin.factory("favoriteService", ["$rootScope", "$q", function($rootScope, $q) {
    "use strict";

    return {
        set: function(name, hostName, port, userName, password) {
            var deferred = $q.defer();
            chrome.storage.sync.get("favorites", function(items) {
                var favorites = items.favorites || {};
                var favorite = favorites[name] || {};
                favorite.hostName = hostName;
                favorite.port = port;
                favorite.userName = userName;
                favorite.password = password;
                favorites[name] = favorite;
                chrome.storage.sync.set({favorites: favorites}, function() {
                    $rootScope.$broadcast("favoritesChanged", favorites);
                    deferred.resolve();
                });
            });
            return deferred.promise;
        },
        select: function(name) {
            var deferred = $q.defer();
            chrome.storage.sync.get("favorites", function(items) {
                var favorites = items.favorites || {};
                var result = favorites[name];
                if (result) {
                    result.name = name;
                    $rootScope.$broadcast("favoriteSelected", result);
                    deferred.resolve(result);
                } else {
                    deferred.reject();
                }
            });
            return deferred.promise;
        },
        getAll: function() {
            var deferred = $q.defer();
            chrome.storage.sync.get("favorites", function(items) {
                var favorites = items.favorites || {};
                deferred.resolve(favorites);
            });
            return deferred.promise;
        }
    };

}]);
