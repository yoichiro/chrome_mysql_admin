"use strict";

chromeMyAdmin.controller("FatalDialogController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    $scope.initialize = function() {
        $("#fatalDialog").on("hidden.bs.modal", function() {
            MySQL.client.logout(function() {
                $scope.safeApply(function() {
                    $rootScope.connected = false;
                    $rootScope.$broadcast("connectionChanged", null);
                });
            });
        });
        $scope.$on("fatalErrorOccurred", function(event, errorMessage) {
            $scope.safeApply(function() {
                $scope.reason = errorMessage;
                $("#fatalDialog").modal("show");
            });
        });
    };

}]);
