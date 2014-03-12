"use strict";

var chromeMyAdmin = angular.module("chromeMyAdmin", []);

chromeMyAdmin.run(function($rootScope) {

    $rootScope.connected = false;

    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $rootScope.fatalErrorOccurred = function(errorMessage) {
        $rootScope.$broadcast("fatalErrorOccurred", errorMessage);
    };

});

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

chromeMyAdmin.controller("NavbarController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    var loadDatabaseList = function() {
        MySQL.client.getDatabases(function(databases) {
            $scope.safeApply(function() {
                $scope.selectedDatabase = "[Select database]";
                $scope.databases = databases;
            });
        }, function(result) {
            // TODO
            console.log(result);
        }, function() {
            // TODO
            console.log("loadDatabases: failed");
        });
    };

    var onConnectionChanged = function() {
        if ($rootScope.connected === true) {
            loadDatabaseList();
        }
    };

    $scope.initialize = function() {
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        $scope.selectedDatabase = "[Select database]";
    };

    $scope.isNavbarVisible = function() {
        return $rootScope.connected === true;
    };

    $scope.selectDatabase = function(event, database) {
        $scope.selectedDatabase = database;
        $rootScope.$broadcast("databaseSelected", database);
    };

    $scope.logout = function(event) {
        $("#logoutConfirmDialog").modal("show");
    };

}]);

chromeMyAdmin.controller("DatabaseObjectListController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    var databaseSelected = function(database) {
        $scope.selectedDatabase = database;
        MySQL.client.query("USE " + database, function(columnDefinitions, resultsetRows) {
            // Never called.
        }, function(result) {
            if (result.isSuccess()) {
                loadTables();
            } else {
                $scope.fatalErrorOccurred("Using database [" + database + "] failed.");
            }
        }, function(result) {
            var errorMessage = result.errorMessage;
            $scope.fatalErrorOccurred(errorMessage);
        }, function(result) {
            $scope.fatalErrorOccurred(result);
        });
    };

    var loadTables = function() {
        console.log("loadTables");
        MySQL.client.query("SHOW TABLES", function(columnDefinitions, resultsetRows) {
            $scope.safeApply(function() {
                updateTableList(columnDefinitions, resultsetRows);
            });
        }, function(result) {
            // Never called.
        }, function(result) {
            var errorMessage = result.errorMessage;
            $scope.fatalErrorOccurred(errorMessage);
        }, function(result) {
            $scope.fatalErrorOccurred(result);
        });
    };

    var updateTableList = function(columnDefinition, resultsetRows) {
        console.log("updateTableList");
        var tables = [];
        for (var i = 0; i < resultsetRows.length; i++) {
            tables.push(resultsetRows[i].values[0]);
        }
        $scope.tables = tables;
    };

    var onConnectionChanged = function() {
        if ($rootScope.connected === false) {
            $scope.tables = [];
        }
    };

    $scope.initialize = function() {
        $scope.$on("databaseSelected", function(event, database) {
            console.log("databaseSelected");
            databaseSelected(database);
        });
        $scope.tables = [];
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
    };

    $scope.selectTable = function(tableName) {
        $rootScope.$broadcast("tableSelected", tableName);
    };

}]);

chromeMyAdmin.controller("LogoutConfirmDialogController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    $scope.logout = function() {
        console.log("logout");
        $("#logoutConfirmDialog").modal("hide");
        MySQL.client.logout(function() {
            $scope.safeApply(function() {
                $rootScope.connected = false;
                $rootScope.$broadcast("connectionChanged", null);
            });
        });
    };

}]);

chromeMyAdmin.controller("FatalDialogController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    $scope.initialize = function() {
        $("#fatalDialog").on("hidden.bs.modal", function() {
            MySQL.client.logout(function() {
                $scope.safeApply(function() {
                    $rootScope.connected = false;
                    $rootScope.$broadcast("connectionChanged", null);
                });
            });
        });
        $scope.$on("fatalErrorOccurred", function(event, errorMessage) {
            $scope.safeApply(function() {
                $scope.reason = errorMessage;
                $("#fatalDialog").modal("show");
            });
        });
    };

}]);

chromeMyAdmin.controller("DatabaseObjectController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    $scope.initialize = function() {
        $scope.$on("tableSelected", function(event, tableName) {
            console.log(tableName);
        });
    };

    $scope.isObjectPanelVisible = function() {
        return $rootScope.connected !== false;
    };

}]);
