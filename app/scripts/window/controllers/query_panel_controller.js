chromeMyAdmin.directive("queryPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/query_panel.html"
    };
});

chromeMyAdmin.controller("QueryPanelController", ["$scope", "modeService", "mySQLClientService", "targetObjectService", "UIConstants", "Events", "Modes", "queryHistoryService", "Templates", "configurationService", "Configurations", "$timeout", function($scope, modeService, mySQLClientService, targetObjectService, UIConstants, Events, Modes, queryHistoryService, Templates, configurationService, Configurations, $timeout) {
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
        $scope.selectedQuery = "";
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
        $(".queryEditor").height(totalHeight / 3);
        $("#queryResultGrid").height(totalHeight * 2 / 3 - 74);
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
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.SHOW_QUERY_PANEL, function(event, data) {
            onShowQueryPanel(data.query);
        });
        $scope.$on(Events.REQUEST_REFRESH, function(event, data) {
            doExecuteQueries();
        });
        configurationService.addConfigurationChangeListener(function(name, value) {
            if (name === Configurations.QUERY_EDITOR_WRAP_MODE) {
                $scope.editor.getSession().setUseWrapMode(value);
            }
        });
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetQueryResultGrid();
            $scope.queryErrorMessage = "";
            $scope.query = "";
        }
    };

    var doShowQueryResult = function(index) {
        resetQueryResultGrid();
        var queryResult = $scope.queryResults[index];
        $scope.selectedQuery = queryResult.query;
        if (queryResult.success) {
            var result = queryResult.result;
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    $scope.queryErrorMessage = "";
                    updateQueryResultColumnDefs(result.columnDefinitions);
                    updateQueryResult(result.columnDefinitions, result.resultsetRows);
                    $scope.editor.focus();
                });
            } else {
                $scope.safeApply(function() {
                    var message =
                            "No errors. Affected rows count is " +
                            result.result.affectedRows;
                    $scope.queryErrorMessage = message;
                    $scope.editor.focus();
                });
            }
        } else {
            $scope.queryErrorMessage = queryResult.errorMessage;
            $scope.editor.focus();
        }
    };

    var doExecuteQuery = function(queries) {
        if (queries.length === 0) {
            doShowQueryResult(0);
            return;
        }
        var query = queries.shift();
        mySQLClientService.query(query).then(function(result) {
            $scope.queryResults.push({
                query: query,
                result: result,
                success: true
            });
            doExecuteQuery(queries);
            queryHistoryService.add(query).then(function() {
                loadQueryHistory();
            });
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.queryResults.push({
                query: query,
                errorMessage: errorMessage,
                sucess: false
            });
            doExecuteQuery([]);
        });
    };

    var doExecuteQueries = function() {
        resetQueryResultGrid();
        $scope.queryErrorMessage = "";
        $scope.queryResults = [];
        var query = $scope.query;
        if (query) {
            var parseResult = new MySQL.QueryDivider().parse(query);
            if (parseResult.success) {
                if (parseResult.result.length > 0) {
                    doExecuteQuery(parseResult.result);
                }
            } else {
                var errorMessage = "ParseError: " + parseResult.error.message;
                $scope.queryErrorMessage = errorMessage;
                $scope.editor.focus();
            }
        }
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
            $scope.queryHistory = result.reverse();
        });
    };

    $scope.initialize = function() {
        $scope.queryResults = [];
        assignEventHandlers();
        initializeQueryResultGrid();
        assignWindowResizeEventHandler();
        adjustQueryPanelHeight();
        $scope.clearQuery();
    };

    $scope.isQueryPanelVisible = function() {
        return _isQueryPanelVisible();
    };

    $scope.executeQuery = function() {
        doExecuteQueries();
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
        configurationService.getQueryEditorWrapMode().then(function(mode) {
            editor.getSession().setUseWrapMode(mode);
        });
        editor.commands.addCommand({
            name: "executeQuery",
            bindKey: {
                win: "Ctrl-Enter",
                mac: "Command-Enter"
            },
            exec: function(editor) {
                doExecuteQueries();
            },
            readOnly: false
        });
        $scope.createDdl = "CREATE TABLE ... ";
    };

    $scope.setQuery = function(query) {
        $scope.query = query;
        $scope.editor.focus();
    };

    $scope.insertQuery = function(query) {
        var current = $scope.editor.getCursorPosition();
        var pos = 0;
        var lines = $scope.query.split("\n");
        for (var i = 0; i < current.row; i++) {
            pos += lines[i].length + 1;
        }
        pos += current.column;
        $scope.query =
            $scope.query.substring(0, pos) +
            query +
            $scope.query.substring(pos);
        $scope.editor.focus();
        $timeout(function() {
            $scope.editor.getSelection().moveCursorToPosition(current);
        }, 100);
    };

    $scope.clearQuery = function() {
        $scope.query = "";
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

    $scope.showQueryResult = function(index) {
        doShowQueryResult(index);
    };

}]);
