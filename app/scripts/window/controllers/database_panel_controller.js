chromeMyAdmin.directive("databasePanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/database_panel.html"
    };
});

chromeMyAdmin.controller("DatabasePanelController", ["$scope", "mySQLClientService", "modeService", "$timeout", "UIConstants", "Events", "Modes", function($scope, mySQLClientService, modeService, $timeout, UIConstants, Events, Modes) {
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
        mySQLClientService.getStatistics().then(function(statistics) {
            $scope.statistics = statistics;
            return mySQLClientService.query("SHOW PROCESSLIST");
        }).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateProcessListColumnDefs(result.columnDefinitions);
                    updateProcessList(result.columnDefinitions, result.resultsetRows);
                    autoUpdatePromise = $timeout(
                        loadProcessList, UIConstants.DATABASE_INFO_AUTO_UPDATE_SPAN);
                });
            } else {
                $scope.fatalErrorOccurred("Retrieving process list failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
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
                    UIConstants.GRID_COLUMN_MAX_WIDTH)
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

    $scope.initialize = function() {
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
        initializeProcessListGrid();
        assignWindowResizeEventHandler();
        adjustProcessListHeight();
    };

    $scope.isDatabasePanelVisible = function() {
        return _isDatabasePanelVisible();
    };

}]);
