"use strict";

chromeMyAdmin.controller("MainFooterController", ["$scope", function($scope) {

    var showMainStatusMessage = function(message) {
        $scope.safeApply(function() {
            $scope.mainStatusMessage = message;
        });
    };

    $scope.initialize = function() {
        $scope.$on("showMainStatusMessage", function(event, message) {
            showMainStatusMessage(message);
        });
    };

}]);
