chromeMyAdmin.directive("rowsPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/rows_panel.html"
    };
});

chromeMyAdmin.controller("RowsPanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", "$q", "rowsPagingService", "rowsSelectionService", "UIConstants", "Events", "Modes", "sqlExpressionService", "Templates", function($scope, mySQLClientService, modeService, targetObjectService, $q, rowsPagingService, rowsSelectionService, UIConstants, Events, Modes, sqlExpressionService, Templates) {
    "use strict";

    var initializeRowsGrid = function() {
        resetRowsGrid();
        $scope.rowsGrid = {
            data: "rowsData",
            columnDefs: "rowsColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            enablePinning: true,
            multiSelect: false,
            selectedItems: $scope.selectedRows,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    rowsSelectionService.setSelectedRows(rowItem);
                } else {
                    rowsSelectionService.reset();
                }
            },
            dblClickFn: $scope.onDoubleClickedRow,
            plugins: [ngGridDoubleClick],
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
    };

    var ngGridDoubleClick = function() {
        var self = this;
        self.$scope = null;
        self.myGrid = null;
        self.init = function(scope, grid, services) {
            self.$scope = scope;
            self.myGrid = grid;
            self.assignEvents();
        };
        self.assignEvents = function() {
            self.myGrid.$viewport.on('dblclick', self.onDoubleClick);
        };
        self.onDoubleClick = function(event) {
            self.myGrid.config.dblClickFn(self.$scope.selectedItems[0]);
            self.$scope.$apply();
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
        $scope.lastQueryResult = null;
        rowsSelectionService.reset();
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustRowsPanelHeight();
        });
    };

    var adjustRowsPanelHeight = function() {
        $("#rowsGrid").height(
            $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT - 35);
    };

    var updateRowsColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition, index) {
            this.push({
                field: "column" + index,
                displayName: columnDefinition.name,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH),
                cellTemplate: Templates.CELL_TEMPLATE,
                headerCellTemplate: Templates.HEADER_CELL_TEMPLATE,
                pinnable: true
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
                row["column" + index] = values[index];
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

    var deleteSelectedRow = function() {
        if (!$scope.lastQueryResult) {
            return;
        }
        var row = rowsSelectionService.getSelectedRows();
        var originalRow = $scope.lastQueryResult.resultsetRows[row.rowIndex];
        var columnDefinitions = $scope.lastQueryResult.columnDefinitions;
        var primaryKeyColumns =
                sqlExpressionService.getPrimaryKeyColumns(columnDefinitions);
        var sql = "DELETE FROM `" + targetObjectService.getTable() + "` WHERE ";
        var whereConditions = sqlExpressionService.createWhereConditionsForUpdate(
            primaryKeyColumns, columnDefinitions, originalRow);
        sql += whereConditions.join(" AND ");
        sql += jQuery.isEmptyObject(primaryKeyColumns) ? " LIMIT 1" : "";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                return $q.reject("Deleting row failed.");
            } else {
                return doQueryAndReload();
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var loadRows = function(tableName) {
        rowsSelectionService.reset();
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
                    $scope.lastQueryResult = result;
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
        if (mode === Modes.ROWS) {
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

    var showInsertRowDialog = function() {
        if ($scope.lastQueryResult) {
            var columnDefinitions = $scope.lastQueryResult.columnDefinitions;
            targetObjectService.showInsertRowDialog(columnDefinitions);
        }
    };

    var showUpdateRowDialog = function() {
        if ($scope.lastQueryResult) {
            var columnDefinitions = $scope.lastQueryResult.columnDefinitions;
            var row = rowsSelectionService.getSelectedRows();
            var originalRow = $scope.lastQueryResult.resultsetRows[row.rowIndex];
            targetObjectService.showUpdateRowDialog({
                columnDefinitions: columnDefinitions,
                row: originalRow
            });
        }
    };

    var _isRowsPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.ROWS;
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            rowsPagingService.reset();
            resetRowsGrid();
        });
        $scope.$on(Events.TABLE_CHANGED, function(event, tableName) {
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
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.ROWS_PAGING_CHANGED, function(event, currentPageIndex) {
            doQueryAndReload();
        });
        $scope.$on(Events.DELETE_SELECTED_ROW, function(event, data) {
            deleteSelectedRow();
        });
        $scope.$on(Events.REQUEST_INSERT_ROW, function(event, table) {
            showInsertRowDialog();
        });
        $scope.$on(Events.REQUEST_UPDATE_ROW, function(event, table) {
            showUpdateRowDialog();
        });
        $scope.$on(Events.REQUEST_REFRESH, function(event, data) {
            if (modeService.getMode() === Modes.ROWS) {
                doQueryAndReload();
            }
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

    $scope.onDoubleClickedRow = function(rowItem) {
        targetObjectService.requestUpdateRow();
    };

    $scope.isRowsPanelVisible = function() {
        return _isRowsPanelVisible();
    };

    $scope.filter = function() {
        rowsPagingService.reset();
        doQueryAndReload();
    };

}]);
