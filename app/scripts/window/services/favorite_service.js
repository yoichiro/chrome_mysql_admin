chromeMyAdmin.factory("favoriteService", ["$rootScope", "$q", "Events", function($rootScope, $q, Events) {
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
                    $rootScope.$broadcast(Events.FAVORITES_CHANGED, favorites);
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
                    $rootScope.$broadcast(Events.FAVORITE_SELECTED, result);
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
        },
        delete: function(name) {
            var deferred = $q.defer();
            chrome.storage.sync.get("favorites", function(items) {
                var favorites = items.favorites || {};
                delete favorites[name];
                chrome.storage.sync.set({favorites: favorites}, function() {
                    $rootScope.$broadcast(Events.FAVORITES_CHANGED, favorites);
                    deferred.resolve();
                });
            });
            return deferred.promise;
        }
    };

}]);
