chromeMyAdmin.directive("proceduresFunctionsPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/procs_funcs_panel.html"
    };
});

chromeMyAdmin.controller("ProceduresFunctionsPanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", "UIConstants", "Modes", "Events", "mySQLQueryService", "Templates", "routineSelectionService", function($scope, mySQLClientService, modeService, targetObjectService, UIConstants, Modes, Events, mySQLQueryService, Templates, routineSelectionService) {
    "use strict";

    var initializeRoutinesGrid = function() {
        resetRoutinesGrid();
        $scope.routinesGrid = {
            data: "routinesData",
            columnDefs: "routinesColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            multiSelect: false,
            selectedItems: $scope.selectedRoutines,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    routineSelectionService.setSelectedRoutine(rowItem);
                } else {
                    routineSelectionService.reset();
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
    };

    var resetRoutinesGrid = function() {
        $scope.routinesColumnDefs = [];
        $scope.routinesData = [];
        routineSelectionService.reset();
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustRoutinesPanelHeight();
            adjustRoutineCodeEditorHeight();
        });
    };

    var adjustRoutinesPanelHeight = function() {
        $("#routinesGrid").height(
            ($(window).height() -
             UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
             UIConstants.NAVBAR_HEIGHT -
             UIConstants.FOOTER_HEIGHT) * 0.5);
    };

    var adjustRoutineCodeEditorHeight = function() {
        var totalHeight =
                $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT;
        $(".routineCodeEditor").height(totalHeight * 0.5 - 1);
    };

    var _isProceduresFunctionsPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.PROCS_FUNCS;
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetRoutinesGrid();
        }
    };

    var loadProceduresAndFunctions = function() {
        var database = targetObjectService.getDatabase();
        mySQLQueryService.showProcedureStatus(database).then(function(result) {
            $scope.safeApply(function() {
                resetRoutinesGrid();
                updateRoutinesColumnDefs(result.columnDefinitions);
                updateProcedures(result.columnDefinitions, result.resultsetRows);
            });
            return mySQLQueryService.showFunctionStatus(database);
        }).then(function(result) {
            $scope.safeApply(function() {
                updateFunctions(result.columnDefinitions, result.resultsetRows);
            });
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateRoutinesColumnDefs = function(columnDefinitions) {
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
        $scope.routinesColumnDefs = columnDefs;
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
        $scope.routinesData = rows;
    };

    var updateFunctions = function(columnDefinitions, resultsetRows) {
        var rows = $scope.routinesData;
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.orgName] = values[index];
            });
            rows.push(row);
        });
        $scope.routinesData = rows;
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
                resetRoutinesGrid();
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
                resetRoutinesGrid();
            }
        } else {
            resetRoutinesGrid();
        }
    };

    var deleteRoutine = function() {
        var selectedRoutine = routineSelectionService.getSelectedRoutine();
        if (selectedRoutine) {
            var routineName = selectedRoutine.entity.ROUTINE_NAME;
            var routineType = selectedRoutine.entity.ROUTINE_TYPE;
            var sql = "DROP " + routineType + " `" + routineName + "`";
            mySQLClientService.query(sql).then(function(result) {
                if (result.hasResultsetRows) {
                    $scope.fatalErrorOccurred("Deleting routine failed.");
                } else {
                    loadProceduresAndFunctions();
                }
            }, function(reason) {
                $scope.showErrorDialog("Deleting routine failed.", reason);
            });
        }
    };

    var routineSelectionChanged = function() {
        var selectedRoutine = routineSelectionService.getSelectedRoutine();
        if (selectedRoutine) {
            var database = targetObjectService.getDatabase();
            var routineName = selectedRoutine.entity.ROUTINE_NAME;
            var routineType = selectedRoutine.entity.ROUTINE_TYPE;
            mySQLQueryService.showCreateRoutine(database, routineName, routineType).then(function(result) {
                var routineCode = result.resultsetRows[0].values[2];
                $scope.routineCode = routineCode;
            }, function(reason) {
                $scope.showErrorDialog("Retrieving routine code failed.", reason);
            });
        } else {
            $scope.routineCode = "";
        }
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
        $scope.$on(Events.DELETE_SELECTED_ROUTINE, function(event, data) {
            deleteRoutine();
        });
        $scope.$on(Events.REFRESH_PROCEDURES_FUNCTIONS, function(event, data) {
            if (targetObjectService.getDatabase()) {
                loadProceduresAndFunctions();
            }
        });
        $scope.$on(Events.ROUTINE_SELECTION_CHANGED, function(event, data) {
            routineSelectionChanged();
        });
    };

    $scope.initialize = function() {
        initializeRoutinesGrid();
        assignWindowResizeEventHandler();
        adjustRoutinesPanelHeight();
        adjustRoutineCodeEditorHeight();
        assignEventHandlers();
    };

    $scope.isProceduresFunctionsPanelVisible = function() {
        return _isProceduresFunctionsPanelVisible();
    };

    $scope.isRoutineSelection = function() {
        return routineSelectionService.getSelectedRoutine() !== null;
    };

    $scope.aceLoaded = function(editor) {
        $scope.editor = editor;
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.setShowInvisibles(true);
        editor.setReadOnly(true);
        editor.getSession().setUseWrapMode(true);
    };

}]);
