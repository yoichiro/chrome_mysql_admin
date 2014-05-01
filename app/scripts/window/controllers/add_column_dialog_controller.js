chromeMyAdmin.directive("addColumnDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/add_column_dialog.html"
    };
});

chromeMyAdmin.controller("AddColumnDialogController", ["$scope", "Events", "mySQLClientService", "$q", "targetObjectService", "typeService", function($scope, Events, mySQLClientService, $q, targetObjectService, typeService) {
    "use strict";

    var onShowDialog = function(table) {
        resetErrorMessage();
        $scope.selectedTable = table;
        $scope.columnName = "";
        $scope.length = "";
        $scope.unsgined = false;
        $scope.zerofill = false;
        $scope.binary = false;
        $scope.allowNull = false;
        $scope.defaultValue = "";
        $scope.type = "INT";
        $scope.extra = "NONE";
        $scope.key = "PRIMARY";
        $("#addColumnDialog").modal("show");
        loadDatabaseData();
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_ADD_COLUMN_DIALOG, function(event, table) {
            onShowDialog(table);
        });
    };

    var setupItems = function() {
        $scope.types = typeService.getTypes();
        $scope.type = "VARCHAR";
        $scope.extras = ["NONE", "AUTO_INCREMENT",
                         "ON UPDATE CURRENT_TIMESTAMP", "SERIAL DEFAULT VALUE"];
        $scope.extra = "NONE";
        $scope.keys = ["PRIMARY", "INDEX", "UNIQUE"];
        $scope.key = "PRIMARY";
    };

    var loadDatabaseData = function() {
        mySQLClientService.query("SHOW CHARACTER SET").then(function(result) {
            if (result.hasResultsetRows) {
                $scope.characterSets = result.resultsetRows;
                if (result.resultsetRows.length > 0) {
                    $scope.characterSet = "utf8";
                    return mySQLClientService.query("SHOW COLLATION");
                } else {
                    return $q.reject("No character set.");
                }
            } else {
                return $q.reject("Fetching character set failed.");
            }
        }, function(reason) {
            var errorMessage = reason.errorMessage;
            $q.reject(errorMessage);
        }).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.collations = result.resultsetRows;
                if (result.resultsetRows.length > 0) {
                    $scope.collation = "utf8_general_ci";
                } else {
                    $scope.fatalErrorOccurred("No collations.");
                }
            } else {
                $scope.fatalErrorOccurred("Fetching collations failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
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

    $scope.addColumn = function() {
        var sql = "ALTER TABLE `" + $scope.selectedTable + "` ";
        sql += "ADD COLUMN `" + $scope.columnName + "` ";
        sql += $scope.type;
        if ($scope.length) {
            sql += "(" + $scope.length + ")";
        }
        sql += " ";
        if (typeService.isString($scope.type)) {
            sql += "CHARACTER SET " + $scope.characterSet + " ";
            sql += "COLLATE " + $scope.collation + " ";
            if ($scope.binary) {
                sql += "BINARY ";
            }
        } else if (typeService.isNumeric($scope.type)) {
            if ($scope.unsigned) {
                sql += "UNSIGNED ";
            }
            if ($scope.zerofill) {
                sql += "ZEROFILL ";
            }
        }
        if (!$scope.allowNull) {
            sql += "NOT NULL ";
        }
        if ($scope.defaultValue) {
            if (typeService.isNumeric($scope.type)) {
                sql += "DEFAULT " + $scope.defaultValue + " ";
            } else {
                sql += "DEFAULT '" + $scope.defaultValue + "' ";
            }
        }
        if ($scope.extra !== "NONE") {
            sql += $scope.extra;
            if ($scope.extra === "AUTO_INCREMENT") {
                if ($scope.key === "PRIMARY") {
                    sql += " PRIMARY KEY";
                } else {
                    sql += ", ADD " + $scope.key + " (`" + $scope.columnName + "`)";
                }
            }
        }
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Adding column failed.");
            } else {
                $("#addColumnDialog").modal("hide");
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

    $scope.isNotNumericTypeSelected = function() {
        return !typeService.isNumeric($scope.type);
    };

    $scope.isNotStringTypeSelected = function() {
        return !typeService.isString($scope.type);
    };

    $scope.isKeyDisabled = function() {
        return $scope.extra !== "AUTO_INCREMENT";
    };

}]);
