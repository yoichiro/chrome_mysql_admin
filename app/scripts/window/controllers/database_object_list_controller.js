chromeMyAdmin.directive("databaseObjectListPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/database_object_list_panel.html"
    };
});

chromeMyAdmin.controller("DatabaseObjectListController", ["$scope", "mySQLClientService", "targetObjectService", "modeService", "Events", "Modes", function($scope, mySQLClientService, targetObjectService, modeService, Events, Modes) {
    "use strict";

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustObjectListHeight();
        });
    };

    var adjustObjectListHeight = function() {
        $("#objectList").height($(window).height() - 51 - 35);
    };

    var databaseChanged = function() {
        targetObjectService.resetTable();
        mySQLClientService.query(
            "USE `" + targetObjectService.getDatabase() + "`").then(function(result) {
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

    var doRefresh = function() {
        if (targetObjectService.getDatabase()) {
            targetObjectService.resetTable();
            loadTables();
        } else {
            clearTables();
        }
    };

    var doDropTable = function() {
        var sql = "DROP TABLE `" + targetObjectService.getTable() + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Dropping table failed.");
            } else {
                doRefresh();
            }
        }, function(reason) {
            $scope.showErrorDialog("Dropping table failed.", reason);
            doRefresh();
        });
    };

    var clearTables = function() {
        $scope.tables = [];
    };

    $scope.initialize = function() {
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            databaseChanged();
        });
        clearTables();
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.REFRESH_TABLE_LIST, function(event, database) {
            doRefresh();
        });
        $scope.$on(Events.DROP_SELECTED_TABLE, function(event, data) {
            doDropTable();
        });
        assignWindowResizeEventHandler();
        adjustObjectListHeight();
    };

    $scope.selectTable = function(tableName) {
        targetObjectService.changeTable(tableName);
        if (modeService.getMode() === Modes.DATABASE) {
            modeService.changeMode(Modes.ROWS);
        }
    };

    $scope.isTableActive = function(tableName) {
        return tableName === targetObjectService.getTable();
    };

    $scope.refresh = function() {
        doRefresh();
    };

    $scope.isDatabaseObjectListVisible = function() {
        return mySQLClientService.isConnected();
    };

    $scope.isDatabaseSelection = function() {
        return targetObjectService.getDatabase() !== null;
    };

    $scope.createTable = function() {
        $("#createTableDialog").modal("show");
    };

    $scope.isTableSelection = function() {
        return targetObjectService.getTable() !== null;
    };

    $scope.confirmDropSelectedTable = function() {
        $scope.showConfirmDialog(
            "Would you really like to drop the selected table from MySQL server?",
            "Yes",
            "No",
            Events.DROP_SELECTED_TABLE
        );
    };

}]);
