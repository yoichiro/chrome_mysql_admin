chromeMyAdmin.directive("proceduresFunctionsPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/procs_funcs_panel.html"
    };
});

chromeMyAdmin.controller("ProceduresFunctionsPanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", "UIConstants", "Modes", "Events", "mySQLQueryService", "Templates", function($scope, mySQLClientService, modeService, targetObjectService, UIConstants, Modes, Events, mySQLQueryService, Templates) {
    "use strict";

    var initializeProceduresGrid = function() {
        resetProceduresGrid();
        $scope.proceduresGrid = {
            data: "proceduresData",
            columnDefs: "proceduresColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            multiSelect: false,
            selectedItems: $scope.selectedProcedures,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    $scope.selectedProcedure = rowItem.entity;
                } else {
                    $scope.selectedProcedure = null;
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
        $scope.selectedProcedure = null;
    };

    var initializeFunctionsGrid = function() {
        resetFunctionsGrid();
        $scope.functionsGrid = {
            data: "functionsData",
            columnDefs: "functionsColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            multiSelect: false,
            selectedItems: $scope.selectedFunctions,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    $scope.selectedFunction = rowItem.entity;
                } else {
                    $scope.selectedFunction = null;
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
        $scope.selectedFunction = null;
    };

    var resetProceduresGrid = function() {
        $scope.proceduresColumnDefs = [];
        $scope.proceduresData = [];
    };

    var resetFunctionsGrid = function() {
        $scope.functionsColumnDefs = [];
        $scope.functionsData = [];
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustProceduresPanelHeight();
            adjustFunctionsPanelHeight();
        });
    };

    var adjustProceduresPanelHeight = function() {
        $("#proceduresGrid").height(
            ($(window).height() -
             UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
             UIConstants.NAVBAR_HEIGHT -
             UIConstants.FOOTER_HEIGHT) * 0.5 -
                UIConstants.FOOTER_HEIGHT * 2); // Footer area x2 for columns table
    };

    var adjustFunctionsPanelHeight = function() {
        $("#functionsGrid").height(
            ($(window).height() -
             UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
             UIConstants.NAVBAR_HEIGHT -
             UIConstants.FOOTER_HEIGHT) * 0.5 - 50);
    };

    var _isProceduresFunctionsPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.PROCS_FUNCS;
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetProceduresGrid();
            resetFunctionsGrid();
        }
    };

    var loadProceduresAndFunctions = function() {
        var database = targetObjectService.getDatabase();
        mySQLQueryService.showProcedureStatus(database).then(function(result) {
            $scope.safeApply(function() {
                updateProceduresColumnDefs(result.columnDefinitions);
                updateProcedures(result.columnDefinitions, result.resultsetRows);
            });
            return mySQLQueryService.showFunctionStatus(database);
        }).then(function(result) {
            $scope.safeApply(function() {
                updateFunctionsColumnDefs(result.columnDefinitions);
                updateFunctions(result.columnDefinitions, result.resultsetRows);
            });
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateProceduresColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.orgName,
                displayName: columnDefinition.name,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH),
                cellTemplate: Templates.CELL_TEMPLATE,
                headerCellTemplate: Templates.HEADER_CELL_TEMPLATE
            });
        }, columnDefs);
        $scope.proceduresColumnDefs = columnDefs;
    };

    var updateFunctionsColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.orgName,
                displayName: columnDefinition.name,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH),
                cellTemplate: Templates.CELL_TEMPLATE,
                headerCellTemplate: Templates.HEADER_CELL_TEMPLATE
            });
        }, columnDefs);
        $scope.functionsColumnDefs = columnDefs;
    };

    var updateProcedures = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.orgName] = values[index];
            });
            rows.push(row);
        });
        $scope.proceduresData = rows;
        $scope.selectedProcedure = null;
    };

    var updateFunctions = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.orgName] = values[index];
            });
            rows.push(row);
        });
        $scope.functionsData = rows;
        $scope.selectedFunction = null;
    };

    var onModeChanged = function(mode) {
        if (mode === Modes.PROCS_FUNCS) {
            var database = targetObjectService.getDatabase();
            if (database) {
                if (!$scope.selectedDatabase || ($scope.selectedDatabase !== database)) {
                    $scope.selectedDatabase = database;
                    loadProceduresAndFunctions();
                }
            } else {
                resetProceduresGrid();
                resetFunctionsGrid();
                $scope.selectedDatabase = null;
            }
        }
    };

    var onDatabaseChanged = function() {
        if (modeService.getMode() === Modes.PROCS_FUNCS) {
            var database = targetObjectService.getDatabase();
            if (database) {
                loadProceduresAndFunctions();
            } else {
                resetProceduresGrid();
                resetFunctionsGrid();
            }
        } else {
            resetProceduresGrid();
            resetFunctionsGrid();
        }
    };

    var deleteProcedure = function() {
        var proc = $scope.selectedProcedure.ROUTINE_NAME;
        var sql = "DROP PROCEDURE `" + proc + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Deleting procedure failed.");
            } else {
                loadProceduresAndFunctions();
            }
        }, function(reason) {
            $scope.showErrorDialog("Deleting procedure failed.", reason);
        });
    };

    var deleteFunction = function() {
        var proc = $scope.selectedFunction.ROUTINE_NAME;
        var sql = "DROP FUNCTION `" + proc + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Deleting function failed.");
            } else {
                loadProceduresAndFunctions();
            }
        }, function(reason) {
            $scope.showErrorDialog("Deleting function failed.", reason);
        });
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            onDatabaseChanged();
        });
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.DELETE_SELECTED_PROCEDURE, function(event, data) {
            deleteProcedure();
        });
        $scope.$on(Events.DELETE_SELECTED_FUNCTION, function(event, data) {
            deleteFunction();
        });
        $scope.$on(Events.REFRESH_PROCEDURES_FUNCTIONS, function(event, data) {
            if (targetObjectService.getDatabase()) {
                loadProceduresAndFunctions();
            }
        });
    };

    $scope.initialize = function() {
        initializeProceduresGrid();
        initializeFunctionsGrid();
        assignWindowResizeEventHandler();
        adjustProceduresPanelHeight();
        adjustFunctionsPanelHeight();
        assignEventHandlers();
    };

    $scope.isProceduresFunctionsPanelVisible = function() {
        return _isProceduresFunctionsPanelVisible();
    };

    $scope.isProcedureSelection = function() {
        return $scope.selectedProcedure !== null;
    };

    $scope.isFunctionSelection = function() {
        return $scope.selectedFunction !== null;
    };

    $scope.confirmDeleteSelectedProcedure = function() {
        if ($scope.isProcedureSelection()) {
            $scope.showConfirmDialog(
                "Would you really like to delete the selected procedure?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_PROCEDURE
            );
        }
    };

    $scope.confirmDeleteSelectedFunction = function() {
        if ($scope.isFunctionSelection()) {
            $scope.showConfirmDialog(
                "Would you really like to delete the selected function?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_FUNCTION
            );
        }
    };

}]);
