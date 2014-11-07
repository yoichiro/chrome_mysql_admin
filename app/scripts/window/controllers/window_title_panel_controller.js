chromeMyAdmin.controller("windowTitlePanelController", ["$scope", "mySQLClientService", "$q", "Events", function($scope, mySQLClientService, $q, Events) {
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

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, connectionInfo) {
            onConnectionChanged(connectionInfo);
        });
    };

    var resetTitleText = function() {
        $scope.titleText = getAboutMe();
        document.title = chrome.runtime.getManifest().name;
    };

    var getAboutMe = function() {
        var manifest = chrome.runtime.getManifest();
        var aboutMe = manifest.name + " version " + manifest.version;
        aboutMe += " (C) " + manifest.author + " 2014, all rights reserved.";
        return aboutMe;
    };

    var onConnectionChanged = function(info) {
        if (mySQLClientService.isConnected()) {
            $scope.safeApply(function() {
                var tls = info.useSSL ? " (SSL)" : "";
                var name = "";
                if (info.name) {
                    name = "[" + info.name + "] ";
                }
                $scope.titleText = name + info.hostName + ":" + info.port + tls +
                    " | " + info.userName +
                    " | " + info.initialHandshakeRequest.serverVersion;
                document.title = $scope.titleText;
            });
        } else {
            resetTitleText();
        }
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

    $scope.initialize = function() {
        assignEventHandlers();
        resetTitleText();
        $scope.alwaysOnTop = false;
    };

    $scope.openNewWindow = function() {
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.createWindow();
        });
    };

    $scope.getAlwaysOnTopClass = function() {
        return $scope.alwaysOnTop ? "fa-circle" : "fa-circle-o";
    };

    $scope.changeAlwaysOnTop = function() {
        $scope.alwaysOnTop = !$scope.alwaysOnTop;
        var appWindow = chrome.app.window.current();
        appWindow.setAlwaysOnTop($scope.alwaysOnTop);
    };

}]);
