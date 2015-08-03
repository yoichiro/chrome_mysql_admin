chromeMyAdmin.controller("LoginFormController", function(
    $scope,
    $timeout,
    mySQLClientService,
    favoriteService,
    Events,
    identityKeepService,
    ssh2PortForwardingService,
    UIConstants,
    ssh2KnownHostService
) {
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
                $scope.ssh2PrivateKey = favorite.ssh2PrivateKey;
            });
        });
        $scope.$on(Events.LOGIN, function(event, data) {
            doConnect();
        });
        $scope.$on(Events.CONTINUE_SSH2_PORT_FORWARDING, function(event, data) {
            ssh2KnownHostService.addLastChecked().then(function(result) {
                continueSsh2PortForwarding(function(port) {
                    doConnectToMySQL("127.0.0.1", port);
                });
            });
        });
        $scope.$on(Events.CONTINUE_SSH2_PORT_FORWARDING_FOR_TEST, function(event, data) {
            ssh2KnownHostService.addLastChecked().then(function(result) {
                continueSsh2PortForwarding(function(port) {
                    doTestConnectToMySQL("127.0.0.1", port);
                });
            });
        });
        assignWindowResizeEventHandler();
        adjustLoginFormHeight();
    };

    var continueSsh2PortForwarding = function(callback) {
        var privateKey = $scope.ssh2PrivateKey || "";
        ssh2PortForwardingService.portForwarding($scope.ssh2AuthType, $scope.ssh2UserName, $scope.ssh2Password, $scope.hostName, $scope.portNumber, $scope.ssh2PrivateKey).then(function(result) {
            callback(result.values[0]);
        }, function(reason) {
            $scope.showErrorDialog("Port forwarding failed.",
                                   reason.values[0]);
            mySQLClientService.logout();
        });
    };

    var doTestConnectToMySQL = function(hostName, portNumber) {
        if (isUseSSLConnection()) {
            mySQLClientService.loginWithSSL(
                hostName,
                Number(portNumber),
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
                hostName,
                Number(portNumber),
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
            startPortForwarding(Events.CONTINUE_SSH2_PORT_FORWARDING);
        } else {
            doConnectToMySQL($scope.hostName, $scope.portNumber);
        }
    };

    var startPortForwarding = function(event) {
        var hostName = $scope.ssh2HostName;
        var port = $scope.ssh2PortNumber;
        ssh2PortForwardingService.connect(hostName, port).then(function(result) {
            var fingerprint = result.values[0];
            var hostkeyMethod = result.values[1];
            ssh2KnownHostService.check(hostName, port, hostkeyMethod, fingerprint).then(function(result) {
                var disp = hostkeyMethod + " " + fingerprint.substring(0, 2);
                for (var i = 2; i < fingerprint.length; i += 2) {
                    disp += ":" + fingerprint.substring(i, i + 2);
                }
                if (result.result === "found") {
                    if (event === Events.CONTINUE_SSH2_PORT_FORWARDING) {
                        continueSsh2PortForwarding(function(port) {
                            doConnectToMySQL("127.0.0.1", port);
                        });
                    } else if (event === Events.CONTINUE_SSH2_PORT_FORWARDING_FOR_TEST) {
                        continueSsh2PortForwarding(function(port) {
                            doTestConnectToMySQL("127.0.0.1", port);
                        });
                    }
                } else if (result.result === "not_found") {
                    $scope.showConfirmDialog(
                        "Please check the fingerprint: " + disp,
                        "Connect",
                        "Cancel",
                        event,
                        false);
                } else { // not_same
                    $scope.showConfirmDialog(
                        "Not same as the previous: " + disp,
                        "Connect",
                        "Cancel",
                        event,
                        true);
                }
            });
        }, function(reason) {
            $scope.showErrorDialog("Connection failed to SSH2 server.",
                                   reason.values[0]);
            mySQLClientService.logout();
        });
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
        $scope.ssh2AuthTypes = ["password", "keyboard-interactive", "publickey"];
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
        if (isUsePortForwarding()) {
            startPortForwarding(Events.CONTINUE_SSH2_PORT_FORWARDING_FOR_TEST);
        } else {
            doTestConnectToMySQL($scope.hostName, $scope.portNumber);
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
                                $scope.ssh2Password,
                                $scope.ssh2PrivateKey);
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

    $scope.isUsePortForwardingPublicKeyAuth = function() {
        return isUsePortForwarding() && ($scope.ssh2AuthType === "publickey");
    };

});
