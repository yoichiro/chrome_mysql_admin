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

    $scope.initialize = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, connectionInfo) {
            onConnectionChanged(connectionInfo);
        });
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
        $("#logoutConfirmDialog").modal("show");
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
