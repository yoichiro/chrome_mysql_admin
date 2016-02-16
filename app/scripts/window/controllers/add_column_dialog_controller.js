chromeMyAdmin.controller("AddColumnDialogController", function(
    $scope,
    Events,
    mySQLClientService,
    $q,
    targetObjectService,
    typeService,
    mySQLQueryService,
    sqlExpressionService
) {
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
        $scope.setEnumValue = "";
        $scope.setEnumValues = [];
        $scope.comment = "";
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
        mySQLQueryService.showCharacterSet().then(function(result) {
            $scope.characterSets = result.resultsetRows;
            $scope.characterSet = "utf8";
            return mySQLQueryService.showCollations();
        }).then(function(result) {
            $scope.collations = result.resultsetRows;
            $scope.collation = "utf8_general_ci";
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
        if ($scope.type === "SET" || $scope.type === "ENUM") {
            if ($scope.setEnumValues.length === 0) {
                $scope.errorMessage = "SET/ENUM type column must have one or more values.";
                return;
            }
        }
        var sql = "ALTER TABLE `" + $scope.selectedTable.name + "` ";
        sql += "ADD COLUMN `" + sqlExpressionService.replaceValue($scope.columnName) + "` ";
        sql += $scope.type;
        if ($scope.length) {
            sql += "(" + $scope.length + ")";
        }
        if ($scope.type === "SET" || $scope.type === "ENUM") {
            sql += "(" + sqlExpressionService.createStringArray($scope.setEnumValues) + ")";
        }
        sql += " ";
        if (typeService.isString($scope.type)) {
            if ($scope.binary) {
                sql += "BINARY ";
            }
            sql += "CHARACTER SET " + $scope.characterSet + " ";
            sql += "COLLATE " + $scope.collation + " ";
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
        } else if ($scope.type == 'TIMESTAMP' && $scope.allowNull) {
            sql += "NULL ";
        }
        if ($scope.defaultValue) {
            if (typeService.isNumeric($scope.type)
                || $scope.type == 'TIMESTAMP' && $scope.defaultValue == "CURRENT_TIMESTAMP"
            ) {
                sql += "DEFAULT " + $scope.defaultValue + " ";
            } else {
                sql += "DEFAULT '" + sqlExpressionService.replaceValue($scope.defaultValue) + "' ";
            }
        }
        if ($scope.comment) {
            sql += "COMMENT '" + sqlExpressionService.replaceValue($scope.comment) + "' ";
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

    $scope.addSetEnumValue = function() {
        if ($scope.setEnumValue && $scope.setEnumValues.indexOf($scope.setEnumValue) === -1) {
            $scope.setEnumValues.push($scope.setEnumValue);
        }
        $scope.setEnumValue = "";
    };

    $scope.deleteSetEnumValue = function(value) {
        var index = $scope.setEnumValues.indexOf(value);
        if (index !== -1) {
            $scope.setEnumValues.splice(index, 1);
        }
    };

});
