chromeMyAdmin.factory("sqlExpressionService", ["$rootScope", function($rootScope) {
    "use strict";

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
                            "`" + columnDefinition.name + "`='" +
                            originalRow.values[index].replace(/'/g, "\\'") + "'";
                    this.push(condition);
                }, whereConditions);
            } else {
                angular.forEach(primaryKeyColumns, function(primaryKeyColumn, index) {
                    var condition =
                            "`" + primaryKeyColumn.name + "`='" +
                            originalRow.values[index].replace(/'/g, "\\'") + "'";
                    this.push(condition);
                }, whereConditions);
            }
            return whereConditions;
        },
        createInsertStatement: function(table, values) {
            var targetColumns = [];
            var targetValues = [];
            angular.forEach(values, function(value, columnName) {
                if (value) {
                    targetColumns.push("`" + columnName + "`");
                    targetValues.push("'" + value.replace(/'/g, "\\'") + "'");
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
