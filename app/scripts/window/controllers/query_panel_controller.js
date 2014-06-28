chromeMyAdmin.directive("queryPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/query_panel.html"
    };
});

chromeMyAdmin.controller("QueryPanelController", ["$scope", "modeService", "mySQLClientService", "targetObjectService", "UIConstants", "Events", "Modes", "queryHistoryService", "Templates", function($scope, modeService, mySQLClientService, targetObjectService, UIConstants, Events, Modes, queryHistoryService, Templates) {
    "use strict";

    var initializeQueryResultGrid = function() {
        resetQueryResultGrid();
        $scope.queryResultGrid = {
            data: "queryResultData",
            columnDefs: "queryResultColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            enablePinning: true,
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
    };

    var resetQueryResultGrid = function() {
        $scope.queryResultColumnDefs = [];
        $scope.queryResultData = [];
    };

    var _isQueryPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.QUERY;
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustQueryPanelHeight();
        });
    };

    var adjustQueryPanelHeight = function() {
        var totalHeight =
                $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT;
        $(".queryEditor").height(totalHeight / 3 - 14);
        $("#queryResultGrid").height(totalHeight * 2 / 3 - 53);
    };

    var onTableChanged = function(table) {
        if (modeService.getMode() === Modes.QUERY) {
            $scope.editor.insert(table);
            $scope.editor.focus();
        }
    };

    var onModeChanged = function(mode) {
        $scope.editor.focus();
        loadQueryHistory();
    };

    var onShowQueryPanel = function(query) {
        modeService.changeMode(Modes.QUERY);
        $scope.query = query;
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.TABLE_CHANGED, function(event, table) {
            onTableChanged(table);
        });
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.SHOW_QUERY_PANEL, function(event, data) {
            onShowQueryPanel(data.query);
        });
        $scope.$on(Events.REQUEST_REFRESH, function(event, data) {
            doExecuteQuery();
        });
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetQueryResultGrid();
            $scope.queryErrorMessage = "";
            $scope.query = "";
        }
    };

    var doExecuteQuery = function() {
        resetQueryResultGrid();
        $scope.queryErrorMessage = "";
        var query = $scope.query;
        mySQLClientService.query(query).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateQueryResultColumnDefs(result.columnDefinitions);
                    updateQueryResult(result.columnDefinitions, result.resultsetRows);
                    queryHistoryService.add(query).then(function() {
                        loadQueryHistory();
                    });
                    $scope.editor.focus();
                });
            }
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.queryErrorMessage = errorMessage;
            $scope.editor.focus();
        });
    };

    var updateQueryResultColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition, index) {
            this.push({
                field: "column" + index,
                displayName: columnDefinition.name,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH),
                cellTemplate: Templates.CELL_TEMPLATE,
                headerCellTemplate: Templates.HEADER_CELL_TEMPLATE,
                pinnable: true
            });
        }, columnDefs);
        $scope.queryResultColumnDefs = columnDefs;
    };

    var updateQueryResult = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row["column" + index] = values[index];
            });
            rows.push(row);
        });
        $scope.queryResultData = rows;
    };

    var loadQueryHistory = function() {
        queryHistoryService.getAll().then(function(result) {
            result.push("");
            $scope.queryHistory = result.reverse();
            $scope.queryInHistory = result[0];
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        initializeQueryResultGrid();
        assignWindowResizeEventHandler();
        adjustQueryPanelHeight();
    };

    $scope.isQueryPanelVisible = function() {
        return _isQueryPanelVisible();
    };

    $scope.executeQuery = function() {
        doExecuteQuery();
    };

    $scope.isQueryErrorMessageVisible = function() {
        var msg = $scope.queryErrorMessage;
        return msg && msg.length > 0;
    };

    $scope.aceLoaded = function(editor) {
        $scope.editor = editor;
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.setShowInvisibles(true);
        editor.commands.addCommand({
            name: "executeQuery",
            bindKey: {
                win: "Ctrl-Enter",
                mac: "Command-Enter"
            },
            exec: function(editor) {
                doExecuteQuery();
            },
            readOnly: false
        });
        $scope.createDdl = "CREATE TABLE ... ";
    };

    $scope.onChangeQueryInHistory = function() {
        var target = $scope.queryInHistory;
        if (target) {
            $scope.query = target;
        }
    };

    $scope.getDisplayValue = function(value) {
        if (value === null) {
            return "NULL";
        } else {
            return value;
        }
    };

    $scope.getDisplayValueClass = function(value) {
        if (value === null) {
            return "nullValueOnCell";
        } else {
            return "";
        }
    };

}]);
