chromeMyAdmin.directive("informationPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/information_panel.html"
    };
});

chromeMyAdmin.controller("InformationPanelController", ["$scope", "mySQLClientService", "modeService", "Events", "Modes", "targetObjectService", "Engines", "UIConstants", "mySQLQueryService", function($scope, mySQLClientService, modeService, Events, Modes, targetObjectService, Engines, UIConstants, mySQLQueryService) {
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
        mySQLQueryService.showCollations().then(function(result) {
            $scope.collations = result.resultsetRows;
            loadTableStatus(table);
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateTableStatus = function(table, columnDefinitions, resultsetRows) {
        var row = resultsetRows[0];
        angular.forEach(columnDefinitions, function(column, index) {
            $scope["tableStatus_" + column.name] = row.values[index];
        });
        mySQLQueryService.showCreateTable(table).then(function(result) {
            $scope.createDdl = result.ddl;
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var loadTableStatus = function(table) {
        mySQLQueryService.showTableStatus(table).then(function(result) {
            var resultsetRows = result.resultsetRows;
            updateTableStatus(table,
                              result.columnDefinitions,
                              result.resultsetRows);
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

    var onTableChanged = function(tableName) {
        if (_isInformationPanelVisible()) {
            $scope.tableName = tableName;
            if (tableName) {
                loadCollations(tableName);
            } else {
                resetDiplayedValues();
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
            onTableChanged(tableName);
        });
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.REQUEST_REFRESH, function(event, data) {
            onTableChanged(targetObjectService.getTable());
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
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
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
