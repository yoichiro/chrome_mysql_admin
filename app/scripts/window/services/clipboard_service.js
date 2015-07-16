chromeMyAdmin.factory("clipboardService", function(
    $rootScope,
    columnTypeService
) {
    "use strict";

    return {
        copyRow: function(queryResult, row) {
            var columnDefinitions = queryResult.columnDefinitions;
            var resultsetRows = queryResult.resultsetRows;
            var values = [];
            angular.forEach(columnDefinitions, function(column, index) {
                var value = row.entity["column" + index];
                if (value) {
                    if (columnTypeService.isNumeric(column.columnType)) {
                    this.push(value);
                } else {
                    this.push("\"" + value.replace(/"/g, "\"\"") + "\"");
                }
            } else {
                this.push("");
            }
        }, values);
        var target = values.join(",");
        var copy = function(str, mimetype) {
            document.oncopy = function(event) {
                event.clipboardData.setData(mimetype, str);
                event.preventDefault();
                document.oncopy = null;
                $rootScope.showMainStatusMessage("Copied the row to clipboard as CSV string.");
            };
            document.execCommand("Copy", false, null);
        };
        copy(target, "text/plain");
        }
    };

});
