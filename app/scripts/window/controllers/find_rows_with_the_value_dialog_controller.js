chromeMyAdmin.controller("FindRowsWithTheValueDialogController", function(
    $scope,
    Events,
    targetObjectService,
    mySQLQueryService,
    rowsSelectionService,
    anyQueryExecuteService,
    TableTypes,
    sqlExpressionService
) {
    "use strict";

    var ONLY_SAME_COLUMN_TYPE = "same";
    var ANY_COLUMN_TYPE = "any";

    var MATCHING_RULE_FULL = "full";
    var MATCHING_RULE_PARTIAL = "partial";

    var onShowDialog = function() {
        resetErrorMessage();
        $scope.columnType = ONLY_SAME_COLUMN_TYPE;
        $scope.removeEmptyResult = "true";
        $scope.matchingRule = MATCHING_RULE_FULL;
        var table = targetObjectService.getTable();
        mySQLQueryService.showFullColumns(table.name).then(function(result) {
            var selectedRow = rowsSelectionService.getSelectedRows();
            var resultsetRows = result.resultsetRows;
            $scope.value = null;
            $scope.values = [];
            angular.forEach(resultsetRows, function(row, index) {
                var value = selectedRow.entity["column" + index];
                if (value !== null) {
                    var typeName = getColumnTypeName(row);
                    $scope.values.push({
                        value: value,
                        label: "\"" + value + "\" (" + typeName + " - " + row.values[0] + ")",
                        type: typeName
                    });
                }
            });
            if ($scope.values.length > 0) {
                $scope.value = $scope.values[0];
            }
            $("#findRowsWithTheValueDialog").modal("show");
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var getColumnTypeName = function(column) {
        var type = column.values[1];
        var idx = type.indexOf("(");
        if (idx > -1) {
            type = type.substring(0, idx);
        }
        return type;
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_FIND_ROWS_WITH_THE_VALUE_DIALOG, function(event, data) {
            onShowDialog();
        });

    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var loadStructure = function(tables, sqls) {
        if (tables.length === 0) {
            $("#findRowsWithTheValueDialog").modal("hide");
            anyQueryExecuteService.showAndExecuteQueryPanel(
                sqls.join(";\n"),
                $scope.removeEmptyResult === "true");
            return;
        }
        var table = tables.shift();
        mySQLQueryService.showFullColumns(table).then(function(result) {
            var resultsetRows = result.resultsetRows;
            angular.forEach(resultsetRows, function(resultsetRow) {
                var typeName = resultsetRow.values[1];
                if ($scope.columnType.value === ANY_COLUMN_TYPE ||
                    typeName.indexOf($scope.value.type) === 0) {
                    var sql = "SELECT * FROM `" + table + "` WHERE ";
                    var target = resultsetRow.values[0];
                    if ($scope.matchingRule === MATCHING_RULE_FULL) {
                        sql += "`" + target + "` = \"" + sqlExpressionService.replaceValue($scope.value.value) + "\"";
                    } else {
                        sql += "`" + target + "` LIKE \"%" + sqlExpressionService.replaceValue($scope.value.value) + "%\"";
                    }
                    sqls.push(sql);
                }
            });
            loadStructure(tables, sqls);
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var setupItems = function() {
        $scope.columnTypes = [
            {label: "Only same column type", value: ONLY_SAME_COLUMN_TYPE},
            {label: "Any", value: ANY_COLUMN_TYPE}
        ];
        $scope.columnType = ONLY_SAME_COLUMN_TYPE;
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
        setupItems();
    };

    $scope.findRowsWithTheValue = function() {
        mySQLQueryService.showTables().then(function(result) {
            var resultsetRows = result.resultsetRows;
            var tables = [];
            angular.forEach(resultsetRows, function(resultsetRow) {
                if (resultsetRow.values[1] === TableTypes.BASE_TABLE) {
                    tables.push(resultsetRow.values[0]);
                }
            }, tables);
            loadStructure(tables, []);
        }, function(reason) {
            $("#findRowsWithTheValueDialog").modal("hide");
            $scope.fatalErrorOccurred(reason);
        });
    };

});
