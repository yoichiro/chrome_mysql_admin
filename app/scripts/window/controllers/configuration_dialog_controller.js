chromeMyAdmin.directive("configurationDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/configuration_dialog.html"
    };
});

chromeMyAdmin.controller("ConfigurationDialogController", ["$scope", "mySQLClientService", function($scope, mySQLClientService) {
    "use strict";

    $scope.initialize = function() {
    };

    $scope.execute = function() {
    };

    $scope.getQueryHistory = function() {
        console.log(mySQLClientService.getQueryHistory());
        return mySQLClientService.getQueryHistory();
    };

}]);
