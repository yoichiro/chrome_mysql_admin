"use strict";

chromeMyAdmin.controller("RowsPanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", "$q", "rowsPagingService", function($scope, mySQLClientService, modeService, targetObjectService, $q, rowsPagingService) {

    var initializeRowsGrid = function() {
        resetRowsGrid();
        $scope.rowsGrid = {
            data: "rowsData",
            columnDefs: "rowsColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
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
        $("#rowsGrid").height($(window).height() - 76 - 30);
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

    var updateColumnNames = function(columnDefinitions) {
        $scope.columnNames = jQuery.map(columnDefinitions, function(columnDefinition, i) {
            return columnDefinition.name;
        });
    };

    var createSqlWhereSection = function() {
        var filterColumnName = $scope.filterColumnName;
        if (filterColumnName && filterColumnName.length > 0) {
            var filterValue = $scope.filterValue;
            if (filterValue && filterValue.length > 0) {
                filterValue = filterValue.replace(/'/g, "\\'");
                var result =
                        " WHERE `" +
                        filterColumnName +
                        "` " +
                        $scope.filterOperator +
                        " '" +
                        filterValue +
                        "'";
                return result;
            }
        }
        return "";
    };

    var createSqlLimitSection = function() {
        var paging = rowsPagingService.current();
        var sql = " LIMIT " + paging.offset + ", " + paging.count;
        return sql;
    };

    var loadRows = function(tableName) {
        var rowsCount = 0;
        var where = createSqlWhereSection();
        mySQLClientService.query("SELECT COUNT(*) FROM `" + tableName + "`" + where).then(function(result) {
            if (result.hasResultsetRows) {
                rowsCount = result.resultsetRows[0].values[0];
                rowsPagingService.updateTotalRowCount(rowsCount);
                return mySQLClientService.query("SELECT * FROM `" + tableName + "` " + where + createSqlLimitSection());
            } else {
                return $q.reject("Retrieving rows count failed.");
            }
        }).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateRowsColumnDefs(result.columnDefinitions);
                    updateColumnNames(result.columnDefinitions);
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
            if (tableName) {
                if ($scope.tableName !== tableName) {
                    $scope.tableName = tableName;
                    initializeOptions();
                    loadRows(tableName);
                }
            } else {
                resetRowsGrid();
                $scope.tableName = null;
            }
        }
    };

    var _isRowsPanelVisible = function() {
        return mySQLClientService.isConnected()
            && modeService.getMode() === "rows";
    };

    var assignEventHandlers = function() {
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        $scope.$on("databaseChanged", function(event, database) {
            rowsPagingService.reset();
            resetRowsGrid();
        });
        $scope.$on("tableChanged", function(event, tableName) {
            if (_isRowsPanelVisible()) {
                rowsPagingService.reset();
                $scope.tableName = tableName;
                if (tableName) {
                    initializeOptions();
                    loadRows(tableName);
                } else {
                    resetRowsGrid();
                }
            }
        });
        $scope.$on("modeChanged", function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on("rowsPagingChanged", function(event, currentPageIndex) {
            doQueryAndReload();
        });
    };

    var doQueryAndReload = function() {
        var tableName = targetObjectService.getTable();
        if (tableName) {
            loadRows(tableName);
        }
    };

    var initializeOptions = function() {
        $scope.operators = ["=", "!=", "<", ">", "<=", ">=", "LIKE"];
        $scope.filterOperator = $scope.operators[0];
        $scope.columnNames = [];
        $scope.filterValue = null;
        $scope.filterColumnName = null;
    };

    $scope.initialize = function() {
        assignEventHandlers();
        initializeRowsGrid();
        assignWindowResizeEventHandler();
        adjustRowsPanelHeight();
        initializeOptions();
    };

    $scope.isRowsPanelVisible = function() {
        return _isRowsPanelVisible();
    };

    $scope.filter = function() {
        rowsPagingService.reset();
        doQueryAndReload();
    };

}]);
