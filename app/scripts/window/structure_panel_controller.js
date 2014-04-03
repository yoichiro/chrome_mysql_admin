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

chromeMyAdmin.controller("StructurePanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", "UIConstants", function($scope, mySQLClientService, modeService, targetObjectService, UIConstants) {
    "use strict";

    var initializeStructureGrid = function() {
        resetStructureGrid();
        $scope.structureGrid = {
            data: "structureData",
            columnDefs: "structureColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            headerRowHeight: UIConstants.GRID_ROW_HEIGHT,
            rowHeight: UIConstants.GRID_ROW_HEIGHT
        };
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            resetStructureGrid();
        }
    };

    var resetStructureGrid = function() {
        $scope.structureColumnDefs = [];
        $scope.structureData = [];
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustStructurePanelHeight();
        });
    };

    var adjustStructurePanelHeight = function() {
        $("#structureGrid").height(
            $(window).height() -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT);
    };

    var updateStructureColumnDefs = function(columnDefinitions) {
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
        $scope.structureColumnDefs = columnDefs;
    };

    var updateStructure = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.name] = values[index];
            });
            rows.push(row);
        });
        $scope.structureData = rows;
    };

    var loadStructure = function(tableName) {
        mySQLClientService.query("SHOW COLUMNS FROM " + tableName).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateStructureColumnDefs(result.columnDefinitions);
                    updateStructure(result.columnDefinitions, result.resultsetRows);
                });
            } else {
                $scope.fatalErrorOccurred("Retrieving structure failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var onModeChanged = function(mode) {
        if (mode === "structure") {
            var tableName = targetObjectService.getTable();
            if (tableName) {
                if ($scope.tableName !== tableName) {
                    $scope.tableName = tableName;
                    loadStructure(tableName);
                }
            } else {
                resetStructureGrid();
                $scope.tableName = null;
            }
        }
    };

    var _isStructurePanelVisible = function() {
        return mySQLClientService.isConnected() &&
            modeService.getMode() === "structure";
    };

    $scope.initialize = function() {
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        $scope.$on("databaseChanged", function(event, database) {
            resetStructureGrid();
        });
        $scope.$on("tableChanged", function(event, tableName) {
            if (_isStructurePanelVisible()) {
                $scope.tableName = tableName;
                if (tableName) {
                    loadStructure(tableName);
                } else {
                    resetStructureGrid();
                }
            }
        });
        $scope.$on("modeChanged", function(event, mode) {
            onModeChanged(mode);
        });
        initializeStructureGrid();
        assignWindowResizeEventHandler();
        adjustStructurePanelHeight();
    };

    $scope.isStructurePanelVisible = function() {
        return _isStructurePanelVisible();
    };

}]);
