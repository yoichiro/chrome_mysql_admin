/*
 * Copyright (c) 2014 Yoichiro Tanaka. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
