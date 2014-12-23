chromeMyAdmin.controller("LoginFormController", ["$scope", "$timeout", "mySQLClientService", "favoriteService", "Events", "identityKeepService", "ssh2PortForwardingService", "UIConstants", function($scope, $timeout, mySQLClientService, favoriteService, Events, identityKeepService, ssh2PortForwardingService, UIConstants) {
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
                useSSL: isUseSSLConnection(),
                usePortForwarding: isUsePortForwarding()
            };
            $scope.notifyConnectionChanged(connectionInfo);
        });
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustLoginFormHeight();
        });
    };

    var adjustLoginFormHeight = function() {
        $("#loginForm").height(
            $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT);
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
                $scope.usePortForwarding = favorite.usePortForwarding || "no";
                $scope.ssh2HostName = favorite.ssh2HostName;
                $scope.ssh2PortNumber = favorite.ssh2Port;
                $scope.ssh2AuthType = favorite.ssh2AuthType || "password";
                $scope.ssh2UserName = favorite.ssh2UserName;
                $scope.ssh2Password = favorite.ssh2Password;
            });
        });
        $scope.$on(Events.LOGIN, function(event, data) {
            doConnect();
        });
        $scope.$on(Events.CONTINUE_SSH2_PORT_FORWARDING, function(event, data) {
            continueSsh2PortForwarding();
        });
        assignWindowResizeEventHandler();
        adjustLoginFormHeight();
    };

    var continueSsh2PortForwarding = function() {
        ssh2PortForwardingService.portForwarding($scope.ssh2AuthType, $scope.ssh2UserName, $scope.ssh2Password, $scope.hostName, $scope.portNumber).then(function(result) {
            doConnectToMySQL("127.0.0.1", result.values[0]);
        }, function(reason) {
            console.log(reason);
            $scope.showErrorDialog("Port forwarding failed.",
                                   reason.values[0]);
            mySQLClientService.logout();
        });
    };

    var doConnectToMySQL = function(hostName, portNumber) {
        if (isUseSSLConnection()) {
            mySQLClientService.loginWithSSL(
                hostName,
                Number(portNumber),
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
                hostName,
                Number(portNumber),
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

    var doConnect = function() {
        if (isUsePortForwarding()) {
            ssh2PortForwardingService.connect($scope.ssh2HostName, $scope.ssh2PortNumber).then(function(result) {
                var fingerprint = result.values[0];
                var disp = fingerprint.substring(0, 2);
                for (var i = 2; i < fingerprint.length; i += 2) {
                    disp += ":" + fingerprint.substring(i, i + 2);
                }
                $scope.showConfirmDialog(
                    "Please check the host key: " + disp,
                    "Connect",
                    "Cancel",
                    Events.CONTINUE_SSH2_PORT_FORWARDING,
                    false);
            }, function(reason) {
                console.log(reason);
                $scope.showErrorDialog("Connection failed to SSH2 server.",
                                       reason.values[0]);
                mySQLClientService.logout();
            });
        } else {
            doConnectToMySQL($scope.hostName, $scope.portNumber);
        }
    };

    var isUseSSLConnection = function() {
        return $scope.useSSL === "yes";
    };

    var isUsePortForwarding = function() {
        return $scope.usePortForwarding === "yes";
    };

    var isCheckCN = function() {
        return $scope.checkCN === "yes";
    };

    var setupItems = function() {
        $scope.ssh2AuthTypes = ["password", "keyboard-interactive"];
    };

    // Public methods

    $scope.initialize = function() {
        setupItems();
        assignEventHandlers();
        $scope.portNumber = 3306;
        $scope.useSSL = "no";
        $scope.checkCN = "yes";
        $scope.usePortForwarding = "no";
        $scope.ssh2PortNumber = 22;
        $scope.ssh2AuthType = "password";
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
            favoriteService.set(name,
                                $scope.hostName,
                                Number($scope.portNumber),
                                $scope.userName,
                                $scope.password,
                                $scope.useSSL,
                                $scope.caCert,
                                $scope.checkCN,
                                $scope.usePortForwarding,
                                $scope.ssh2HostName,
                                $scope.ssh2PortNumber,
                                $scope.ssh2AuthType,
                                $scope.ssh2UserName,
                                $scope.ssh2Password);
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

    $scope.isUsePortForwarding = function() {
        return isUsePortForwarding();
    };

}]);
