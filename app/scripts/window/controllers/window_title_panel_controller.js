chromeMyAdmin.controller("windowTitlePanelController", function(
    $scope,
    mySQLClientService,
    $q,
    Events
) {
    "use strict";

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
        aboutMe += " (C) " + manifest.author + " 2014-" + (new Date()).getFullYear() + ", all rights reserved.";
        return aboutMe;
    };

    var onConnectionChanged = function(info) {
        if (mySQLClientService.isConnected()) {
            $scope.safeApply(function() {
                var opt = info.useSSL ? ":SSL" : "";
                opt += info.usePortForwarding ? ":SSH2" : "";
                var name = "";
                if (info.name) {
                    name = "[" + info.name + "] ";
                }
                $scope.titleText = name + info.hostName + ":" + info.port + opt +
                    " | " + info.userName +
                    " | " + info.initialHandshakeRequest.serverVersion;
                document.title = $scope.titleText;
            });
        } else {
            resetTitleText();
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

    $scope.moveOtherWindow = function() {
        $scope.showChangeWindowPanel();
    };

});
