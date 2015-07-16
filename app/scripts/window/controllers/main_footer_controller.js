chromeMyAdmin.controller("MainFooterController", function(
    $scope,
    modeService,
    mySQLClientService,
    rowsPagingService,
    rowsSelectionService,
    targetObjectService,
    Events,
    Modes,
    relationSelectionService,
    TableTypes,
    routineSelectionService,
    anyQueryExecuteService,
    querySelectionService,
    ConfigurationTabs
) {
    "use strict";

    var showMainStatusMessage = function(message) {
        $scope.safeApply(function() {
            $scope.mainStatusMessage = message;
        });
    };

    var _hasPrevisouPage = function() {
        return rowsPagingService.hasPrevious();
    };

    var _hasNextPage = function() {
        return rowsPagingService.hasNext();
    };

    $scope.initialize = function() {
        $scope.$on(Events.SHOW_MAIN_STATUS_MESSAGE, function(event, message) {
            showMainStatusMessage(message);
        });
    };

    $scope.isRowsButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.ROWS;
    };

    $scope.isStructureButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.STRUCTURE;
    };

    $scope.isDatabaseButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.DATABASE;
    };

    $scope.isInformationButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.INFORMATION;
    };

    $scope.isRelationButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.RELATION;
    };

    $scope.isProceduresFunctionsButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.PROCS_FUNCS;
    };

    $scope.isQueryButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.QUERY;
    };

    $scope.isErDiagramButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === Modes.ER_DIAGRAM;
    };

    $scope.hasPreviousPage = function() {
        return _hasPrevisouPage();
    };

    $scope.hasNextPage = function() {
        return _hasNextPage();
    };

    $scope.goPreviousPage = function() {
        if (_hasPrevisouPage()) {
            rowsPagingService.previous();
        }
    };

    $scope.goNextPage = function() {
        if (_hasNextPage()) {
            rowsPagingService.next();
        }
    };

    $scope.getPagingInfo = function() {
        return (rowsPagingService.getCurrentPageIndex() + 1) + "/" + rowsPagingService.getTotalPageCount();
    };

    $scope.refreshRows = function() {
        rowsPagingService.refresh();
    };

    $scope.refreshStructure = function() {
        targetObjectService.reSelectTable();
    };

    $scope.isRowSelection = function() {
        if (rowsSelectionService.getSelectedRows() &&
           modeService.getMode() === Modes.ROWS) {
            return true;
        } else {
            return false;
        }
    };

    $scope.confirmDeleteSelectedRow = function() {
        if ($scope.isTable() && $scope.isRowSelection()) {
            $scope.showConfirmDialog(
                "Once deleted data will be undone. Would you really like to delete the selected row from MySQL server?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_ROW,
                true
            );
        }
    };

    $scope.isTableSelection = function() {
        return targetObjectService.getTable();
    };

    $scope.isTable = function() {
        var table = targetObjectService.getTable();
        if (table) {
            return table.type === TableTypes.BASE_TABLE;
        } else {
            return false;
        }
    };

    $scope.insertRow = function() {
        if ($scope.isTable()) {
            targetObjectService.requestInsertRow();
        }
    };

    $scope.updateRow = function() {
        if ($scope.isTable() && $scope.isRowSelection()) {
            targetObjectService.requestUpdateRow();
        }
    };

    $scope.createDatabase = function() {
        targetObjectService.showCreateDatabaseDialog();
    };

    $scope.isDatabaseSelection = function() {
        return targetObjectService.getDatabase();
    };

    $scope.confirmDeleteSelectedDatabase = function() {
        $scope.showConfirmDialog(
            "Once deleted data will be undone. Would you really like to delete the selected database from MySQL server?",
            "Yes",
            "No",
            Events.DELETE_SELECTED_DATABASE,
            true
        );
    };

    $scope.refreshInformation = function() {
        targetObjectService.reSelectTable();
    };

    $scope.refreshRelation = function() {
        targetObjectService.reSelectTable();
    };

    $scope.isRelationSelection = function() {
        return relationSelectionService.getSelectedRelation();
    };

    $scope.confirmDeleteSelectedRelation = function() {
        if ($scope.isTable() && $scope.isRelationSelection()) {
            $scope.showConfirmDialog(
                "Once deleted data will be undone. Would you really like to delete the selected relation from the database?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_RELATION,
                true
            );
        }
    };

    $scope.addRelation = function() {
        var table = targetObjectService.getTable();
        if (table && table.type === TableTypes.BASE_TABLE) {
            targetObjectService.showAddRelationDialog(table.name);
        }
    };

    $scope.refreshProceduresFunctions = function() {
        targetObjectService.refreshProceduresFunctions();
    };

    $scope.isRoutineSelection = function() {
        return routineSelectionService.getSelectedRoutine();
    };

    $scope.confirmDeleteSelectedRoutine = function() {
        if ($scope.isRoutineSelection()) {
            $scope.showConfirmDialog(
                "Once deleted data will be undone. Would you really like to delete the selected routine from the database?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_ROUTINE,
                true
            );
        }
    };

    $scope.createRoutine = function() {
        if (targetObjectService.getDatabase()) {
            routineSelectionService.showCreateRoutineDialog();
        }
    };

    $scope.isProcedureSelection = function() {
        var routine = routineSelectionService.getSelectedRoutine();
        return routine && routine.entity.ROUTINE_TYPE === "PROCEDURE";
    };

    $scope.executeProcedure = function() {
        if ($scope.isProcedureSelection()) {
            routineSelectionService.executeSelectedProcedure();
        }
    };

    $scope.findSameRows = function() {
        if ($scope.isTable() && $scope.isRowSelection()) {
            anyQueryExecuteService.showFindSameRowsDialog();
        }
    };

    $scope.findRowsWithTheValue = function() {
        if ($scope.isTable() && $scope.isRowSelection()) {
            anyQueryExecuteService.showFindRowsWithTheValueDialog();
        }
    };

    $scope.exportQueryResult = function() {
        if ($scope.isQueryResultSelection()) {
            querySelectionService.exportQueryResult();
        }
    };

    $scope.isQueryResultSelection = function() {
        var queryResult = querySelectionService.getQueryResult();
        return queryResult && queryResult.success && queryResult.result.hasResultsetRows;
    };

    $scope.isQueryResultRowSelection = function() {
        var queryResult = querySelectionService.getQueryResult();
        var selectedRows = querySelectionService.getSelectedRows();
        return queryResult && queryResult.success && queryResult.result.hasResultsetRows && selectedRows;
    };

    $scope.copyQueryResultRowToClipboard = function() {
        if ($scope.isQueryResultRowSelection()) {
            querySelectionService.copyRowToClipboard();
        }
    };

    $scope.copyRowsPanelRowToClipboard = function() {
        if ($scope.isRowSelection()) {
            rowsSelectionService.copyRowToClipboard();
        }
    };

    $scope.refreshErDiagram = function() {
        if ($scope.isDatabaseSelection()) {
            targetObjectService.refreshErDiagram();
        }
    };

    $scope.saveErDiagramImage = function() {
        if ($scope.isDatabaseSelection()) {
            targetObjectService.saveErDiagramImage();
        }
    };

    $scope.openErDiagramConfiguration = function() {
        $scope.showConfigurationDialog(ConfigurationTabs.ER_DIAGRAM);
    };

    $scope.exportAllDatabases = function() {
        targetObjectService.exportAllDatabases();
    };

});
