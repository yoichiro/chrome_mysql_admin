chromeMyAdmin.controller("FatalDialogController", ["$scope", "mySQLClientService", function($scope, mySQLClientService) {
    "use strict";

    $scope.initialize = function() {
        $("#fatalDialog").on("hidden.bs.modal", function() {
            var promise = mySQLClientService.logout();
            promise.then(function() {
                $scope.safeApply(function() {
                    $scope.notifyConnectionChanged();
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
