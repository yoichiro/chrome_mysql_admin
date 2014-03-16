"use strict";

chromeMyAdmin.controller("LogoutConfirmDialogController", ["$scope", "mySQLClientService", function($scope, mySQLClientService) {

    $scope.logout = function() {
        console.log("logout");
        $("#logoutConfirmDialog").modal("hide");
        mySQLClientService.logout().then(function() {
            $scope.notifyConnectionChanged();
        });
    };

}]);
