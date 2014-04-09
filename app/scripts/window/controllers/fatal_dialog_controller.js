chromeMyAdmin.controller("FatalDialogController", ["$scope", "mySQLClientService", "Events", function($scope, mySQLClientService, Events) {
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
        $scope.$on(Events.FATAL_ERROR_OCCURRED, function(event, errorMessage) {
            $scope.safeApply(function() {
                $scope.reason = errorMessage;
                $("#fatalDialog").modal("show");
            });
        });
    };

}]);
