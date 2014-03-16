"use strict";

chromeMyAdmin.controller("DatabaseObjectListController", ["$scope", "mySQLClientService", function($scope, mySQLClientService) {

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustObjectListHeight();
        });
    };

    var adjustObjectListHeight = function() {
        $("#objectList").height($(window).height() - 51 - 35);
    };

    var databaseChanged = function(database) {
        $scope.selectedDatabase = database;
        mySQLClientService.query("USE " + database).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Changing database failed.");
            } else {
                loadTables();
            }
        }, function(reason) {
            var errorMessage = reason.errorMessage;
            $scope.fatalErrorOccurred(errorMessage);
        });
    };

    var loadTables = function() {
        console.log("loadTables");
        mySQLClientService.query("SHOW TABLES").then(function(result) {
            if (result.hasResultsetRows) {
                updateTableList(
                    result.columnDefinitions,
                    result.resultsetRows);
            } else {
                $scope.fatalErrorOccurred("Retrieving tables failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
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
        if (!mySQLClientService.isConnected()) {
            $scope.tables = [];
        }
    };

    $scope.initialize = function() {
        $scope.$on("databaseChanged", function(event, database) {
            console.log("databaseChanged");
            databaseChanged(database);
        });
        $scope.tables = [];
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        assignWindowResizeEventHandler();
        adjustObjectListHeight();
    };

    $scope.selectTable = function(tableName) {
        console.log("selectTable");
        $scope.notifyTableChanged(tableName);
    };

}]);
