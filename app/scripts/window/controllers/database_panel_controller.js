chromeMyAdmin.controller("DatabasePanelController", function(
    $scope,
    mySQLClientService,
    modeService,
    $timeout,
    UIConstants,
    Events,
    Modes,
    targetObjectService,
    configurationService,
    MySQLErrorCode,
    Templates,
    $filter,
    exportAllDatabasesService
) {
    "use strict";

    var autoUpdatePromise = null;

    var _isDatabasePanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.DATABASE;
    };

    var initializeProcessListGrid = function() {
        resetProcessListGrid();
        $scope.processListGrid = {
            data: "processListData",
            columnDefs: "processListColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            enablePinning: true,
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
    };

    var resetProcessListGrid = function() {
        $scope.processListColumnDefs = [];
        $scope.processListData = [];
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustProcessListHeight();
        });
    };

    var adjustProcessListHeight = function() {
        $("#processListGrid").height(
            $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT - 50);
    };

    var onModeChanged = function(mode) {
        if (mode === Modes.DATABASE) {
            loadProcessList();
        } else {
            stopAutoUpdate();
        }
    };

    var stopAutoUpdate = function() {
        if (autoUpdatePromise) {
            $timeout.cancel(autoUpdatePromise);
            autoUpdatePromise = null;
        }
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            stopAutoUpdate();
        }
    };

    var loadProcessList = function() {
        resetProcessListGrid();
        mySQLClientService.getStatistics().then(function(statistics) {
            $scope.statistics = statistics;
            return mySQLClientService.query("SHOW PROCESSLIST");
        }).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateProcessListColumnDefs(result.columnDefinitions);
                    updateProcessList(result.columnDefinitions, result.resultsetRows);
                    configurationService.getDatabaseInfoAutoUpdateSpan().then(function(span) {
                        autoUpdatePromise = $timeout(loadProcessList, span);
                    });
                });
            } else {
                $scope.fatalErrorOccurred("Retrieving process list failed.");
            }
        }, function(reason) {
            if (reason["errorCode"] === MySQLErrorCode.ACCESS_DENIED) {
                configurationService.getDatabaseInfoAutoUpdateSpan().then(function(span) {
                    autoUpdatePromise = $timeout(loadProcessList, span);
                });
            } else {
                $scope.fatalErrorOccurred(reason);
            }
        });
    };

    var updateProcessListColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.name,
                displayName: columnDefinition.name,
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH),
                cellTemplate: Templates.CELL_TEMPLATE,
                headerCellTemplate: Templates.HEADER_CELL_TEMPLATE,
                pinnable: true
            });
        }, columnDefs);
        $scope.processListColumnDefs = columnDefs;
    };

    var updateProcessList = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.name] = values[index];
            });
            rows.push(row);
        });
        $scope.processListData = rows;
    };

    var deleteSelectedDatabase = function() {
        var database = targetObjectService.getDatabase();
        if (database) {
            var sql = "DROP DATABASE `" + database + "`";
            mySQLClientService.query(sql).then(function(result) {
                if (result.hasResultsetRows) {
                    $scope.fatalErrorOccurred("Deleting database failed.");
                } else {
                    targetObjectService.refreshDatabases();
                }
            }, function(reason) {
                var errorMessage = "[Error code:" + reason.errorCode;
                errorMessage += " SQL state:" + reason.sqlState;
                errorMessage += "] ";
                errorMessage += reason.errorMessage;
                $scope.errorMessage = errorMessage;
            });
        }
    };

    var exportAllDatabases = function() {
        var now = $filter("date")(new Date(), "yyyyMMddHHmmss");
        var filename = "dump_" + now + ".sql";
        var options = {
            type: "saveFile",
            suggestedName: filename
        };
        chrome.fileSystem.chooseEntry(options, function(writableEntry) {
            if (writableEntry) {
                exportAllDatabasesService.exportAllDatabases().then(function(result) {
                    var blob = result;
                    writableEntry.createWriter(function(writer) {
                        writer.onerror = function(e) {
                            $scope.fatalErrorOccurred(e);
                        };
                        writer.onwriteend = function() {
                            if (writer.length == 0) {
                                writer.write(blob);
                            } else {
                                $scope.showMainStatusMessage("Exporting done: " + writableEntry.name);
                            }
                        };
                        writer.truncate(0);
                    }, function(e) {
                        $scope.fatalErrorOccurred(e);
                    });
                }, function(reason) {
                    $scope.fatalErrorOccurred(reason);
                });
            }
        });
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.DELETE_SELECTED_DATABASE, function(event, data) {
            deleteSelectedDatabase();
        });
        $scope.$on(Events.EXPORT_ALL_DATABASES, function(event, data) {
            exportAllDatabases();
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        initializeProcessListGrid();
        assignWindowResizeEventHandler();
        adjustProcessListHeight();
    };

    $scope.isDatabasePanelVisible = function() {
        return _isDatabasePanelVisible();
    };

});
