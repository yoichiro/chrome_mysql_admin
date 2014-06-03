chromeMyAdmin.directive("relationPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/relation_panel.html"
    };
});

chromeMyAdmin.controller("RelationPanelController", ["$scope", "mySQLClientService", "modeService", "Modes", "UIConstants", "targetObjectService", "Events", function($scope, mySQLClientService, modeService, Modes, UIConstants, targetObjectService, Events) {
    "use strict";

    var initializeRelationGrid = function() {
        resetRelationGrid();
        $scope.relationGrid = {
            data: "relationData",
            columnDefs: "relationColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            multiSelect: false,
            selectedItems: $scope.selectedRows,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    //rowsSelectionService.setSelectedRows(rowItem);
                } else {
                    //rowsSelectionService.reset();
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
    };

    var createColumnDefinition = function(field, displayName) {
        return {
            field: field,
            displayName: displayName,
            width: Number(displayName.length) * UIConstants.GRID_COLUMN_FONT_SIZE,
            cellTemplate: "<div class=\"ngCellText\" title=\"{{row.getProperty(col.field)}}\">{{row.getProperty(col.field)}}</div>"
        };
    };

    var resetRelationGrid = function() {
        $scope.relationColumnDefs = [
            createColumnDefinition("name", "Name"),
            createColumnDefinition("column", "Column"),
            createColumnDefinition("fkTable", "Reference table"),
            createColumnDefinition("fkColumn", "Reference column"),
            createColumnDefinition("onDelete", "On delete"),
            createColumnDefinition("onUpdate", "On update")
        ];
        $scope.relationData = [];
        //rowsSelectionService.reset();
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustRelationPanelHeight();
        });
    };

    var adjustRelationPanelHeight = function() {
        $("#relationGrid").height(
            $(window).height() -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT);
    };

    var _isRelationPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.RELATION;
    };

    var onModeChanged = function(mode) {
        if (mode === Modes.RELATION) {
            var tableName = targetObjectService.getTable();
            if (tableName) {
                if ($scope.tableName !== tableName) {
                    $scope.tableName = tableName;
                    loadRelations(tableName);
                }
            } else {
                resetRelationGrid();
                $scope.tableName = null;
            }
        }
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetRelationGrid();
        }
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            //rowsPagingService.reset();
            resetRelationGrid();
        });
        $scope.$on(Events.TABLE_CHANGED, function(event, tableName) {
            if (_isRelationPanelVisible()) {
                //rowsPagingService.reset();
                $scope.tableName = tableName;
                if (tableName) {
                    loadRelations(tableName);
                } else {
                    resetRelationGrid();
                }
            }
        });
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
    };

    var parseForeignKeysFromCreateTableDdl = function(ddl) {
        var lines = ddl.split("\n");
        angular.forEach(lines, function(line) {
            line = line.trim();
            if (line.indexOf("CONSTRAINT") !== -1 &&
                line.indexOf("FOREIGN KEY") !== -1) {
                var divided = divideWords(line);
                var onDelete = "";
                var onUpdate = "";
                for (var i = 0; i < divided.length; i++) {
                    if (divided[i] === "ON") {
                        var operation = divided[i + 1];
                        for (var j = i + 2; j < divided.length; j++) {
                            if (divided[j] !== "ON") {
                                if (operation === "DELETE") {
                                    onDelete += " " + divided[j];
                                } else if (operation === "UPDATE") {
                                    onUpdate += " " + divided[j];
                                }
                            } else {
                                break;
                            }
                        }
                        i = j - 1;
                    }
                }
                var constraint = {
                    name: divided[1],
                    column: divided[4].substring(1, divided[4].length - 1),
                    fkTable: divided[6],
                    fkColumn: divided[7].substring(1, divided[7].length - 1),
                    onDelete: onDelete,
                    onUpdate: onUpdate
                };
                $scope.relationData.push(constraint);
            }
        });
    };

    var divideWords = function(line) {
        var inStr = false;
        var result = [];
        var tmp = "";
        for (var i = 0; i < line.length; i++) {
            var c = line.charAt(i);
            if (c === " " && !inStr) {
                result.push(tmp);
                tmp = "";
            } else if (c === "`") {
                inStr = !inStr;
            } else {
                tmp += c;
            }
        }
        if (tmp.charAt(tmp.length - 1) === ",") {
            tmp = tmp.substring(0, tmp.length - 1);
        }
        result.push(tmp);
        return result;
    };

    var loadRelations = function(table) {
        var sql = "SHOW CREATE TABLE `" + table + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                var resultsetRows = result.resultsetRows;
                if (resultsetRows && resultsetRows.length == 1) {
                    var row = resultsetRows[0];
                    var ddl = row.values[1];
                    resetRelationGrid();
                    parseForeignKeysFromCreateTableDdl(ddl);
                } else {
                    $scope.fatalErrorOccurred("Retrieving create table DDL failed.");
                }
            } else {
                $scope.fatalErrorOccurred("Retrieving create table DDL failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        initializeRelationGrid();
        assignWindowResizeEventHandler();
        adjustRelationPanelHeight();
    };

    $scope.isRelationPanelVisible = function() {
        return _isRelationPanelVisible();
    };

}]);
