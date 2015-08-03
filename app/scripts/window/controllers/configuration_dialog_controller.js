chromeMyAdmin.controller("ConfigurationDialogController", function(
    $scope,
    mySQLClientService,
    Events,
    configurationService,
    QueryEditorWrapMode,
    anyQueryExecuteService,
    ssh2KnownHostService
) {
    "use strict";

    var doOpen = function(activeTab) {
        configurationService.getDatabaseInfoAutoUpdateSpan().then(function(span) {
            $scope.databaseInfoAutoUpdateSpan = span / 1000;
            return configurationService.getRowCountPerPageInRowsPanel();
        }).then(function(rowCount) {
            $scope.rowCountPerPageInRowsPanel = rowCount;
            return configurationService.getQueryEditorWrapMode();
        }).then(function(mode) {
            $scope.queryEditorWrapMode = mode ? QueryEditorWrapMode.WRAP : QueryEditorWrapMode.NOT_WRAP;
            return configurationService.getStatusGraphAutoUpdateSpan();
        }).then(function(span) {
            $scope.statusGraphAutoUpdateSpan = span / 1000;
            return configurationService.getErDiagramShowPrimaryKey();
        }).then(function(showPrimaryKey) {
            $scope.erDiagramShowPrimaryKey = showPrimaryKey ? "ON" : "OFF";
            return configurationService.getErDiagramShowColumnType();
        }).then(function(showColumnType) {
            $scope.erDiagramShowColumnType = showColumnType ? "ON" : "OFF";
            return configurationService.getErDiagramShowColumnNotNull();
        }).then(function(showColumnNotNull) {
            $scope.erDiagramShowColumnNotNull = showColumnNotNull ? "ON" : "OFF";
            return ssh2KnownHostService.getAll();
        }).then(function(knownHosts) {
            $scope.knownHosts = knownHosts;
        });
        $(".nav-pills a[href=\"#" + activeTab + "\"]").tab("show");
        $("#configurationDialog").modal("show");
    };

    var close = function() {
        $("#configurationDialog").modal("hide");
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_CONFIGURATION_DIALOG, function(event, data) {
            doOpen(data.activeTab);
        });
    };

    $scope.initialize = function() {
        $scope.databaseInfoAutoUpdateSpans = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
        $scope.statusGraphAutoUpdateSpans = [1, 3, 5, 10, 15, 20, 25, 30];
        $scope.rowCountsPerPageInRowsPanel = [10, 20, 50, 100, 200, 500, 1000];
        $scope.queryEditorWrapModes = [QueryEditorWrapMode.WRAP, QueryEditorWrapMode.NOT_WRAP];
        assignEventHandlers();
    };

    $scope.execute = function() {
    };

    $scope.getQueryHistory = function() {
        return mySQLClientService.getQueryHistory();
    };

    $scope.changeDatabaseInfoSpan = function() {
        configurationService.setDatabaseInfoAutoUpdateSpan(
            Number($scope.databaseInfoAutoUpdateSpan) * 1000);
    };

    $scope.changeStatusGraphSpan = function() {
        configurationService.setStatusGraphAutoUpdateSpan(
            Number($scope.statusGraphAutoUpdateSpan) * 1000);
    };

    $scope.editQuery = function(query) {
        close();
        anyQueryExecuteService.showQueryPanel(query);
    };

    $scope.changeRowCount = function() {
        configurationService.setRowCountPerPageInRowsPanel(
            Number($scope.rowCountPerPageInRowsPanel));
    };

    $scope.changeQueryEditorWrapMode = function() {
        configurationService.setQueryEditorWrapMode(
            $scope.queryEditorWrapMode === QueryEditorWrapMode.WRAP);
    };

    $scope.changeErDiagramSettings = function() {
        configurationService.setErDiagramShowPrimaryKey(
            $scope.erDiagramShowPrimaryKey === "ON").then(function() {
                return configurationService.setErDiagramShowColumnType(
                    $scope.erDiagramShowColumnType === "ON");
            }).then(function() {
                configurationService.setErDiagramShowColumnNotNull(
                    $scope.erDiagramShowColumnNotNull === "ON");
            });
    };

    $scope.getFingerprintString = function(value) {
        var disp = value.method + " " + value.fingerprint.substring(0, 2);
        for (var i = 2; i < value.fingerprint.length; i += 2) {
            disp += ":" + value.fingerprint.substring(i, i + 2);
        }
        return disp;
    };

});
