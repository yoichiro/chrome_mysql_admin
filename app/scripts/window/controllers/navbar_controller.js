chromeMyAdmin.controller("NavbarController", function(
    $scope,
    mySQLClientService,
    modeService,
    targetObjectService,
    Events,
    Modes,
    ConfigurationTabs
) {
    "use strict";

    var loadDatabaseList = function() {
        mySQLClientService.getDatabases().then(function(databases) {
            $scope.safeApply(function() {
                $scope.selectedDatabase = "[Select database]";
                $scope.databases = databases;
                modeService.changeMode(Modes.DATABASE);
                targetObjectService.resetDatabase();
                targetObjectService.refreshTableList();
            });
        });
    };

    var onConnectionChanged = function(connectionInfo) {
        if (mySQLClientService.isConnected()) {
            $scope.safeApply(function() {
                targetObjectService.resetDatabase();
                loadDatabaseList();
                $scope.connectionInfo = connectionInfo;
            });
        }
    };

    var logout = function() {
        mySQLClientService.logout().then(function() {
            $scope.notifyConnectionChanged();
        });
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.CONNECTION_CHANGED, function(event, connectionInfo) {
            onConnectionChanged(connectionInfo);
        });
        $scope.$on(Events.LOGOUT, function(event, data) {
            logout();
        });
        $scope.$on(Events.REFRESH_DATABASES, function(event, data) {
            loadDatabaseList();
        });
        $scope.$on(Events.SHOW_ER_DIAGRAM, function(event, data) {
            modeService.changeMode(Modes.ER_DIAGRAM);
        });
    };

    $scope.initialize = function() {
        assignEventHandlers();
        $("[rel=tooltip]").tooltip();
        $scope.selectedDatabase = "[Select database]";
    };

    $scope.isConnected = function() {
        return mySQLClientService.isConnected();
    };

    $scope.selectDatabase = function(event, database) {
        $scope.selectedDatabase = database;
        targetObjectService.changeDatabase(database);
    };

    $scope.logout = function(event) {
        $scope.showConfirmDialog(
            "Would you really like to logout from MySQL server?",
            "Yes",
            "No",
            Events.LOGOUT,
            true
        );
    };

    $scope.isRowsActive = function() {
        return modeService.getMode() === Modes.ROWS;
    };

    $scope.isStructureActive = function() {
        return modeService.getMode() === Modes.STRUCTURE;
    };

    $scope.isQueryActive = function() {
        return modeService.getMode() === Modes.QUERY;
    };

    $scope.isDatabaseActive = function() {
        return modeService.getMode() === Modes.DATABASE;
    };

    $scope.isInformationActive = function() {
        return modeService.getMode() === Modes.INFORMATION;
    };

    $scope.isRelationActive = function() {
        return modeService.getMode() === Modes.RELATION;
    };

    $scope.isProcsFuncsActive = function() {
        return modeService.getMode() === Modes.PROCS_FUNCS;
    };

    $scope.isStatusGraphActive = function() {
        return modeService.getMode() === Modes.STATUS_GRAPH;
    };

    $scope.isERDiagramActive = function() {
        return modeService.getMode() === Modes.ER_DIAGRAM;
    };

    $scope.selectRows = function() {
        modeService.changeMode(Modes.ROWS);
    };

    $scope.selectStructure = function() {
        modeService.changeMode(Modes.STRUCTURE);
    };

    $scope.selectQuery = function() {
        modeService.changeMode(Modes.QUERY);
    };

    $scope.selectInformation = function() {
        modeService.changeMode(Modes.INFORMATION);
    };

    $scope.showDatabaseInfo = function() {
        modeService.changeMode(Modes.DATABASE);
    };

    $scope.configure = function() {
        $scope.showConfigurationDialog(ConfigurationTabs.BASIC);
    };

    $scope.selectRelation = function() {
        modeService.changeMode(Modes.RELATION);
    };

    $scope.selectProcsFuncs = function() {
        modeService.changeMode(Modes.PROCS_FUNCS);
    };

    $scope.selectStatusGraph = function() {
        modeService.changeMode(Modes.STATUS_GRAPH);
    };

    $scope.selectERDiagram = function() {
        $scope.showConfirmDialog(
            "Render an ER diagram of the DB?\nIt might take more than a minute depending on the number of the tables.",
            "Yes",
            "No",
            Events.SHOW_ER_DIAGRAM,
            false
        );
    };


});
