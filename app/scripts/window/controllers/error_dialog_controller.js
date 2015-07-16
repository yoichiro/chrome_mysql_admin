chromeMyAdmin.controller("ErrorDialogController", function(
    $scope,
    mySQLClientService,
    Events,
    ErrorLevel
) {
    "use strict";

    var onCloseDialog = function() {
        if ($scope.errorLevel === ErrorLevel.FATAL) {
            mySQLClientService.logout().then(function() {
                $scope.safeApply(function() {
                    $scope.notifyConnectionChanged();
                });
            });
        }
    };

    $scope.initialize = function() {
        $("#errorDialog").on("hidden.bs.modal", function() {
            onCloseDialog();
        });
        $scope.$on(Events.SHOW_ERROR_DIALOG, function(event, data) {
            $scope.errorLevel = data.errorLevel;
            $scope.safeApply(function() {
                if (data.errorLevel === ErrorLevel.FATAL) {
                    $scope.title = "Fatal error";
                    $scope.message1 = "Fatal error occurred. Go back to login screen.";
                    $scope.message2 = data.reason;
                } else {
                    $scope.title = data.title || "Error";
                    $scope.message1 = data.message;
                    $scope.message2 = data.reason;
                }
                $("#errorDialog").modal("show");
            });
        });
    };

});
