chromeMyAdmin.controller("FindSameRowsDialogController", function(
    $scope,
    Events,
    targetObjectService,
    mySQLQueryService,
    rowsSelectionService,
    TableTypes,
    anyQueryExecuteService
) {
    "use strict";

    var onShowDialog = function() {
        resetErrorMessage();
        $scope.matchingType = "Full";
        $scope.removeEmptyResult = "true";
        var table = targetObjectService.getTable();
        mySQLQueryService.showFullColumns(table.name).then(function(result) {
            var selectedRow = rowsSelectionService.getSelectedRows();
            var resultsetRows = result.resultsetRows;
            $scope.selectedKeys = [];
            $scope.keys = [];
            angular.forEach(resultsetRows, function(row, index) {
                var target;
                if (row.values[4] === "PRI") {
                    target = $scope.selectedKeys;
                } else {
                    target = $scope.keys;
                }
                var value = selectedRow.entity["column" + index];
                var label;
                if (value === null) {
                    label = row.values[0] + " IS NULL";
                } else {
                    label = row.values[0] + " = \"" + value + "\"";
                }
                target.push({
                    name: row.values[0],
                    value: value,
                    label: label
                });
            });
            if ($scope.keys.length > 0) {
                $scope.key = $scope.keys[0];
            }
            $("#findSameRowsDialog").modal("show");
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_FIND_SAME_ROWS_DIALOG, function(event, data) {
            onShowDialog();
        });

    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var loadStructure = function(tables, sqls) {
        if (tables.length === 0) {
            $("#findSameRowsDialog").modal("hide");
            anyQueryExecuteService.showAndExecuteQueryPanel(
                sqls.join(";\n"),
                $scope.removeEmptyResult === "true");
            return;
        }
        var table = tables.shift();
        mySQLQueryService.showFullColumns(table).then(function(result) {
            var resultsetRows = result.resultsetRows;
            var labels = [];
            angular.forEach(resultsetRows, function(resultsetRow) {
                var target = resultsetRow.values[0];
                angular.forEach($scope.selectedKeys, function(key) {
                    if ($scope.matchingType === "Full") {
                        if (key.name === target) {
                            labels.push(key.label);
                        }
                    } else {
                        if (target.indexOf(key.name) !== -1) {
                            if (key.value == null) {
                                labels.push("`" + target + "` IS NULL");
                            } else {
                                labels.push("`" + target + "` = \"" + key.value + "\"");
                            }
                        }
                    }
                });
            });
            if (labels.length > 0) {
                var sql = "SELECT * FROM `" + table + "` WHERE ";
                sql += labels.join(" AND ");
                sqls.push(sql);
            }
            loadStructure(tables, sqls);
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var setupItems = function() {
        $scope.matchingTypes = ["Full", "Partial"];
        $scope.matchingType = "Full";
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
        setupItems();
    };

    $scope.addKey = function() {
        $scope.selectedKeys.push($scope.key);
        $scope.keys = $scope.keys.filter(function(e) {
            return $scope.key !== e;
        });
        if ($scope.keys.length > 0) {
            $scope.key = $scope.keys[0];
        }
    };

    $scope.deleteSelectedKey = function(selectedKey) {
        $scope.keys.push(selectedKey);
        $scope.selectedKeys = $scope.selectedKeys.filter(function(e) {
            return selectedKey !== e;
        });
        if ($scope.keys.length === 1) {
            $scope.key = $scope.keys[0];
        }
    };

    $scope.isFindDisabled = function() {
        return !$scope.selectedKeys || $scope.selectedKeys.length === 0;
    };

    $scope.findSameRows = function() {
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
            $("#findSameRowsDialog").modal("hide");
            $scope.fatalErrorOccurred(reason);
        });
    };

});
