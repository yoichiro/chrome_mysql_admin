chromeMyAdmin.controller("RowsPanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", "$q", "rowsPagingService", "rowsSelectionService", "UIConstants", function($scope, mySQLClientService, modeService, targetObjectService, $q, rowsPagingService, rowsSelectionService, UIConstants) {
    "use strict";

    var initializeRowsGrid = function() {
        resetRowsGrid();
        $scope.rowsGrid = {
            data: "rowsData",
            columnDefs: "rowsColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            enableRowSelection: true,
            enableCellEdit: true,
            multiSelect: false,
            selectedItems: $scope.selectedRows,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    rowsSelectionService.setSelectedRows(rowItem);
                } else {
                    rowsSelectionService.reset();
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
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
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT - 35);
    };

    var updateRowsColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        var editableCellTemplate = "<input type=\"text\" ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\" ng-blur=\"updateCellValue(col, row, $event)\" />";
        angular.forEach(columnDefinitions, function(columnDefinition, index) {
            this.push({
                field: "column" + index,
                displayName: columnDefinition.name,
                enableCellEdit: true,
                editableCellTemplate: editableCellTemplate,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH)
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

    var confirmDeleteSelectedRow = function() {
        $("#deleteRowConfirmDialog").modal("show");
    };

    var getPrimaryKeyColumns = function(columnDefinitions) {
        var primaryKeyColumns = {};
        angular.forEach(columnDefinitions, function(columnDefinition, index) {
            if (columnDefinition.isPrimaryKey()) {
                this[index] = columnDefinition;
            }
        }, primaryKeyColumns);
        return primaryKeyColumns;
    };

    var requestDeleteSelectedRow = function(row) {
        if (!$scope.lastQueryResult) {
            return;
        }
        var originalRow = $scope.lastQueryResult.resultsetRows[row.rowIndex];
        var columnDefinitions = $scope.lastQueryResult.columnDefinitions;
        var primaryKeyColumns = getPrimaryKeyColumns(columnDefinitions);
        var sql = "DELETE FROM `" + targetObjectService.getTable() + "` WHERE ";
        var whereConditions = createWhereConditionsForUpdate(primaryKeyColumns, columnDefinitions, originalRow);
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

    var createWhereConditionsForUpdate = function(primaryKeyColumns, columnDefinitions, originalRow) {
        var whereConditions = [];
        if (jQuery.isEmptyObject(primaryKeyColumns)) {
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                var condition =
                        "`" + columnDefinition.name + "`='" +
                        originalRow.values[index].replace(/'/g, "\\'") + "'";
                this.push(condition);
            }, whereConditions);
        } else {
            angular.forEach(primaryKeyColumns, function(primaryKeyColumn, index) {
                var condition =
                        "`" + primaryKeyColumn.name + "`='" +
                        originalRow.values[index].replace(/'/g, "\\'") + "'";
                this.push(condition);
            }, whereConditions);
        }
        return whereConditions;
    };

    var doUpdateQuery = function(column, row) {
        if (!$scope.lastQueryResult) {
            return;
        }
        var originalRow = $scope.lastQueryResult.resultsetRows[row.rowIndex];
        var columnIndex = column.index;
        var originalValue = originalRow.values[columnIndex];
        var newValue = row.entity["column" + columnIndex];
        if (originalValue === newValue) {
            return;
        }
        var columnDefinitions = $scope.lastQueryResult.columnDefinitions;
        var primaryKeyColumns = getPrimaryKeyColumns(columnDefinitions);
        var sql = "UPDATE `" + targetObjectService.getTable() + "` SET `";
        sql += column.displayName + "`='" + newValue.replace(/'/g, "\\'") + "' WHERE ";
        var whereConditions = createWhereConditionsForUpdate(primaryKeyColumns, columnDefinitions, originalRow);
        sql += whereConditions.join(" AND ");
        sql += jQuery.isEmptyObject(primaryKeyColumns) ? " LIMIT 1" : "";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                return $q.reject("Updating row failed.");
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

    var showInsertRowPanel = function() {
        if ($scope.lastQueryResult) {
            var columnDefinitions = $scope.lastQueryResult.columnDefinitions;
            targetObjectService.showInsertRowPanel(columnDefinitions);
        }
    };

    var _isRowsPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === "rows";
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
        $scope.$on("confirmDeleteSelectedRow", function(event, selectedRow) {
            confirmDeleteSelectedRow();
        });
        $scope.$on("requestDeleteSelectedRow", function(event, selectedRow) {
            requestDeleteSelectedRow(selectedRow);
        });
        $scope.$on("requestInsertRow", function(event, table) {
            showInsertRowPanel();
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

    $scope.updateCellValue = function(column, row, $event) {
        doUpdateQuery(column, row);
    };

}]);
