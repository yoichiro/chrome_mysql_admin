"use strict";

chromeMyAdmin.controller("QueryPanelController", ["$scope", "modeService", "mySQLClientService", "targetObjectService", function($scope, modeService, mySQLClientService, targetObjectService) {

    var initializeQueryResultGrid = function() {
        resetQueryResultGrid();
        $scope.queryResultGrid = {
            data: "queryResultData",
            columnDefs: "queryResultColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            headerRowHeight: 25,
            rowHeight: 25
        };
    };

    var resetQueryResultGrid = function() {
        $scope.queryResultColumnDefs = [];
        $scope.queryResultData = [];
    };

    var _isQueryPanelVisible = function() {
        return mySQLClientService.isConnected()
            && modeService.getMode() === "query";
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustQueryPanelHeight();
        });
    };

    var adjustQueryPanelHeight = function() {
        var totalHeight = $(window).height() - 76;
        $("#queryEditor").height(totalHeight / 3 - 14);
        $("#queryResultGrid").height(totalHeight * 2 / 3 - 32);
    };

    var assignEventHandlers = function() {
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
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
                });
            }
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.queryErrorMessage = errorMessage;
        });
    };

    var updateQueryResultColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition, index) {
            this.push({
                field: "column" + index,
                displayName: columnDefinition.name,
                width: Math.min(Number(columnDefinition.columnLength) * 14, 300)
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

}]);
