"use strict";

chromeMyAdmin.controller("ProgressBarController", ["$scope", function($scope) {

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustProgressPanelHeight();
        });
    };

    var adjustProgressPanelHeight = function() {
        $("#progressPanel").height($(window).height());
    };

    var setVisibleProgressBar = function(newVisibleProgressBar) {
        $scope.safeApply(function() {
            $scope.visibleProgressBar = newVisibleProgressBar;
        });
    };

    $scope.initialize = function() {
        $scope.$on("showProgressBar", function(event) {
            setVisibleProgressBar(true);
        });
        $scope.$on("hideProgressBar", function(event) {
            setVisibleProgressBar(false);
        });
        $scope.visibleProgressBar = false;
        assignWindowResizeEventHandler();
        adjustProgressPanelHeight();
    };

    $scope.isVisibleProgressBar = function() {
        return $scope.visibleProgressBar;
    };

}]);
