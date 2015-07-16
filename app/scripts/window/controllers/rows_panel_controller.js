chromeMyAdmin.controller("RowsPanelController", function(
    $scope,
    mySQLClientService,
    modeService,
    targetObjectService,
    $q,
    rowsPagingService,
    rowsSelectionService,
    UIConstants,
    Events,
    Modes,
    sqlExpressionService,
    Templates,
    mySQLQueryService,
    columnTypeService,
    clipboardService
) {
    "use strict";

    var initializeRowsGrid = function() {
        $scope.sortOptions = {
            fields: [],
            directions: [],
            columns: []
        };
        resetRowsGrid();
        $scope.rowsGrid = {
            data: "rowsData",
            columnDefs: "rowsColumnDefs",
            enableColumnResize: true,
            enableSorting: true,
            useExternalSorting: true,
            sortInfo: $scope.sortOptions,
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

    var clearSortInfo = function () {
        $scope.sortOptions.fields = [];
        $scope.sortOptions.directions = [];
        $scope.sortOptions.columns = [];
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
        clearSortInfo();
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
            var params = {
                field: "column" + index,
                displayName: columnDefinition.name,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH),
                cellTemplate: Templates.CELL_TEMPLATE,
                headerCellTemplate: Templates.HEADER_CELL_TEMPLATE,
                pinnable: true
            };
            this.push(params);
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
        var sql = "DELETE FROM `" + targetObjectService.getTable().name + "` WHERE ";
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

    var isDifferentColumnDefinitions = function(newColumnDefinitions) {
        if ($scope.lastQueryResult) {
            var oldColumnDefinitions = $scope.lastQueryResult.columnDefinitions;
            if (oldColumnDefinitions.length !== newColumnDefinitions.length) {
                return true;
            }
            for (var i = 0; i < oldColumnDefinitions.length; i++) {
                var oldColumn = oldColumnDefinitions[i];
                var newColumn = newColumnDefinitions[i];
                if (oldColumn.name !== newColumn.name ||
                    oldColumn.orgName !== newColumn.orgName ||
                    oldColumn.characterSet !== newColumn.characterSet ||
                    oldColumn.columnLength !== newColumn.columnLength ||
                    oldColumn.columnType !== newColumn.columnType) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    };

    var loadRowCountWithWehereStatement = function(tableName, where) {
        return mySQLClientService.query("SELECT COUNT(*) FROM `" + tableName + "`" + where).then(function(result) {
            if (result.hasResultsetRows) {
                var rowsCount = result.resultsetRows[0].values[0];
                rowsPagingService.updateTotalRowCount(rowsCount);
                var order = createOrderStatement();
                return mySQLClientService.query("SELECT * FROM `" + tableName + "` " + where + order + createSqlLimitSection());
            } else {
                    return $q.reject("Retrieving rows count failed.");
            }
        });
    };

    var loadRowsCountWithoutWhereStatement = function(tableName) {
        return mySQLQueryService.showTableStatus(tableName).then(function(result) {
            if (result.hasResultsetRows) {
                var columnDefinitions = result.columnDefinitions;
                var idx;
                angular.forEach(columnDefinitions, function(column, index) {
                    if (column.name == "Rows") {
                        idx = index;
                    }
                });
                var rowsCount = result.resultsetRows[0].values[idx];
                rowsPagingService.updateTotalRowCount(rowsCount);
                var order = createOrderStatement();
                return mySQLClientService.query("SELECT * FROM `" + tableName + "` " + order + createSqlLimitSection());
            } else {
                return $q.reject("Retrieving rows count failed.");
            }
        });
    };

    var createOrderStatement = function() {
        var order = "";
        if ($scope.sortOptions.columns.length > 0) {
            order += " ORDER BY `";
            order += $scope.sortOptions.columns[0].displayName;
            order += "` " + $scope.sortOptions.directions[0].toUpperCase();
        }
        return order;
    };

    var loadRows = function(tableName) {
        rowsSelectionService.reset();
        var where = createSqlWhereSection();
        (where ?
         loadRowCountWithWehereStatement(tableName, where) :
         loadRowsCountWithoutWhereStatement(tableName)).then(function(result) {
             if (result.hasResultsetRows) {
                 $scope.safeApply(function() {
                     if (isDifferentColumnDefinitions(result.columnDefinitions)) {
                         clearSortInfo();
                         updateRowsColumnDefs(result.columnDefinitions);
                     }
                     updateColumnNames(result.columnDefinitions);
                     updateRows(result.columnDefinitions, result.resultsetRows);
                     $scope.lastQueryResult = result;
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
            var table = targetObjectService.getTable();
            if (table) {
                if ($scope.tableName !== table.name) {
                    $scope.tableName = table.name;
                    initializeOptions();
                    loadRows(table.name);
                }
            } else {
                resetRowsGrid();
                $scope.tableName = null;
            }
        }
    };

    var loadTableStructure = function(callback) {
        var tableName = targetObjectService.getTable();
        if (tableName) {
            mySQLQueryService.showFullColumns(tableName.name).then(function(result) {
                var resultsetRows = result.resultsetRows;
                var columnDefinitions = [];
                angular.forEach(resultsetRows, function(row) {
                    this.push({
                        name: row.values[0],
                        type: row.values[1],
                        isNotNull: function() {
                            return row.values[3] === "NO";
                        },
                        isPrimaryKey: function() {
                            return row.values[4] === "PRI";
                        }
                    });
                }, columnDefinitions);
                callback(columnDefinitions);
            }, function(reason) {
                $scope.fatalErrorOccurred(reason);
            });
        }
    };

    var showInsertRowDialog = function() {
        loadTableStructure(function(columnDefinitions) {
            targetObjectService.showInsertRowDialog(columnDefinitions);
        });
    };

    var showUpdateRowDialog = function() {
        loadTableStructure(function(columnDefinitions) {
            if ($scope.lastQueryResult) {
                var row = rowsSelectionService.getSelectedRows();
                var originalRow = $scope.lastQueryResult.resultsetRows[row.rowIndex];
                targetObjectService.showUpdateRowDialog({
                    columnDefinitions: columnDefinitions,
                    row: originalRow
                });
            }
        });
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
        $scope.$on(Events.TABLE_CHANGED, function(event, table) {
            if (_isRowsPanelVisible()) {
                rowsPagingService.reset();
                clearSortInfo();
                if (table) {
                    $scope.tableName = table.name;
                    initializeOptions();
                    loadRows(table.name);
                } else {
                    $scope.tableName = null;
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
        $scope.$watch("sortOptions", function(newVal, oldVal) {
            if (newVal !== oldVal) {
                doQueryAndReload();
            }
        }, true);
        $scope.$on(Events.QUERY_EXECUTED, function(event, data) {
            $scope.tableName = null;
        });
        $scope.$on(Events.COPY_ROWS_PANEL_ROW_TO_CLIPBOARD, function(event, data) {
            copyRowToClipboard();
        });
    };

    var copyRowToClipboard = function() {
        clipboardService.copyRow($scope.lastQueryResult,
                                 rowsSelectionService.getSelectedRows());
    };

    var doQueryAndReload = function() {
        var table = targetObjectService.getTable();
        if (table) {
            loadRows(table.name);
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
        initializeOptions();
        initializeRowsGrid();
        assignEventHandlers();
        assignWindowResizeEventHandler();
        adjustRowsPanelHeight();
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

});
