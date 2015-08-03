chromeMyAdmin.controller("StatusGraphPanelController", function(
    $scope,
    mySQLClientService,
    modeService,
    Modes,
    Events,
    UIConstants,
    $timeout,
    mySQLQueryService,
    configurationService,
    GraphTypes
) {
    "use strict";

    var autoUpdatePromise = null;

    var _isStatusGraphPanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === Modes.STATUS_GRAPH;
    };

    var onModeChanged = function(mode) {
        if (mode === Modes.STATUS_GRAPH) {
            loadStatus();
        } else {
            stopAutoUpdate();
        }
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            stopAutoUpdate();
            $scope.graphDataMap = {};
            $scope.graphDeltaDataMap = {};
            $scope.selectedStatusName = "";
            $scope.statusNameList = [];
            $scope.statusGraphList = [];
        }
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.MODE_CHANGED, function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on(Events.CONNECTION_CHANGED, function(event, data) {
            onConnectionChanged();
        });
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustGraphContainerHeight();
        });
    };

    var adjustGraphContainerHeight = function() {
        $("#graphContainer").height(
            $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT - 74);
    };

    var stopAutoUpdate = function() {
        if (autoUpdatePromise) {
            $timeout.cancel(autoUpdatePromise);
            autoUpdatePromise = null;
        }
    };

    var loadStatus = function() {
        mySQLQueryService.showGlobalStatus().then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateStatusNameList(result.resultsetRows);
                    updateGraphData(result.resultsetRows);
                    configurationService.getStatusGraphAutoUpdateSpan().then(function(span) {
                        autoUpdatePromise = $timeout(loadStatus, span);
                    });
                });
            } else {
                $scope.fatalErrorOccurred("Retrieving status failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateGraphData = function(resultsetRows) {
        angular.forEach(resultsetRows, function(row) {
            var statusName = row.values[0];
            var valueStr = row.values[1];
            var value = parseFloat(valueStr);
            if (!isNaN(value)) {
                // Normal
                var normalValues = $scope.graphDataMap[statusName] || [];
                if (normalValues.length >= 50) {
                    normalValues.shift();
                }
                normalValues.push(value);
                $scope.graphDataMap[statusName] = normalValues;
                // Delta
                var deltaValues = $scope.graphDeltaDataMap[statusName] || [];
                if (deltaValues.length >= 50) {
                    deltaValues.shift();
                }
                if (normalValues.length > 1) {
                    deltaValues.push(value - normalValues[normalValues.length - 2]);
                } else {
                    deltaValues.push(0);
                }
                $scope.graphDeltaDataMap[statusName] = deltaValues;
            }
        });
    };

    var updateStatusNameList = function(resultsetRows) {
        var statusNameList = [];
        angular.forEach(resultsetRows, function(row) {
            var valueStr = row.values[1];
            if (valueStr) {
                var value = parseFloat(valueStr);
                if (!isNaN(value)) {
                    this.push(row.values[0]);
                }
            }
        }, statusNameList);
        $scope.statusNameList = statusNameList;
        if (!$scope.selectedStatusName) {
            $scope.selectedStatusName = statusNameList[0];
        }
    };

    var doSelectStatusName = function(statusName) {
        $scope.selectedStatusName = statusName;
    };

    var setupItems = function() {
        $scope.graphTypes = [GraphTypes.NORMAL, GraphTypes.DELTA];
        $scope.selectedGraphType = GraphTypes.NORMAL;
    };

    var indexOfStatusGraphList = function(statusGraphList, statusName, graphType) {
        var result = -1;
        angular.forEach(statusGraphList, function(statusGraph, index) {
            if (statusGraph.statusName === statusName && statusGraph.graphType === graphType) {
                result = index;
            }
        });
        return result;
    };

    $scope.initialize = function() {
        setupItems();
        assignEventHandlers();
        assignWindowResizeEventHandler();
        adjustGraphContainerHeight();

        $scope.graphDataMap = {};
        $scope.graphDeltaDataMap = {};
        $scope.statusGraphList = [];
    };

    $scope.isStatusGraphPanelVisible = function() {
        return _isStatusGraphPanelVisible();
    };

    $scope.selectStatusName = function(statusName) {
        doSelectStatusName(statusName);
    };

    $scope.addGraph = function() {
        if ($scope.selectedStatusName) {
            if (indexOfStatusGraphList($scope.statusGraphList, $scope.selectedStatusName, $scope.selectedGraphType) === -1) {
                $scope.statusGraphList.push({
                    statusName: $scope.selectedStatusName,
                    graphType: $scope.selectedGraphType
                });
            }
        }
    };

    $scope.onGraphClosed = function(statusGraph) {
        var index = indexOfStatusGraphList($scope.statusGraphList, statusGraph.statusName, statusGraph.graphType);
        $scope.statusGraphList.splice(index, 1);
    };

    $scope.selectGraphType = function(graphType) {
        $scope.selectedGraphType = graphType;
    };

});
