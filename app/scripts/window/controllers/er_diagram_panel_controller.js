chromeMyAdmin.controller("ErDiagramPanelController", function(
    $scope,
    Events,
    Modes,
    mySQLClientService,
    UIConstants,
    modeService,
    targetObjectService,
    mySQLQueryService,
    TableTypes,
    relationService,
    $filter,
    configurationService,
    Configurations
) {
    "use strict";

    var resetErDiagram = function() {
        $scope.erDiagramModel = null;
    };

    var loadEntities = function() {
        var database = targetObjectService.getDatabase();
        var model = new ErDiagram.Model(database);
        mySQLQueryService.showTables().then(function(result) {
            if (result.hasResultsetRows) {
                angular.forEach(result.resultsetRows, function(row) {
                    if (row.values[1] === TableTypes.BASE_TABLE) {
                        model.createAndAddEntity(row.values[0]);
                    }
                });
                loadColumns(model, 0);
            } else {
                $scope.fatalErrorOccurred("Retrieving entities failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var loadColumns = function(model, idx) {
        if (model.getEntities().length === idx) {
            loadRelations(model, 0);
            return;
        }
        var entity = model.getEntities()[idx];
        var entityName = entity.getName();
        mySQLQueryService.showFullColumns(entityName).then(function(result) {
            if (result.hasResultsetRows) {
                angular.forEach(result.resultsetRows, function(row) {
                    var name = row.values[0];
                    var type = row.values[1];
                    var notNull = (row.values[3] === "NO");
                    var primary = (row.values[4] === "PRI");
                    entity.createAndAddColumn(name, type, notNull, primary);
                });
            } else {
                $scope.fatalErrorOccurred("Retrieving columns failed.");
            }
            loadColumns(model, ++idx);
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var loadRelations = function(model, idx) {
        if (model.getEntities().length === idx) {
            $scope.erDiagramModel = model;
            return;
        }
        var entity = model.getEntities()[idx];
        relationService.getRelations(entity.getName()).then(function(relations) {
            angular.forEach(relations, function(relation) {
                var sourceEntity = model.getEntity(entity.getName());
                var sourceColumn = sourceEntity.getColumn(relation.column);
                var targetEntity = model.getEntity(relation.fkTable);
                var targetColumn = targetEntity.getColumn(relation.fkColumn);
                sourceColumn.connectTo(targetColumn, ErDiagram.Connection.LineType.SOLID);
            });
            loadRelations(model, ++idx);
        }, function(reason) {
            $scope.fatalErrorOccurred("Retrieving relations failed.");
        });
    };

    var onModeChanged = function(mode) {
        if (mode === Modes.ER_DIAGRAM) {
            var database = targetObjectService.getDatabase();
            if (database) {
                if ($scope.database !== database) {
                    $scope.database = database;
                    loadEntities();
                }
            } else {
                resetErDiagram();
                $scope.database = null;
            }
        }
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetErDiagram();
        }
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        $scope.$on(Events.DATABASE_CHANGED, function(event, database) {
            if (modeService.getMode() === Modes.ER_DIAGRAM) {
                resetErDiagram();
                loadEntities();
            }
        });
        $scope.$on(Events.TABLE_CHANGED, function(event, table) {
            if (modeService.getMode() === Modes.ER_DIAGRAM) {
                if (table) {
                    $scope.erDiagramAPI.showEntityInView(table.name);
                }
            }
        });
        $scope.$on(Events.REFRESH_ER_DIAGRAM, function(event, data) {
            resetErDiagram();
            loadEntities();
        });
        $scope.$on(Events.SAVE_ER_DIAGRAM_IMAGE, function(event, data) {
            saveErDiagramImage();
        });
        configurationService.addConfigurationChangeListener(function(name, value) {
            $scope.safeApply(function() {
                if (name === Configurations.ER_DIAGRAM_SHOW_PRIMARY_KEY) {
                    $scope.configuration.showPrimaryKey = value;
                } else if (name === Configurations.ER_DIAGRAM_SHOW_COLUMN_TYPE) {
                    $scope.configuration.showColumnType = value;
                } else if (name === Configurations.ER_DIAGRAM_SHOW_COLUMN_NOT_NULL) {
                    $scope.configuration.showColumnNotNull = value;
                }
            });
        });
    };

    var saveErDiagramImage = function() {
        var now = $filter("date")(new Date(), "yyyyMMddHHmmss");
        var filename = targetObjectService.getDatabase() + "_" + now + ".png";
        var options = {
            type: "saveFile",
            suggestedName: filename
        };
        chrome.fileSystem.chooseEntry(options, function(writableEntry) {
            if (writableEntry) {
                var blob = $scope.erDiagramAPI.getBlob();
                writableEntry.createWriter(function(writer) {
                    writer.onerror = function(e) {
                        $scope.fatalErrorOccurred(e);
                    };
                    writer.onwriteend = function() {
                        $scope.showMainStatusMessage("Saving done: " + writableEntry.name);
                    };
                    writer.write(blob);
                }, function(e) {
                    $scope.fatalErrorOccurred(e);
                });
            }
        });
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustCanvasContainerHeight();
        });
    };

    var adjustCanvasContainerHeight = function() {
        $("#erDiagramPanel").height(
            $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT);
    };

    var _isERDiagramPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.ER_DIAGRAM;
    };

    var loadConfiguration = function() {
        var configuration = {};
        configurationService.getErDiagramShowPrimaryKey().then(function(showPrimaryKey) {
            configuration.showPrimaryKey = showPrimaryKey;
            return configurationService.getErDiagramShowColumnType();
        }).then(function(showColumnType) {
            configuration.showColumnType = showColumnType;
            return configurationService.getErDiagramShowColumnNotNull();
        }).then(function(showColumnNotNull) {
            configuration.showColumnNotNull = showColumnNotNull;
            $scope.configuration = configuration;
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        assignWindowResizeEventHandler();
        adjustCanvasContainerHeight();
        loadConfiguration();
    };

    $scope.isERDiagramPanelVisible = function() {
        return _isERDiagramPanelVisible();
    };

    $scope.storePosition = function(model, dimensions) {
        chrome.storage.sync.get("erDiagramDimensions", function(items) {
            var erDiagramDimensions = items.erDiagramDimensions || {};
            erDiagramDimensions[model.getDatabase()] = dimensions;
            chrome.storage.sync.set({erDiagramDimensions: erDiagramDimensions}, function() {
            });
        });
    };

    $scope.providePosition = function(model, callback) {
        if (model) {
            chrome.storage.sync.get("erDiagramDimensions", function(items) {
                var erDiagramDimensions = items.erDiagramDimensions || {};
                var dimensions = erDiagramDimensions[model.getDatabase()];
                callback(dimensions);
            });
        } else {
            callback(null);
        }
    };

    $scope.onLoadErDiagram = function(api) {
        $scope.erDiagramAPI = api;
    };

});
