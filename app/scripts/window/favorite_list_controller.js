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

chromeMyAdmin.controller("FavoriteListController", ["$scope", "mySQLClientService", "favoriteService", function($scope, mySQLClientService, favoriteService) {
    "use strict";

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustFavoriteListHeight();
        });
    };

    var adjustFavoriteListHeight = function() {
        $("#favoriteList").height($(window).height() - 51 - 35);
    };

    var loadFavorites = function() {
        favoriteService.getAll().then(function(favorites) {
            $scope.favorites = favorites;
        });
    };

    var assignEventHandlers = function() {
        $scope.$on("favoritesChanged", function(event, favorites) {
            loadFavorites();
        });
    };

    $scope.initialize = function() {
        assignWindowResizeEventHandler();
        adjustFavoriteListHeight();
        assignEventHandlers();
        loadFavorites();
    };

    $scope.isFavoriteListVisible = function() {
        return !mySQLClientService.isConnected();
    };

    $scope.selectFavorite = function(name) {
        favoriteService.select(name);
    };

}]);
