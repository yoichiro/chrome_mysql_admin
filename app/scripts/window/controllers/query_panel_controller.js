chromeMyAdmin.controller("QueryPanelController", function(
    $scope,
    modeService,
    mySQLClientService,
    targetObjectService,
    UIConstants,
    Events,
    Modes,
    queryHistoryService,
    Templates,
    configurationService,
    Configurations,
    $timeout,
    querySelectionService,
    columnTypeService,
    $filter,
    clipboardService
) {
    "use strict";

    var initializeQueryResultGrid = function() {
        resetQueryResultGrid();
        $scope.queryResultGrid = {
            data: "queryResultData",
            columnDefs: "queryResultColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            enablePinning: true,
            multiSelect: false,
            selectedItems: $scope.selectedRows,
            afterSelectionChange: function(rowItem, event) {
                if (rowItem.selected) {
                    querySelectionService.setSelectedRows(rowItem);
                } else {
                    querySelectionService.resetSelectedRows();
                }
            },
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
    };

    var resetQueryResultGrid = function() {
        $scope.queryResultColumnDefs = [];
        $scope.queryResultData = [];
        $scope.selectedQuery = "";
        querySelectionService.resetQueryResult();
        querySelectionService.resetSelectedRows();
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

    var onShowAndExecuteQueryPanel = function(query, removeEmptyResult) {
        modeService.changeMode(Modes.QUERY);
        $scope.query = query;
        doExecuteQueries(false, removeEmptyResult);
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
        $scope.$on(Events.SHOW_AND_EXECUTE_QUERY_PANEL, function(event, data) {
            onShowAndExecuteQueryPanel(data.query, data.removeEmptyResult);
        });
        $scope.$on(Events.REQUEST_REFRESH, function(event, data) {
            doExecuteQueries($scope.wasExplainExecuted, false);
        });
        $scope.$on(Events.EXPORT_QUERY_RESULT, function(event, data) {
            exportQueryResult();
        });
        $scope.$on(Events.COPY_QUERY_RESULT_ROW_TO_CLIPBOARD, function(event, data) {
            copyRowToClipboard();
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
        querySelectionService.setQueryResult(queryResult);
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

    var doExecuteQuery = function(queries, removeEmptyResult) {
        if (queries.length === 0) {
            doShowQueryResult(0);
            $scope.notifyQueryExecuted();
            return;
        }
        var query = queries.shift();
        mySQLClientService.query(query).then(function(result) {
            if (!removeEmptyResult ||
                (result.hasResultsetRows && result.resultsetRows.length > 0)) {
                $scope.queryResults.push({
                    query: query,
                    result: result,
                    success: true
                });
            }
            doExecuteQuery(queries, removeEmptyResult);
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
            doExecuteQuery([], removeEmptyResult);
        });
    };

    var doExecuteQueries = function(explain, removeEmptyResult) {
        resetQueryResultGrid();
        $scope.queryErrorMessage = "";
        $scope.queryResults = [];
        var query = $scope.query;
        if (query) {
            var parseResult = new MySQL.QueryDivider().parse(query);
            if (parseResult.success) {
                if (parseResult.result.length > 0) {
                    if (explain) {
                        angular.forEach(parseResult.result, function(query, index) {
                            this[index] = "EXPLAIN " + query;
                        }, parseResult.result);
                    }
                    doExecuteQuery(parseResult.result, removeEmptyResult);
                }
            } else {
                var errorMessage = "ParseError: " + parseResult.error.message;
                $scope.queryErrorMessage = errorMessage;
                $scope.editor.focus();
            }
            $scope.wasExplainExecuted = explain;
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

    var exportQueryResult = function() {
        var now = $filter("date")(new Date(), "yyyyMMddHHmmss");
        var filename = "query_result_" + now + ".csv";
        var options = {
            type: "saveFile",
            suggestedName: filename
        };
        chrome.fileSystem.chooseEntry(options, function(writableEntry) {
            if (writableEntry) {
                var blob = createSelectedQueryResultBlob();
                writableEntry.createWriter(function(writer) {
                    writer.onerror = function(e) {
                        $scope.fatalErrorOccurred(e);
                    };
                    writer.onwriteend = function() {
                        $scope.showMainStatusMessage("Exporting done: " + writableEntry.name);
                    };
                    writer.write(blob);
                }, function(e) {
                    $scope.fatalErrorOccurred(e);
                });
            }
        });
    };

    var createSelectedQueryResultBlob = function() {
        var lines = [];
        var queryResult = querySelectionService.getQueryResult();
        var columnDefinitions = queryResult.result.columnDefinitions;
        var resultsetRows = queryResult.result.resultsetRows;
        var titleRow = [];
        angular.forEach(columnDefinitions, function(column) {
            this.push("\"" + column.name + "\"");
        }, titleRow);
        lines.push(titleRow.join(","));
        angular.forEach(resultsetRows, function(row) {
            var values = [];
            angular.forEach(row.values, function(value, index) {
                if (value) {
                    if (columnTypeService.isNumeric(columnDefinitions[index].columnType)) {
                        this.push(value);
                    } else {
                        this.push("\"" + value.replace(/"/g, "\"\"") + "\"");
                    }
                } else {
                    this.push("");
                }
            }, values);
            lines.push(values.join(","));
        });
        var text = lines.join("\n");
        var blob = new Blob([text], {type: "text/csv"});
        return blob;
    };

    var copyRowToClipboard = function() {
        clipboardService.copyRow(querySelectionService.getQueryResult().result,
                                 querySelectionService.getSelectedRows());
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
        doExecuteQueries(false, false);
    };

    $scope.executeExplain = function() {
        doExecuteQueries(true, false);
    };

    $scope.isQueryErrorMessageVisible = function() {
        var msg = $scope.queryErrorMessage;
        return msg && msg.length > 0;
    };

    $scope.aceLoaded = function(editor) {
        ace.require("ace/ext/language_tools");
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
                doExecuteQueries(false, false);
            },
            readOnly: false
        });
        editor.setOptions({
            enableBasicAutocompletion: true
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

    $scope.onFileDrop = function(files) {
        if (files.length === 1) {
            var file = files[0];
            var reader = new FileReader();
            reader.onload = function(evt) {
                var text = evt.target.result;
                $scope.$apply(function() {
                    $scope.setQuery(text);
                });
            };
            reader.readAsText(file, "UTF-8");
        }
    };

});
