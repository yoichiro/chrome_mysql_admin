chromeMyAdmin.directive("mainFooter", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/main_footer.html"
    };
});

chromeMyAdmin.controller("MainFooterController", ["$scope", "modeService", "mySQLClientService", "rowsPagingService", "rowsSelectionService", "targetObjectService", "Events", "Modes", function($scope, modeService, mySQLClientService, rowsPagingService, rowsSelectionService, targetObjectService, Events, Modes) {
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
        $scope.showConfirmDialog(
            "Would you really like to delete the selected row from MySQL server?",
            "Yes",
            "No",
            Events.DELETE_SELECTED_ROW
        );
    };

    $scope.isTableSelection = function() {
        return targetObjectService.getTable();
    };

    $scope.insertRow = function() {
        targetObjectService.requestInsertRow();
    };

    $scope.updateRow = function() {
        targetObjectService.requestUpdateRow();
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

}]);
