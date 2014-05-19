chromeMyAdmin.directive("configurationDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/configuration_dialog.html"
    };
});

chromeMyAdmin.controller("ConfigurationDialogController", ["$scope", "mySQLClientService", "Events", "configurationService", function($scope, mySQLClientService, Events, configurationService) {
    "use strict";

    var doOpen = function() {
        configurationService.getDatabaseInfoAutoUpdateSpan().then(function(span) {
            $scope.databaseInfoAutoUpdateSpan = span / 1000;
        });
        $("#configurationDialog").modal("show");
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_CONFIGURATION_DIALOG, function(event, data) {
            doOpen();
        });
    };

    $scope.initialize = function() {
        $scope.databaseInfoAutoUpdateSpans = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
        assignEventHandlers();
    };

    $scope.execute = function() {
    };

    $scope.getQueryHistory = function() {
        return mySQLClientService.getQueryHistory();
    };

    $scope.changeSpan = function() {
        configurationService.setDatabaseInfoAutoUpdateSpan(
            Number($scope.databaseInfoAutoUpdateSpan) * 1000);
    };

}]);
