chromeMyAdmin.controller("ProgressBarController", function(
    $scope,
    Events
) {
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
            if (newVisibleProgressBar) {
                clearQuery();
            }
            $scope.visibleProgressBar = newVisibleProgressBar;
        });
    };

    var clearQuery = function() {
        $scope.query = "";
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_PROGRESS_BAR, function(event) {
            setVisibleProgressBar(true);
        });
        $scope.$on(Events.HIDE_PROGRESS_BAR, function(event) {
            setVisibleProgressBar(false);
        });
        $scope.$on(Events.EXECUTING_QUERY, function(event, query) {
            $scope.query = query;
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        $scope.visibleProgressBar = false;
        assignWindowResizeEventHandler();
        adjustProgressPanelHeight();
        clearQuery();
    };

    $scope.isVisibleProgressBar = function() {
        return $scope.visibleProgressBar;
    };

});
