"use strict";

chromeMyAdmin.controller("DatabaseObjectListController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustObjectListHeight();
        });
    };

    var adjustObjectListHeight = function() {
        $("#objectList").height($(window).height() - 51 - 35);
    };

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
        assignWindowResizeEventHandler();
        adjustObjectListHeight();
    };

    $scope.selectTable = function(tableName) {
        $rootScope.$broadcast("tableSelected", tableName);
    };

}]);
