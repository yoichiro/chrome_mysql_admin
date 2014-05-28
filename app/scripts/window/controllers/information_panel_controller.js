chromeMyAdmin.directive("informationPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/information_panel.html"
    };
});

chromeMyAdmin.controller("InformationPanelController", ["$scope", "mySQLClientService", "modeService", "Events", "Modes", "targetObjectService", "Engines", "UIConstants", function($scope, mySQLClientService, modeService, Events, Modes, targetObjectService, Engines, UIConstants) {
    "use strict";

    var _isInformationPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.INFORMATION;
    };

    var resetDiplayedValues = function() {
        for (var key in $scope) {
            if (key.indexOf("tableStatus_") === 0) {
                $scope[key] = "";
            }
        }
        $scope.createDdl = "";
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetDiplayedValues();
        }
    };

    var loadCollations = function(table) {
        mySQLClientService.query("SHOW COLLATION").then(function(result) {
            if (result.hasResultsetRows) {
                $scope.collations = result.resultsetRows;
                if (result.resultsetRows.length > 0) {
                    loadTableStatus(table);
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

    var updateTableStatus = function(table, columnDefinitions, resultsetRows) {
        var row = resultsetRows[0];
        angular.forEach(columnDefinitions, function(column, index) {
            console.log(column.name + " " + row.values[index]);
            $scope["tableStatus_" + column.name] = row.values[index];
        });
        var sql = "SHOW CREATE TABLE `" + table + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                var resultsetRows = result.resultsetRows;
                if (resultsetRows && resultsetRows.length == 1) {
                    var row = resultsetRows[0];
                    var ddl = row.values[1];
                    $scope.createDdl = ddl;
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

    var loadTableStatus = function(table) {
        var sql = "SHOW TABLE STATUS LIKE '" + table + "'";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                var resultsetRows = result.resultsetRows;
                if (resultsetRows && resultsetRows.length == 1) {
                    updateTableStatus(table,
                                      result.columnDefinitions,
                                      result.resultsetRows);
                } else {
                    $scope.fatalErrorOccurred("Retrieving table status failed.");
                }
            } else {
                $scope.fatalErrorOccurred("Retrieving table status failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var onModeChanged = function(mode) {
        if (mode === Modes.INFORMATION) {
            var tableName = targetObjectService.getTable();
            if (tableName) {
                $scope.tableName = tableName;
                loadCollations(tableName);
            } else {
                $scope.tableName = null;
            }
        }
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            resetDiplayedValues();
        });
        $scope.$on(Events.TABLE_CHANGED, function(event, tableName) {
            if (_isInformationPanelVisible()) {
                $scope.tableName = tableName;
                if (tableName) {
                    loadCollations(tableName);
                } else {
                    resetDiplayedValues();
                }
            }
        });
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustCreateDdlEditorHeight();
        });
    };

    var adjustCreateDdlEditorHeight = function() {
        var totalHeight =
                $(window).height() -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT;
        angular.forEach($(".tableStatusPanel"), function(e) {
            var elem = $(e);
            if (elem) {
                totalHeight -= elem.height();
            }
        });
        $(".createDdlEditor").height(totalHeight - 14);
    };

    $scope.initialize = function() {
        assignEventHandlers();
        $scope.engines = Engines;
        assignWindowResizeEventHandler();
        adjustCreateDdlEditorHeight();
    };

    $scope.isInformationPanelVisible = function() {
        return _isInformationPanelVisible();
    };

    $scope.onCollationChanged = function() {
        var collation = $scope["tableStatus_Collation"];
        var encoding = collation.split("_")[0];
        var sql = "ALTER TABLE `" + targetObjectService.getTable() + "` " +
                "CHARACTER SET " + encoding + " COLLATE " + collation;
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Changing table character set and collation failed.");
            } else {
                loadCollations(targetObjectService.getTable());
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    $scope.onEngineChanged = function() {
        var engine = $scope["tableStatus_Engine"];
        var sql = "ALTER TABLE `" + targetObjectService.getTable() + "` " +
                "ENGINE = " + engine;
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Changing table engine failed.");
            } else {
                loadCollations(targetObjectService.getTable());
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    $scope.aceLoaded = function(editor) {
        $scope.editor = editor;
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.setShowInvisibles(true);
        editor.setReadOnly(true);
    };

}]);
