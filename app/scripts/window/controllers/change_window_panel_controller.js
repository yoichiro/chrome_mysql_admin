chromeMyAdmin.controller("ChangeWindowPanelController", function(
    $scope,
    Events
) {
    "use strict";

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustChangeWindowPanelHeight();
        });
    };

    var adjustChangeWindowPanelHeight = function() {
        $("#changeWindowPanel").height($(window).height());
    };

    var setVisibleChangeWindowPanel = function(newVisibleChangeWindowPanel) {
        $scope.visibleChangeWindowPanel = newVisibleChangeWindowPanel;
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_CHANGE_WINDOW_PANEL, function(event) {
            loadWindows();
        });
        $scope.$on(Events.HIDE_CHANGE_WINDOW_PANEL, function(event) {
            setVisibleChangeWindowPanel(false);
        });
    };

    var loadWindows = function() {
        chrome.runtime.getBackgroundPage(function(bg) {
            var windows = bg.getWindows();
            var currentWindow = chrome.app.window.current();
            var otherWindows = [];
            angular.forEach(windows, function(window) {
                if (currentWindow.id !== window.id) {
                    otherWindows.push(window);
                }
            }, otherWindows);
            if (otherWindows.length > 0) {
                $scope.safeApply(function() {
                    setVisibleChangeWindowPanel(true);
                    $scope.windows = otherWindows;
                });
            }
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        $scope.visibleChangeWindowPanel = false;
        assignWindowResizeEventHandler();
        adjustChangeWindowPanelHeight();
    };

    $scope.isVisibleChangeWindowPanel = function() {
        return $scope.visibleChangeWindowPanel;
    };

    $scope.hideChangeWindowPanel = function() {
        setVisibleChangeWindowPanel(false);
    };

    $scope.changeWindow = function(id) {
        setVisibleChangeWindowPanel(false);
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.focusWindow(id);
        });
    };

});
