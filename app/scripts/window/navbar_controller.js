"use strict";

chromeMyAdmin.controller("NavbarController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", function($scope, mySQLClientService, modeService, targetObjectService) {

    var loadDatabaseList = function() {
        mySQLClientService.getDatabases().then(function(databases) {
            $scope.safeApply(function() {
                $scope.selectedDatabase = "[Select database]";
                $scope.databases = databases;
            });
        });
    };

    var onConnectionChanged = function() {
        if (mySQLClientService.isConnected()) {
            targetObjectService.resetDatabase();
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
        return modeService.getMode() === "rows";
    };

    $scope.isStructureActive = function() {
        return modeService.getMode() === "structure";
    };

    $scope.isQueryActive = function() {
        return modeService.getMode() === "query";
    };

    $scope.selectRows = function() {
        modeService.changeMode("rows");
    };

    $scope.selectStructure = function() {
        modeService.changeMode("structure");
    };

    $scope.selectQuery = function() {
        modeService.changeMode("query");
    };

}]);
