"use strict";

chromeMyAdmin.controller("LogoutConfirmDialogController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    $scope.logout = function() {
        console.log("logout");
        $("#logoutConfirmDialog").modal("hide");
        MySQL.client.logout(function() {
            $scope.safeApply(function() {
                $rootScope.connected = false;
                $rootScope.$broadcast("connectionChanged", null);
            });
        });
    };

}]);
