chromeMyAdmin.controller("StructurePanelController", function(
    $scope,
    mySQLClientService,
    modeService,
    targetObjectService,
    UIConstants,
    $q,
    Events,
    Modes,
    mySQLQueryService,
    Templates,
    TableTypes,
    anyQueryExecuteService
) {
    "use strict";

    var initializeStructureGrid = function() {
        resetStructureGrid();
        $scope.structureGrid = {
            data: "structureData",
            columnDefs: "structureColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            multiSelect: false,
            selectedItems: $scope.selectedColumns,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    $scope.selectedColumn = rowItem.entity;
                } else {
                    $scope.selectedColumn = null;
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
        $scope.selectedColumn = null;
    };

    var initializeIndexesGrid = function() {
        resetIndexesGrid();
        $scope.indexesGrid = {
            data: "indexesData",
            columnDefs: "indexesColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            multiSelect: false,
            selectedItems: $scope.selectedIndexes,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    $scope.selectedIndex = rowItem.entity;
                } else {
                    $scope.selectedIndex = null;
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
        $scope.selectedIndex = null;
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetStructureGrid();
            resetIndexesGrid();
        }
    };

    var resetStructureGrid = function() {
        $scope.structureColumnDefs = [];
        $scope.structureData = [];
    };

    var resetIndexesGrid = function() {
        $scope.indexesColumnDefs = [];
        $scope.indexesData = [];
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustStructurePanelHeight();
            adjustIndexesPanelHeight();
        });
    };

    var adjustStructurePanelHeight = function() {
        $("#structureGrid").height(
            ($(window).height() -
             UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
             UIConstants.NAVBAR_HEIGHT -
             UIConstants.FOOTER_HEIGHT) * (2 / 3) -
                UIConstants.FOOTER_HEIGHT * 2); // Footer area x2 for columns table
    };

    var adjustIndexesPanelHeight = function() {
        $("#indexesGrid").height(
            ($(window).height() -
             UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
             UIConstants.NAVBAR_HEIGHT -
             UIConstants.FOOTER_HEIGHT) * (1 / 3) - 25);
    };

    var updateStructureColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.name,
                displayName: columnDefinition.name,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH),
                cellTemplate: Templates.CELL_TEMPLATE,
                headerCellTemplate: Templates.HEADER_CELL_TEMPLATE
            });
        }, columnDefs);
        $scope.structureColumnDefs = columnDefs;
    };

    var updateIndexesColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition, index) {
            if (index > 0) { // Skip table name
                this.push({
                    field: columnDefinition.name,
                    displayName: columnDefinition.name,
                    width: Math.min(
                        Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                        UIConstants.GRID_COLUMN_MAX_WIDTH),
                    cellTemplate: Templates.CELL_TEMPLATE,
                    headerCellTemplate: Templates.HEADER_CELL_TEMPLATE
                });
            }
        }, columnDefs);
        $scope.indexesColumnDefs = columnDefs;
    };

    var updateStructure = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.name] = values[index];
            });
            rows.push(row);
        });
        $scope.structureData = rows;
        $scope.selectedColumn = null;
    };

    var updateIndexes = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                if (index > 0) { // Skip table name
                    row[columnDefinition.name] = values[index];
                }
            });
            rows.push(row);
        });
        $scope.indexesData = rows;
        $scope.selectedIndex = null;
    };

    var loadStructure = function(tableName) {
        mySQLQueryService.showFullColumns(tableName).then(function(result) {
            $scope.safeApply(function() {
                updateStructureColumnDefs(result.columnDefinitions);
                updateStructure(result.columnDefinitions, result.resultsetRows);
            });
            return mySQLQueryService.showIndex(tableName);
        }).then(function(result) {
            $scope.safeApply(function() {
                updateIndexesColumnDefs(result.columnDefinitions);
                updateIndexes(result.columnDefinitions, result.resultsetRows);
            });
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var onModeChanged = function(mode) {
        if (mode === Modes.STRUCTURE) {
            var table = targetObjectService.getTable();
            if (table) {
                if (!$scope.selectedTable || ($scope.selectedTable.name !== table.name)) {
                    $scope.selectedTable = table;
                    loadStructure(table.name);
                }
            } else {
                resetStructureGrid();
                $scope.selectedTable = null;
            }
        }
    };

    var _isStructurePanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.STRUCTURE;
    };

    var deleteColumn = function() {
        var table = targetObjectService.getTable().name;
        var column = $scope.selectedColumn.Field;
        var sql = "ALTER TABLE `" + table + "` DROP COLUMN `" + column + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Deleting column failed.");
            } else {
                loadStructure(table);
            }
        }, function(reason) {
            $scope.showErrorDialog("Deleting column failed.", reason);
        });
    };

    var deleteIndex = function() {
        var table = targetObjectService.getTable().name;
        var indexName = $scope.selectedIndex.Key_name;
        var sql = "DROP INDEX `" + indexName + "` ON `" + table + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Deleting index failed.");
            } else {
                loadStructure(table);
            }
        }, function(reason) {
            $scope.showErrorDialog("Deleting index failed.", reason);
        });
    };

    var onTableChanged = function(table) {
        if (_isStructurePanelVisible()) {
            if (table) {
                $scope.selectedTable = table;
                loadStructure(table.name);
            } else {
                $scope.selectedTable = null;
                resetStructureGrid();
                resetIndexesGrid();
            }
        }
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            resetStructureGrid();
            resetIndexesGrid();
        });
        $scope.$on(Events.TABLE_CHANGED, function(event, table) {
            onTableChanged(table);
        });
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.DELETE_SELECTED_COLUMN, function(event, data) {
            deleteColumn();
        });
        $scope.$on(Events.DELETE_SELECTED_INDEX, function(event, data) {
            deleteIndex();
        });
        $scope.$on(Events.REQUEST_REFRESH, function(event, data) {
            onTableChanged(targetObjectService.getTable());
        });
        $scope.$on(Events.QUERY_EXECUTED, function(event, data) {
            $scope.selectedTable = null;
        });
    };

    $scope.initialize = function() {
        initializeStructureGrid();
        initializeIndexesGrid();
        assignWindowResizeEventHandler();
        adjustStructurePanelHeight();
        adjustIndexesPanelHeight();
        assignEventHandlers();
    };

    $scope.isStructurePanelVisible = function() {
        return _isStructurePanelVisible();
    };

    $scope.isTableSelection = function() {
        return targetObjectService.getTable() !== null;
    };

    $scope.isTable = function() {
        var table = targetObjectService.getTable();
        if (table) {
            return table.type === TableTypes.BASE_TABLE;
        } else {
            return false;
        }
    };

    $scope.isColumnSelection = function() {
        return $scope.selectedColumn !== null;
    };

    $scope.confirmDeleteSelectedColumn = function() {
        if ($scope.isTable() && $scope.isColumnSelection()) {
            $scope.showConfirmDialog(
                "Once deleted data will be undone. Would you really like to delete the selected column?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_COLUMN,
                true
            );
        }
    };

    $scope.addColumn = function() {
        if ($scope.isTable() && $scope.isTableSelection()) {
            targetObjectService.showAddColumnDialog();
        }
    };

    $scope.editColumn = function() {
        if ($scope.isTable() && $scope.isColumnSelection()) {
            var columnStructure = $scope.selectedColumn;
            var columnDefs = $scope.structureColumnDefs;
            targetObjectService.showEditColumnDialog(columnDefs, columnStructure);
        }
    };

    $scope.isIndexSelection = function() {
        return $scope.selectedIndex !== null;
    };

    $scope.confirmDeleteSelectedIndex = function() {
        if ($scope.isTable() && $scope.isIndexSelection()) {
            $scope.showConfirmDialog(
                "Once deleted data will be undone. Would you really like to delete the selected index?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_INDEX,
                true
            );
        }
    };

    $scope.addIndex = function() {
        if ($scope.isTable()) {
            var columnNames = [];
            angular.forEach($scope.structureData, function(column) {
                this.push(column.Field);
            }, columnNames);
            targetObjectService.showAddIndexDialog(columnNames);
        }
    };

    $scope.selectDistinct = function() {
        if ($scope.isColumnSelection()) {
            var columnStructure = $scope.selectedColumn;
            var name = columnStructure.Field;
            var sql = "SELECT `" + name + "`, COUNT(`" + name + "`) FROM `" +
                    targetObjectService.getTable().name + "` GROUP BY `" + name + "`";
            anyQueryExecuteService.showAndExecuteQueryPanel(sql, false);
        }
    };

});
