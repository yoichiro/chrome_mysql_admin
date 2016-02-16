chromeMyAdmin.controller("EditColumnDialogController", function(
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

    var onShowDialog = function(table, columnDefs, columnStructure) {
        resetErrorMessage();
        $scope.selectedTable = table;
        $scope.originalColumnDefs = columnDefs;
        $scope.originalColumnStructure = columnStructure;
        $scope.columnName = columnStructure.Field;
        var type = columnStructure.Type;
        $scope.type = getTypeName(type);
        var length;
        if ($scope.type === "SET" || $scope.type === "ENUM") {
            $scope.length = null;
            $scope.setEnumValues = getSetEnumValues(type);
        } else {
            length = getColumnLength(type);
            if (length) {
                $scope.length = Number(length);
            } else {
                $scope.length = null;
            }
            $scope.setEnumValues = [];
        }
        $scope.setEnumValue = "";
        $scope.unsigned = isUnsignedType(type);
        $scope.zerofill = isZerofillType(type);
        var collation = columnStructure.Collation;
        $scope.binary = isBinaryType(collation);
        $scope.allowNull = isNullType(columnStructure.Null);
        $scope.defaultValue = columnStructure.Default;
        $scope.extra = getExtra(columnStructure.Extra);
        $scope.key = getKey(columnStructure.Key);
        $scope.comment = columnStructure.Comment;
        $("#editColumnDialog").modal("show");
        var characterSet = getCharacterSet(collation);
        loadDatabaseData(characterSet, collation);
    };

    var getCharacterSet = function(collation) {
        if (collation) {
            var idx = collation.indexOf("_");
            if (idx !== -1) {
                return collation.substring(0, idx);
            } else {
                return collation;
            }
        } else {
            return null;
        }
    };

    var getKey = function(key) {
        if (key === "PRI") {
            return "PRIMARY";
        } else if (key === "MUL") {
            return "INDEX";
        } else if (key === "UNI") {
            return "UNIQUE";
        } else {
            return null;
        }
    };

    var getExtra = function(extra) {
        if (extra) {
            return extra.toUpperCase();
        } else {
            return "NONE";
        }
    };

    var getColumnLength = function(type) {
        var s = type.indexOf("(");
        if (s !== -1) {
            return type.substring(s + 1, type.indexOf(")"));
        } else {
            return null;
        }
    };

    var getSetEnumValues = function(type) {
        var idx = type.indexOf("(");
        var s = type.substring(idx + 1, type.indexOf(")"));
        var result = [];
        angular.forEach(s.split(","), function(value) {
            result.push(value.substring(1, value.length - 1));
        }, result);
        return result;
    };

    var isUnsignedType = function(type) {
        return type.indexOf("unsigned") !== -1;
    };

    var isZerofillType = function(type) {
        return type.indexOf("zerofill") !== -1;
    };

    var isBinaryType = function(collation) {
        return collation && (collation.indexOf("bin") !== -1);
    };

    var isNullType = function(nullValue) {
        return nullValue === "YES";
    };

    var getTypeName = function(type) {
        var result = "";
        var b = type.indexOf("(");
        var s = type.indexOf(" ");
        if (b !== -1) {
            result = type.substring(0, b);
        } else if (s !== -1) {
            result = type.substring(0, s);
        } else {
            result = type;
        }
        return result.toUpperCase();
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_EDIT_COLUMN_DIALOG, function(event, data) {
            var table = data.table;
            var columnDefs = data.columnDefs;
            var columnStructure = data.columnStructure;
            onShowDialog(table, columnDefs, columnStructure);
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

    var loadDatabaseData = function(characterSet, collation) {
        mySQLQueryService.showCharacterSet().then(function(result) {
            $scope.characterSets = result.resultsetRows;
            if (characterSet) {
                $scope.characterSet = characterSet;
            } else {
                $scope.characterSet = "utf8";
            }
            return mySQLQueryService.showCollations();
        }).then(function(result) {
            $scope.collations = result.resultsetRows;
            if (collation) {
                $scope.collation = collation;
            } else {
                $scope.collation = "utf8_general_ci";
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

    $scope.editColumn = function() {
        if ($scope.type === "SET" || $scope.type === "ENUM") {
            if ($scope.setEnumValues.length === 0) {
                $scope.errorMessage = "SET/ENUM type column must have one or more values.";
                return;
            }
        }
        var sql = "ALTER TABLE `" + $scope.selectedTable.name + "` ";
        sql += "CHANGE COLUMN `" + $scope.originalColumnStructure.Field + "` `";
        sql += sqlExpressionService.replaceValue($scope.columnName) + "` ";
        sql += $scope.type;
        if ($scope.length) {
            sql += "(" + $scope.length + ")";
        }
        if ($scope.type === "SET" || $scope.type === "ENUM") {
            sql += "(" + sqlExpressionService.createStringArray($scope.setEnumValues) + ")";
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
                $scope.fatalErrorOccurred("Editing column failed.");
            } else {
                $("#editColumnDialog").modal("hide");
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
