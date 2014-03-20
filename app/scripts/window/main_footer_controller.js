"use strict";

chromeMyAdmin.controller("MainFooterController", ["$scope", "modeService", "mySQLClientService", "rowsPagingService", function($scope, modeService, mySQLClientService, rowsPagingService) {

    var showMainStatusMessage = function(message) {
        $scope.safeApply(function() {
            $scope.mainStatusMessage = message;
        });
    };

    var _hasPrevisouPage = function() {
        return rowsPagingService.hasPrevious();
    };

    var _hasNextPage = function() {
        return rowsPagingService.hasNext();
    };

    $scope.initialize = function() {
        $scope.$on("showMainStatusMessage", function(event, message) {
            showMainStatusMessage(message);
        });
    };

    $scope.isButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === "rows";
    };

    $scope.hasPreviousPage = function() {
        return _hasPrevisouPage();
    };

    $scope.hasNextPage = function() {
        return _hasNextPage();
    };

    $scope.goPreviousPage = function() {
        if (_hasPrevisouPage()) {
            rowsPagingService.previous();
        }
    };

    $scope.goNextPage = function() {
        if (_hasNextPage()) {
            rowsPagingService.next();
        }
    };

    $scope.getPagingInfo = function() {
        return (rowsPagingService.getCurrentPageIndex() + 1) + "/" + rowsPagingService.getTotalPageCount();
    };

    $scope.refresh = function() {
        rowsPagingService.refresh();
    };

}]);
