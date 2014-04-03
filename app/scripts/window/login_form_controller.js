/*
 * Copyright (c) 2014 Yoichiro Tanaka. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

chromeMyAdmin.controller("LoginFormController", ["$scope", "$timeout", "mySQLClientService", "favoriteService", function($scope, $timeout, mySQLClientService, favoriteService) {
    "use strict";

    // Private methods

    var showErrorMessage = function(message) {
        $scope.safeApply(function() {
            $scope.errorMessage = message;
        });
    };

    var hideMessage = function() {
        $scope.safeApply(function() {
            $scope.successMessage = "";
            $scope.errorMessage = "";
        });
    };

    var showSuccessMessage = function(message) {
        $scope.safeApply(function() {
            $scope.successMessage = message;
        });
    };

    var onConnected = function(initialHandshakeRequest) {
        $scope.safeApply(function() {
            var connectionInfo = {
                name: $scope.name,
                hostName: $scope.hostName,
                port: $scope.portNumber,
                userName: $scope.userName,
                initialHandshakeRequest: initialHandshakeRequest
            };
            $scope.notifyConnectionChanged(connectionInfo);
        });
    };

    var assignEventHandlers = function() {
        $scope.$on("favoriteSelected", function(event, favorite) {
            $scope.safeApply(function() {
                $scope.name = favorite.name;
                $scope.hostName = favorite.hostName;
                $scope.portNumber = favorite.port;
                $scope.userName = favorite.userName;
                $scope.password = favorite.password;
            });
        });
    };

    var showAboutMe = function() {
        var manifest = chrome.runtime.getManifest();
        var aboutMe = manifest.name + " version " + manifest.version;
        aboutMe += " (C) " + manifest.author + " 2014, all rights reserved.";
        $scope.aboutMe = aboutMe;
    };

    // Public methods

    $scope.initialize = function() {
        $scope.successMessage = "";
        $scope.errorMessage = "";
        assignEventHandlers();
        showAboutMe();
    };

    $scope.connect = function() {
        hideMessage();
        mySQLClientService.login(
            $scope.hostName,
            Number($scope.portNumber),
            $scope.userName,
            $scope.password
        ).then(function(initialHandshakeRequest) {
            onConnected(initialHandshakeRequest);
        }, function(reason) {
            showErrorMessage("Connection failed: " + reason);
        });
    };

    $scope.doTestConnection = function() {
        hideMessage();
        mySQLClientService.login(
            $scope.hostName,
            Number($scope.portNumber),
            $scope.userName,
            $scope.password
        ).then(function(initialHandshakeRequest) {
            showSuccessMessage("Connection was successfully.");
            mySQLClientService.logout();
        }, function(reason) {
            showErrorMessage("Connection failed: " + reason);
        });
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.isSuccessMessageVisible = function() {
        return $scope.successMessage.length > 0;
    };

    $scope.isLoginFormVisible = function() {
        return !mySQLClientService.isConnected();
    };

    $scope.addFavorite = function() {
        var name = $scope.name || $scope.hostName;
        if (name) {
            favoriteService.set(name, $scope.hostName, Number($scope.portNumber), $scope.userName, $scope.password);
        }
    };

    $scope.canConnect = function() {
        return $scope.hostName && $scope.portNumber && $scope.userName;
    };

}]);
