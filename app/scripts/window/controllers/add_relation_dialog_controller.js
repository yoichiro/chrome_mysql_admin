chromeMyAdmin.controller("AddRelationDialogController", function(
    $scope,
    Events,
    mySQLClientService,
    $q,
    targetObjectService,
    mySQLQueryService
) {
    "use strict";

    var onShowDialog = function(table) {
        resetErrorMessage();
        $scope.selectedTable = table;
        $scope.name = "";
        $("#addRelationDialog").modal("show");
        loadColumns(table).then(function(result) {
            updateColumns(result.resultsetRows);
            return loadTables();
        }).then(function(result) {
            updateTargetTables(result.columnDefinitions, result.resultsetRows);
            return loadColumns($scope.targetTable);
        }).then(function(result) {
            updateTargetColumns(result.resultsetRows);
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
        $scope.onDelete = $scope.onDeletes[0];
        $scope.onUpdate = $scope.onUpdates[0];
    };

    var updateTargetTables = function(columnDefinition, resultsetRows) {
        var targetTables = [];
        for (var i = 0; i < resultsetRows.length; i++) {
            targetTables.push(resultsetRows[i].values[0]);
        }
        $scope.targetTables = targetTables;
        $scope.targetTable = targetTables[0];
    };

    var updateColumns = function(resultsetRows) {
        var columns = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            columns.push({
                label: resultsetRow.values[0] + " " + resultsetRow.values[1],
                value: resultsetRow.values[0]
            });
        });
        $scope.columns = columns;
        if (columns.length > 0) {
            $scope.column = columns[0].value;
        }
    };

    var updateTargetColumns = function(resultsetRows) {
        var columns = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            columns.push({
                label: resultsetRow.values[0] + " " + resultsetRow.values[1],
                value: resultsetRow.values[0]
            });
        });
        $scope.targetColumns = columns;
        if (columns.length > 0) {
            $scope.targetColumn = columns[0].value;
        }
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_ADD_RELATION_DIALOG, function(event, data) {
            onShowDialog(data.table);
        });
    };

    var loadTables = function() {
        var deferred = $q.defer();
        mySQLQueryService.showTables().then(function(result) {
            deferred.resolve({
                columnDefinitions: result.columnDefinitions,
                resultsetRows: result.resultsetRows
            });
        }, function(reason) {
            deferred.reject(reason);
        });
        return deferred.promise;
    };

    var loadColumns = function(tableName) {
        var deferred = $q.defer();
        mySQLQueryService.showFullColumns(tableName).then(function(result) {
            deferred.resolve({
                columnDefinitions: result.columnDefinitions,
                resultsetRows: result.resultsetRows
            });
        }, function(reason) {
            deferred.reject(reason);
        });
        return deferred.promise;
    };

    var setupItems = function() {
        var constraints = ["", "RESTRICT", "CASCADE", "SET NULL", "NO ACTION"];
        $scope.onDeletes = constraints;
        $scope.onDelete = constraints[0];
        $scope.onUpdates = constraints;
        $scope.onUpdate = constraints[0];
    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
        setupItems();
    };

    $scope.onChangeTargetTable = function() {
        loadColumns($scope.targetTable).then(function(result) {
            updateTargetColumns(result.resultsetRows);
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    $scope.addRelation = function() {
        var sql = "ALTER TABLE `" + $scope.selectedTable + "` ";
        sql += "ADD FOREIGN KEY (`" + $scope.column + "`) ";
        sql += "REFERENCES `" + $scope.targetTable + "` (`";
        sql += $scope.targetColumn + "`)";
        if ($scope.onDelete) {
            sql += " ON DELETE " + $scope.onDelete;
        }
        if ($scope.onUpdate) {
            sql += " ON UPDATE " + $scope.onUpdate;
        }
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Adding relation failed.");
            } else {
                $("#addRelationDialog").modal("hide");
                targetObjectService.reSelectTable();
            }
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.errorMessage = errorMessage;
        });
    };

});
