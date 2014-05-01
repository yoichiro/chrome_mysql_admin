chromeMyAdmin.controller("NavbarController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", "Events", "Modes", function($scope, mySQLClientService, modeService, targetObjectService, Events, Modes) {
    "use strict";

    var loadDatabaseList = function() {
        mySQLClientService.getDatabases().then(function(databases) {
            $scope.safeApply(function() {
                $scope.selectedDatabase = "[Select database]";
                $scope.databases = databases;
                modeService.changeMode(Modes.DATABASE);
            });
        });
    };

    var onConnectionChanged = function(connectionInfo) {
        if (mySQLClientService.isConnected()) {
            $scope.safeApply(function() {
                targetObjectService.resetDatabase();
                loadDatabaseList();
                $scope.connectionInfo = connectionInfo;
                $("body").popover({
                    placement: "bottom",
                    trigger: "hover",
                    html: true,
                    content: function() {
                        var info = $scope.connectionInfo;
                        return "Server: " +
                            info.hostName + ":" + info.port + "<br />" +
                            "MySQL version: " +
                            info.initialHandshakeRequest.serverVersion;
                    },
                    container: "body",
                    selector: "[rel=\"popover\"]"
                });
            });
        }
    };

    var logout = function() {
        mySQLClientService.logout().then(function() {
            $scope.notifyConnectionChanged();
        });
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, connectionInfo) {
            onConnectionChanged(connectionInfo);
        });
        $scope.$on(Events.LOGOUT, function(event, data) {
            logout();
        });
        $scope.$on(Events.REFRESH_DATABASES, function(event, data) {
            loadDatabaseList();
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        $scope.selectedDatabase = "[Select database]";
    };

    $scope.isNavbarVisible = function() {
        return mySQLClientService.isConnected();
    };

    $scope.selectDatabase = function(event, database) {
        $scope.selectedDatabase = database;
        targetObjectService.changeDatabase(database);
    };

    $scope.logout = function(event) {
        $scope.showConfirmDialog(
            "Would you really like to logout from MySQL server?",
            "Yes",
            "No",
            Events.LOGOUT
        );
    };

    $scope.isRowsActive = function() {
        return modeService.getMode() === Modes.ROWS;
    };

    $scope.isStructureActive = function() {
        return modeService.getMode() === Modes.STRUCTURE;
    };

    $scope.isQueryActive = function() {
        return modeService.getMode() === Modes.QUERY;
    };

    $scope.isDatabaseActive = function() {
        return modeService.getMode() === Modes.DATABASE;
    };

    $scope.selectRows = function() {
        modeService.changeMode(Modes.ROWS);
    };

    $scope.selectStructure = function() {
        modeService.changeMode(Modes.STRUCTURE);
    };

    $scope.selectQuery = function() {
        modeService.changeMode(Modes.QUERY);
    };

    $scope.showDatabaseInfo = function() {
        modeService.changeMode(Modes.DATABASE);
    };

}]);
