/*
 * Copyright (c) 2014 Yoichiro Tanaka. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

chromeMyAdmin.controller("QueryPanelController", ["$scope", "modeService", "mySQLClientService", "targetObjectService", "UIConstants", function($scope, modeService, mySQLClientService, targetObjectService, UIConstants) {
    "use strict";

    var initializeQueryResultGrid = function() {
        resetQueryResultGrid();
        $scope.queryResultGrid = {
            data: "queryResultData",
            columnDefs: "queryResultColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
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
            modeService.getMode() === "query";
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustQueryPanelHeight();
        });
    };

    var adjustQueryPanelHeight = function() {
        var totalHeight =
                $(window).height() -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT;
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
                width: Math.min(
                    Number(columnDefinition.columnLength) * UIConstants.GRID_COLUMN_FONT_SIZE,
                    UIConstants.GRID_COLUMN_MAX_WIDTH)
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
