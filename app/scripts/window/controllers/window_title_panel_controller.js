chromeMyAdmin.directive("windowTitlePanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/window_title_panel.html"
    };
});

chromeMyAdmin.controller("windowTitlePanelController", ["$scope", "mySQLClientService", "$q", function($scope, mySQLClientService, $q) {
    "use strict";

    var storeWindowSize = function() {
        var deferred = $q.defer();
        var window = chrome.app.window.current();
        var windowSize = {
            bounds: {
                top: window.outerBounds.top,
                left: window.outerBounds.left,
                width: window.outerBounds.width,
                height: window.outerBounds.height
            },
            isFullscreen: window.isFullscreen(),
            isMaximized: window.isMaximized()
        };
        chrome.storage.sync.set({windowSize: windowSize}, function() {
            deferred.resolve();
        });
        return deferred.promise;
    };

    $scope.close = function() {
        if (mySQLClientService.isConnected()) {
            mySQLClientService.logout().then(function() {
                storeWindowSize().then(function() {
                    chrome.app.window.current().close();
                });
            });
        } else {
            storeWindowSize().then(function() {
                chrome.app.window.current().close();
            });
        }
    };

    $scope.minimize = function() {
        chrome.app.window.current().minimize();
    };

    $scope.maximize = function() {
        if (chrome.app.window.current().isMaximized()) {
            chrome.app.window.current().restore();
        } else {
            chrome.app.window.current().maximize();
        }
    };

    $scope.fullscreen = function() {
        if (chrome.app.window.current().isFullscreen()) {
            chrome.app.window.current().restore();
        } else {
            chrome.app.window.current().fullscreen();
        }
    };

}]);
