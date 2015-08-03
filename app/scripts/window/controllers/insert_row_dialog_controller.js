chromeMyAdmin.controller("InsertRowDialogController", function(
    $scope,
    targetObjectService,
    rowsPagingService,
    mySQLClientService,
    Events,
    sqlExpressionService,
    ValueTypes
) {
    "use strict";

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var doOpen = function(columnDefinitions) {
        resetErrorMessage();
        $scope.values = {};
        $scope.valueTypes = {};
        angular.forEach(columnDefinitions, function(column) {
            $scope.values[column.name] = "";
            $scope.valueTypes[column.name] = ValueTypes.VALUE;
        });
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

    $scope.getExecutingQuery = function() {
        if (targetObjectService.getTable()) {
            return sqlExpressionService.createInsertStatement(
                targetObjectService.getTable().name, $scope.values, $scope.valueTypes);
        } else {
            return "";
        }
    };

    $scope.insertRow = function() {
        resetErrorMessage();
        var sql = sqlExpressionService.createInsertStatement(
            targetObjectService.getTable().name, $scope.values, $scope.valueTypes);
        if (sql) {
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

    $scope.onChangeValueType = function(columnName) {
        var valueType = $scope.valueTypes[columnName];
        if (valueType !== ValueTypes.NULL) {
            var value = $scope.values[columnName];
            if (!value) {
                $scope.values[columnName] = "";
            }
        }
    };

    $scope.isDisabledValueField = function(columnName) {
        return $scope.valueTypes[columnName] === ValueTypes.NULL ||
            $scope.valueTypes[columnName] === ValueTypes.DEFAULT;
    };

});
