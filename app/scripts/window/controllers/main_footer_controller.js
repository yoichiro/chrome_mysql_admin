chromeMyAdmin.directive("mainFooter", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/main_footer.html"
    };
});

chromeMyAdmin.controller("MainFooterController", ["$scope", "modeService", "mySQLClientService", "rowsPagingService", "rowsSelectionService", "targetObjectService", "Events", "Modes", "relationSelectionService", "TableTypes", "routineSelectionService", function($scope, modeService, mySQLClientService, rowsPagingService, rowsSelectionService, targetObjectService, Events, Modes, relationSelectionService, TableTypes, routineSelectionService) {
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
                "Would you really like to delete the selected row from MySQL server?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_ROW
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
            "Would you really like to delete the selected database from MySQL server?",
            "Yes",
            "No",
            Events.DELETE_SELECTED_DATABASE
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
                "Would you really like to delete the selected relation from the database?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_RELATION
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
                "Would you really like to delete the selected routine from the database?",
                "Yes",
                "No",
                Events.DELETE_SELECTED_ROUTINE
            );
        }
    };

    $scope.createRoutine = function() {
        if (targetObjectService.getDatabase()) {
            routineSelectionService.showCreateRoutineDialog();
        }
    };

}]);
