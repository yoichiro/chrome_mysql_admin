"use strict";

chromeMyAdmin.controller("FavoriteListController", ["$scope", "mySQLClientService", "favoriteService", function($scope, mySQLClientService, favoriteService) {

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