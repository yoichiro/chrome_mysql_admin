"use strict";

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
