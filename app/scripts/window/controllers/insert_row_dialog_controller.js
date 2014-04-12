chromeMyAdmin.controller("InsertRowDialogController", ["$scope", "targetObjectService", "rowsPagingService", "mySQLClientService", "Events", function($scope, targetObjectService, rowsPagingService, mySQLClientService, Events) {
    "use strict";

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var doOpen = function(columnDefinitions) {
        resetErrorMessage();
        $scope.values = {};
        $scope.columnDefinitions = columnDefinitions;
        $("#insertRowDialog").modal("show");
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_INSERT_ROW_DIALOG, function(event, columnDefinitions) {
            doOpen(columnDefinitions);
        });
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.targetInputColumns = function() {
        var result = [];
        angular.forEach($scope.columnDefinitions, function(column) {
            // TODO filter
            result.push(column);
        }, result);
        return result;
    };

    $scope.insertRow = function() {
        resetErrorMessage();
        var targetColumns = [];
        var targetValues = [];
        angular.forEach($scope.values, function(value, columnName) {
            if (value) {
                targetColumns.push("`" + columnName + "`");
                targetValues.push("'" + value.replace(/'/g, "\\'") + "'");
            }
        });
        if (targetColumns.length !== 0) {
            var sql = "INSERT INTO `" + targetObjectService.getTable() + "` (";
            sql += targetColumns.join(", ");
            sql += ") VALUES (";
            sql += targetValues.join(", ");
            sql += ")";
            mySQLClientService.query(sql).then(function(result) {
                if (result.hasResultsetRows) {
                    $scope.fatalErrorOccurred("Inserting row failed.");
                } else {
                    $("#insertRowDialog").modal("hide");
                    rowsPagingService.refresh();
                }
            }, function(reason) {
                var errorMessage = "[Error code:" + reason.errorCode;
                errorMessage += " SQL state:" + reason.sqlState;
                errorMessage += "] ";
                errorMessage += reason.errorMessage;
                $scope.errorMessage = errorMessage;
            });
        } else {
            $scope.errorMessage = "Any values not filled in.";
        }
    };

}]);
