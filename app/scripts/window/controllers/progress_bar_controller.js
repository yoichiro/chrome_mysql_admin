chromeMyAdmin.directive("progressPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/progress_panel.html"
    };
});

chromeMyAdmin.controller("ProgressBarController", ["$scope", "Events", function($scope, Events) {
    "use strict";

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
        $scope.$on(Events.SHOW_PROGRESS_BAR, function(event) {
            setVisibleProgressBar(true);
        });
        $scope.$on(Events.HIDE_PROGRESS_BAR, function(event) {
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
