"use strict";

chromeMyAdmin.controller("NavbarController", ["$scope", "mySQLClientService", function($scope, mySQLClientService) {

    var loadDatabaseList = function() {
        mySQLClientService.getDatabases().then(function(databases) {
            $scope.safeApply(function() {
                $scope.selectedDatabase = "[Select database]";
                $scope.databases = databases;
            });
        });
    };

    var onConnectionChanged = function() {
        console.log("onConnectionChanged");
        if (mySQLClientService.isConnected()) {
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
        $scope.notifyDatabaseChanged(database);
    };

    $scope.logout = function(event) {
        $("#logoutConfirmDialog").modal("show");
    };

}]);
