chromeMyAdmin.controller("UpdateRowDialogController", function(
    $scope,
    targetObjectService,
    Events,
    sqlExpressionService,
    mySQLClientService,
    rowsPagingService,
    ValueTypes,
    anyQueryExecuteService
) {
    "use strict";

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var doOpen = function(columnDefinitions, row) {
        resetErrorMessage();
        $scope.values = {};
        $scope.originalValues = {};
        $scope.valueTypes = {};
        $scope.originalRow = row;
        angular.forEach(columnDefinitions, function(column, index) {
            var value = row.values[index];
            $scope.values[column.name] = value;
            $scope.originalValues[column.name] = value;
            if (value === null) {
                $scope.valueTypes[column.name] = ValueTypes.NULL;
            } else {
                $scope.valueTypes[column.name] = ValueTypes.VALUE;
            }
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
        return $scope.valueTypes[columnName] === ValueTypes.NULL;
    };

    $scope.updateRow = function() {
        resetErrorMessage();
        var sql = "UPDATE `" + targetObjectService.getTable().name + "` ";
        var sets = [];
        angular.forEach($scope.values, function(value, columnName) {
            if ($scope.valueTypes[columnName] === ValueTypes.NULL && $scope.originalValues[columnName] !== null) {
                sets.push("`" + columnName + "` = NULL");
            } else if (value !== $scope.originalValues[columnName]) {
                if ($scope.valueTypes[columnName] === ValueTypes.VALUE) {
                    sets.push("`" + columnName + "` = " + "'" + sqlExpressionService.replaceValue(value) + "'");
                } else if ($scope.valueTypes[columnName] === ValueTypes.EXPRESSION) {
                    sets.push("`" + columnName + "` = " + value);
                }
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

    $scope.createInsertStatement = function() {
        var sql = sqlExpressionService.createInsertStatement(
            targetObjectService.getTable().name, $scope.values, $scope.valueTypes);
        $("#updateRowDialog").modal("hide");
        anyQueryExecuteService.showQueryPanel(sql);
    };

});
