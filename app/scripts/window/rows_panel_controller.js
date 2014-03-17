"use strict";

chromeMyAdmin.controller("RowsPanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", function($scope, mySQLClientService, modeService, targetObjectService) {

    var initializeRowsGrid = function() {
        resetRowsGrid();
        $scope.rowsGrid = {
            data: "rowsData",
            columnDefs: "rowsColumnDefs",
            enableColumnResize: true,
            headerRowHeight: 25,
            rowHeight: 25
        };
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetRowsGrid();
        }
    };

    var resetRowsGrid = function() {
        $scope.rowsColumnDefs = [];
        $scope.rowsData = [];
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustRowsPanelHeight();
        });
    };

    var adjustRowsPanelHeight = function() {
        $("#rowsGrid").height($(window).height() - 76);
    };

    var updateRowsColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.name,
                displayName: columnDefinition.name,
                width: Math.min(Number(columnDefinition.columnLength) * 14, 300)
            });
        }, columnDefs);
        $scope.rowsColumnDefs = columnDefs;
    };

    var updateRows = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.name] = values[index];
            });
            rows.push(row);
        });
        $scope.rowsData = rows;
    };

    var loadRows = function(tableName) {
        mySQLClientService.query("SELECT * FROM " + tableName + " LIMIT 1000").then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateRowsColumnDefs(result.columnDefinitions);
                    updateRows(result.columnDefinitions, result.resultsetRows);
                });
            } else {
                $scope.fatalErrorOccurred("Retrieving rows failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var onModeChanged = function(mode) {
        if (mode === "rows") {
            var tableName = targetObjectService.getTable();
            if ($scope.tableName !== tableName) {
                $scope.tableName = tableName;
                loadRows(tableName);
            }
        }
    };

    var _isRowsPanelVisible = function() {
        return mySQLClientService.isConnected()
            && modeService.getMode() === "rows";
    };

    $scope.initialize = function() {
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        $scope.$on("databaseChanged", function(event, database) {
            resetRowsGrid();
        });
        $scope.$on("tableChanged", function(event, tableName) {
            if (_isRowsPanelVisible()) {
                $scope.tableName = tableName;
                loadRows(tableName);
            }
        });
        $scope.$on("modeChanged", function(event, mode) {
            onModeChanged(mode);
        });
        initializeRowsGrid();
        assignWindowResizeEventHandler();
        adjustRowsPanelHeight();
    };

    $scope.isRowsPanelVisible = function() {
        return _isRowsPanelVisible();
    };

}]);
