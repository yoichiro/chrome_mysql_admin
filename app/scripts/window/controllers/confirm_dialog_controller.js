chromeMyAdmin.controller("ConfirmDialogController", function(
    $scope,
    Events
) {
    "use strict";

    var open = function(message, yesButtonLabel, noButtonLabel, danger) {
        $scope.message = message;
        $scope.yesButtonLabel = yesButtonLabel;
        $scope.noButtonLabel = noButtonLabel;
        $scope.danger = danger;
        $("#confirmDialog").modal("show");
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_CONFIRM_DIALOG, function(event, data) {
            open(data.message, data.yesButtonLabel, data.noButtonLabel, data.danger);
            $scope.callbackEvent = data.callbackEvent;
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
    };

    $scope.execute = function() {
        $("#confirmDialog").modal("hide");
        $scope.callbackFromConfirmDialog($scope.callbackEvent, true);
    };

    $scope.isDanger = function() {
        return $scope.danger;
    };

});
