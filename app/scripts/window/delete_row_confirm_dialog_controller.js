chromeMyAdmin.controller("DeleteRowConfirmDialogController", ["$scope", "rowsSelectionService", function($scope, rowsSelectionService) {
    "use strict";

    $scope.deleteRow = function() {
        $("#deleteRowConfirmDialog").modal("hide");
        rowsSelectionService.requestDeleteSelectedRow();
    };

}]);
