chromeMyAdmin.directive("updateRowDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/update_row_dialog.html"
    };
});

chromeMyAdmin.controller("UpdateRowDialogController", ["$scope", "targetObjectService", "Events", "sqlExpressionService", "mySQLClientService", "rowsPagingService", function($scope, targetObjectService, Events, sqlExpressionService, mySQLClientService, rowsPagingService) {
    "use strict";

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var doOpen = function(columnDefinitions, row) {
        resetErrorMessage();
        $scope.values = {};
        $scope.originalValues = {};
        $scope.originalRow = row;
        angular.forEach(columnDefinitions, function(column, index) {
            $scope.values[column.name] = row.values[index];
            $scope.originalValues[column.name] = row.values[index];
        });
        $scope.columnDefinitions = columnDefinitions;
        $("#updateRowDialog").modal("show");
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_UPDATE_ROW_DIALOG, function(event, data) {
            doOpen(data.columnDefinitions, data.row);
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

    $scope.updateRow = function() {
        resetErrorMessage();
        var targetColumns = [];
        var targetValues = [];
        var sql = "UPDATE `" + targetObjectService.getTable() + "` ";
        var sets = [];
        angular.forEach($scope.values, function(value, columnName) {
            if (value !== $scope.originalValues[columnName]) {
                targetColumns.push("`" + columnName + "`");
                targetValues.push("'" + value.replace(/'/g, "\\'") + "'");
                sets.push("`" + columnName + "` = " + "'" + value.replace(/'/g, "\\'") + "'");
            }
        });
        if (sets.length !== 0) {
            sql += "SET " + sets.join(",");
            var primaryKeyColumns =
                    sqlExpressionService.getPrimaryKeyColumns($scope.columnDefinitions);
            var whereConditions =
                    sqlExpressionService.createWhereConditionsForUpdate(
                        primaryKeyColumns,
                        $scope.columnDefinitions,
                        $scope.originalRow);
            sql += " WHERE " + whereConditions.join(" AND ");
            sql += jQuery.isEmptyObject(primaryKeyColumns) ? " LIMIT 1" : "";
            mySQLClientService.query(sql).then(function(result) {
                if (result.hasResultsetRows) {
                    $scope.fatalErrorOccurred("Updating row failed.");
                } else {
                    $("#updateRowDialog").modal("hide");
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
            $scope.errorMessage = "Any values not changed.";
        }
    };

}]);
