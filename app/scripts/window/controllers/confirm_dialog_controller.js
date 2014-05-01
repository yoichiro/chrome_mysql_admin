chromeMyAdmin.directive("confirmDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/confirm_dialog.html"
    };
});

chromeMyAdmin.controller("ConfirmDialogController", ["$scope", "Events", function($scope, Events) {
    "use strict";

    var open = function(message, yesButtonLabel, noButtonLabel) {
        $scope.message = message;
        $scope.yesButtonLabel = yesButtonLabel;
        $scope.noButtonLabel = noButtonLabel;
        $("#confirmDialog").modal("show");
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_CONFIRM_DIALOG, function(event, data) {
            open(data.message, data.yesButtonLabel, data.noButtonLabel);
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

}]);
