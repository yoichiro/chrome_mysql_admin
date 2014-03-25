"use strict";

chromeMyAdmin.controller("DeleteRowConfirmDialogController", ["$scope", "rowsSelectionService", function($scope, rowsSelectionService) {

    $scope.deleteRow = function() {
        $("#deleteRowConfirmDialog").modal("hide");
        rowsSelectionService.requestDeleteSelectedRow();
    };

}]);
