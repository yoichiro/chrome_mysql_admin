chromeMyAdmin.controller("DropTableConfirmDialogController", ["$scope", "targetObjectService", function($scope, targetObjectService) {
    "use strict";

    $scope.dropTable = function() {
        $("#dropTableConfirmDialog").modal("hide");
        targetObjectService.requestDropSelectedTable();
    };

}]);
