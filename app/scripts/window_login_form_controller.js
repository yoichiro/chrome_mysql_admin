"use strict";

chromeMyAdmin.controller("LoginFormController", ["$scope", "$timeout", "$rootScope", function($scope, $timeout, $rootScope) {

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

    var onConnected = function() {
        $scope.safeApply(function() {
            $rootScope.connected = true;
            $rootScope.$broadcast("connectionChanged", null);
        });
    };

    // Public methods

    $scope.initialize = function() {
        $scope.successMessage = "";
        $scope.errorMessage = "";
        MySQL.communication.setSocketImpl(new MySQL.ChromeSocket());

        $scope.hostName = "127.0.0.1";
        $scope.portNumber = "3306";
        $scope.userName = "yoichiro";
        $scope.password = "pass";
    };

    $scope.connect = function() {
        hideMessage();
        MySQL.client.login(
            $scope.hostName,
            Number($scope.portNumber),
            $scope.userName,
            $scope.password,
            function(initialHandshakeRequest, result) {
                if (result.isSuccess()) {
                    onConnected();
                } else {
                    showErrorMessage("Connection failed: " + result.errorMessage);
                    MySQL.client.logout(function() {});
                }
            }, function(errorCode) {
                showErrorMessage("Connection failed: " + errorCode);
            }, function(result) {
                showErrorMessage("Connection failed: " + result);
            });
    };

    $scope.doTestConnection = function() {
        hideMessage();
        MySQL.client.login(
            $scope.hostName,
            Number($scope.portNumber),
            $scope.userName,
            $scope.password,
            function(initialHandshakeRequest, result) {
                if (result.isSuccess()) {
                    showSuccessMessage("Connection was successfully.");
                } else {
                    showErrorMessage("Connection failed: " + result.errorMessage);
                }
                MySQL.client.logout(function() {});
            }, function(errorCode) {
                showErrorMessage("Connection failed: " + errorCode);
            }, function(result) {
                showErrorMessage("Connection failed: " + result);
            });
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.isSuccessMessageVisible = function() {
        return $scope.successMessage.length > 0;
    };

    $scope.isLoginFormVisible = function() {
        return $rootScope.connected === false;
    };

}]);
