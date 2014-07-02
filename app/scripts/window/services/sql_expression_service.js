chromeMyAdmin.factory("sqlExpressionService", ["$rootScope", "ValueTypes", function($rootScope, ValueTypes) {
    "use strict";

    var createEqualRightExpression = function(value) {
        if (value !== null) {
            return "='" + value.replace(/'/g, "\\'") + "'";
        } else {
            return " IS NULL";
        }
    };

    return {
        getPrimaryKeyColumns: function(columnDefinitions) {
            var primaryKeyColumns = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                if (columnDefinition.isPrimaryKey()) {
                    this[index] = columnDefinition;
                }
            }, primaryKeyColumns);
            return primaryKeyColumns;
        },
        createWhereConditionsForUpdate: function(
            primaryKeyColumns, columnDefinitions, originalRow) {
            var whereConditions = [];
            if (jQuery.isEmptyObject(primaryKeyColumns)) {
                angular.forEach(columnDefinitions, function(columnDefinition, index) {
                    var condition =
                            "`" + columnDefinition.name + "`" +
                            createEqualRightExpression(originalRow.values[index]);
                    this.push(condition);
                }, whereConditions);
            } else {
                angular.forEach(primaryKeyColumns, function(primaryKeyColumn, index) {
                    var condition =
                            "`" + primaryKeyColumn.name + "`" +
                            createEqualRightExpression(originalRow.values[index]);
                    this.push(condition);
                }, whereConditions);
            }
            return whereConditions;
        },
        createInsertStatement: function(table, values, valueTypes) {
            var targetColumns = [];
            var targetValues = [];
            angular.forEach(values, function(value, columnName) {
                var valueType = valueTypes[columnName];
                if (valueType === ValueTypes.NULL) {
                    targetColumns.push("`" + columnName + "`");
                    targetValues.push("NULL");
                } else if (value != null) {
                    targetColumns.push("`" + columnName + "`");
                    if (valueType === ValueTypes.VALUE) {
                        targetValues.push("'" + value.replace(/'/g, "\\'") + "'");
                    } else if (valueType === ValueTypes.EXPRESSION) {
                        targetValues.push(value);
                    }
                }
            });
            if (targetColumns.length !== 0) {
                var sql = "INSERT INTO `" + table + "` (";
                sql += targetColumns.join(", ");
                sql += ") VALUES (";
                sql += targetValues.join(", ");
                sql += ")";
                return sql;
            } else {
                return null;
            }
        }
    };
}]);
