chromeMyAdmin.factory("favoriteService", function(
    $rootScope,
    $q,
    Events
) {
    "use strict";

    var doSelect = function(name) {
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
    };

    return {
        set: function(name, hostName, port, userName, password, useSSL, caCert, checkCN, usePortForwarding, ssh2HostName, ssh2Port, ssh2AuthType, ssh2UserName, ssh2Password, ssh2PrivateKey) {
            var deferred = $q.defer();
            chrome.storage.sync.get("favorites", function(items) {
                var favorites = items.favorites || {};
                var favorite = favorites[name] || {};
                favorite.hostName = hostName;
                favorite.port = port;
                favorite.userName = userName;
                favorite.password = password;
                favorite.useSSL = useSSL;
                favorite.caCert = caCert;
                favorite.checkCN = checkCN;
                favorite.usePortForwarding = usePortForwarding;
                favorite.ssh2HostName = ssh2HostName;
                favorite.ssh2Port = ssh2Port;
                favorite.ssh2AuthType = ssh2AuthType;
                favorite.ssh2UserName = ssh2UserName;
                favorite.ssh2Password = ssh2Password;
                favorite.ssh2PrivateKey = ssh2PrivateKey;
                favorites[name] = favorite;
                chrome.storage.sync.set({favorites: favorites}, function() {
                    $rootScope.$broadcast(Events.FAVORITES_CHANGED, favorites);
                    deferred.resolve();
                });
            });
            return deferred.promise;
        },
        select: function(name) {
            return doSelect(name);
        },
        selectAndLogin: function(name) {
            doSelect(name).then(function(result) {
                $rootScope.login();
            });
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

});
