chromeMyAdmin.directive("loginForm", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/login_form.html"
    };
});

chromeMyAdmin.controller("LoginFormController", ["$scope", "$timeout", "mySQLClientService", "favoriteService", "Events", "identityKeepService", function($scope, $timeout, mySQLClientService, favoriteService, Events, identityKeepService) {
    "use strict";

    // Private methods

    var onConnected = function(initialHandshakeRequest) {
        $scope.safeApply(function() {
            var connectionInfo = {
                name: $scope.name,
                hostName: $scope.hostName,
                port: $scope.portNumber,
                userName: $scope.userName,
                initialHandshakeRequest: initialHandshakeRequest,
                useSSL: isUseSSLConnection()
            };
            $scope.notifyConnectionChanged(connectionInfo);
        });
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.FAVORITE_SELECTED, function(event, favorite) {
            $scope.safeApply(function() {
                $scope.name = favorite.name;
                $scope.hostName = favorite.hostName;
                $scope.portNumber = favorite.port;
                $scope.userName = favorite.userName;
                $scope.password = favorite.password;
                $scope.useSSL = favorite.useSSL || "no";
                $scope.caCert = favorite.caCert;
                $scope.checkCN = favorite.checkCN || "yes";
            });
        });
        $scope.$on(Events.LOGIN, function(event, data) {
            doConnect();
        });
    };

    var doConnect = function() {
        if (isUseSSLConnection()) {
            mySQLClientService.loginWithSSL(
                $scope.hostName,
                Number($scope.portNumber),
                $scope.userName,
                $scope.password,
                $scope.caCert,
                isCheckCN()
            ).then(function(initialHandshakeRequest) {
                identityKeepService.set(
                    $scope.hostName, $scope.portNumber, $scope.userName, $scope.password);
                onConnected(initialHandshakeRequest);
            }, function(reason) {
                $scope.showErrorDialog("Connection failed.", reason);
                mySQLClientService.logout();
            });
        } else {
            mySQLClientService.login(
                $scope.hostName,
                Number($scope.portNumber),
                $scope.userName,
                $scope.password
            ).then(function(initialHandshakeRequest) {
                identityKeepService.set(
                    $scope.hostName, $scope.portNumber, $scope.userName, $scope.password);
                onConnected(initialHandshakeRequest);
            }, function(reason) {
                $scope.showErrorDialog("Connection failed.", reason);
                mySQLClientService.logout();
            });
        }
    };

    var isUseSSLConnection = function() {
        return $scope.useSSL === "yes";
    };

    var isCheckCN = function() {
        return $scope.checkCN === "yes";
    };

    // Public methods

    $scope.initialize = function() {
        $scope.portNumber = 3306;
        $scope.useSSL = "no";
        $scope.checkCN = "yes";
        assignEventHandlers();
    };

    $scope.connect = function() {
        doConnect();
    };

    $scope.doTestConnection = function() {
        if (isUseSSLConnection()) {
            mySQLClientService.loginWithSSL(
                $scope.hostName,
                Number($scope.portNumber),
                $scope.userName,
                $scope.password,
                $scope.caCert,
                isCheckCN()
            ).then(function(initialHandshakeRequest) {
                $scope.showCustomErrorDialog("Test connection", "Connection was successfully.", "");
                mySQLClientService.logout();
            }, function(reason) {
                $scope.showCustomErrorDialog("Test connection", "Connection failed.", reason);
                mySQLClientService.logout();
            });
        } else {
            mySQLClientService.login(
                $scope.hostName,
                Number($scope.portNumber),
                $scope.userName,
                $scope.password
            ).then(function(initialHandshakeRequest) {
                $scope.showCustomErrorDialog("Test connection", "Connection was successfully.", "");
                mySQLClientService.logout();
            }, function(reason) {
                $scope.showCustomErrorDialog("Test connection", "Connection failed.", reason);
                mySQLClientService.logout();
            });
        }
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
            favoriteService.set(name, $scope.hostName, Number($scope.portNumber), $scope.userName, $scope.password, $scope.useSSL, $scope.caCert, $scope.checkCN);
        }
    };

    $scope.canConnect = function() {
        return $scope.hostName && $scope.portNumber && $scope.userName;
    };

    $scope.completePassword = function() {
        identityKeepService.get($scope.hostName, $scope.portNumber, $scope.userName).then(function(result) {
            if (!$scope.password) {
                $scope.password = result.password;
            }
        });
    };

    $scope.isCACertificateVisible = function() {
        return isUseSSLConnection();
    };

}]);
