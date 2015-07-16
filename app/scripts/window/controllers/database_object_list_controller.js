chromeMyAdmin.controller("DatabaseObjectListController", function(
    $scope,
    mySQLClientService,
    targetObjectService,
    modeService,
    Events,
    Modes,
    mySQLQueryService,
    UIConstants,
    TableTypes
) {
    "use strict";

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustObjectListHeight();
        });
    };

    var adjustObjectListHeight = function() {
        $("#objectList").height(
            $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                35 - 35);
    };

    var databaseChanged = function() {
        targetObjectService.resetTable();
        var database = targetObjectService.getDatabase();
        mySQLQueryService.useDatabase(database).then(function() {
            loadTables();
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var loadTables = function() {
        mySQLQueryService.showTables().then(function(result) {
            updateTableList(
                result.columnDefinitions,
                result.resultsetRows);
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateTableList = function(columnDefinition, resultsetRows) {
        var tables = [];
        for (var i = 0; i < resultsetRows.length; i++) {
            var type = resultsetRows[i].values[1];
            var className;
            if (type === "VIEW") {
                className = "glyphicon-eye-open";
            } else {
                className = "glyphicon-th-large";
            }
            tables.push({
                name: resultsetRows[i].values[0],
                type: type,
                className: className
            });
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
        var table = targetObjectService.getTable();
        var type;
        if (table.type === TableTypes.BASE_TABLE) {
            type = "TABLE";
        } else if (table.type === TableTypes.VIEW) {
            type = "VIEW";
        } else {
            console.log("Warning: Invalid table type: " + table.type);
            type = table.type;
        }
        var sql = "DROP " + type + " `" + table.name + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Dropping " + type + " failed.");
            } else {
                doRefresh();
            }
        }, function(reason) {
            $scope.showErrorDialog("Dropping " + type + " failed.", reason);
            doRefresh();
        });
    };

    var doTruncateTable = function() {
        var table = targetObjectService.getTable();
        var sql = "TRUNCATE TABLE `" + table.name + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Truncating table failed.");
            } else {
                doRefresh();
            }
        }, function(reason) {
            $scope.showErrorDialog("Truncating table failed.", reason);
            doRefresh();
        });
    };

    var clearTables = function() {
        $scope.tables = [];
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            databaseChanged();
        });
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.REFRESH_TABLE_LIST, function(event, database) {
            doRefresh();
        });
        $scope.$on(Events.DROP_SELECTED_TABLE, function(event, data) {
            doDropTable();
        });
        $scope.$on(Events.TRUNCATE_SELECTED_TABLE, function(event, data) {
            doTruncateTable();
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        clearTables();
        assignWindowResizeEventHandler();
        adjustObjectListHeight();
    };

    $scope.selectTable = function(table) {
        targetObjectService.changeTable(table);
        if (modeService.getMode() === Modes.DATABASE ||
           modeService.getMode() === Modes.QUERY ||
           modeService.getMode() === Modes.STATUS_GRAPH) {
            modeService.changeMode(Modes.ROWS);
        }
    };

    $scope.isTableActive = function(tableName) {
        var table = targetObjectService.getTable();
        return table && tableName === table.name;
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
        var table = targetObjectService.getTable();
        return table && table.name !== null;
    };

    $scope.canDrop = function() {
        var table = targetObjectService.getTable();
        if (table) {
            return table.type === TableTypes.BASE_TABLE ||
                table.type === TableTypes.VIEW;
        } else {
            return false;
        }
    };

    $scope.canTruncate = function() {
        var table = targetObjectService.getTable();
        if (table) {
            return table.type === TableTypes.BASE_TABLE;
        } else {
            return false;
        }
    };

    $scope.confirmDropSelectedTable = function() {
        if ($scope.canDrop()) {
            var table = targetObjectService.getTable();
            var type;
            if (table.type === TableTypes.BASE_TABLE) {
                type = "table";
            } else if (table.type === TableTypes.VIEW) {
                type = "view";
            }
            $scope.showConfirmDialog(
                "Once deleted data will be undone. Would you really like to drop the selected " + type + " from MySQL server?",
                "Yes",
                "No",
                Events.DROP_SELECTED_TABLE,
                true
            );
        }
    };

    $scope.confirmTruncateSelectedTable = function() {
        if ($scope.canTruncate()) {
            var table = targetObjectService.getTable();
            $scope.showConfirmDialog(
                "Once deleted data will be undone. Would you really like to truncate the selected table?",
                "Yes",
                "No",
                Events.TRUNCATE_SELECTED_TABLE,
                true
            );
        }
    };

});
