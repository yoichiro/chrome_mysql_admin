chromeMyAdmin.controller("LogoutConfirmDialogController", ["$scope", "mySQLClientService", function($scope, mySQLClientService) {
    "use strict";

    $scope.logout = function() {
        $("#logoutConfirmDialog").modal("hide");
        mySQLClientService.logout().then(function() {
            $scope.notifyConnectionChanged();
        });
    };

}]);
