"use strict";

chromeMyAdmin.controller("StructurePanelController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", function($scope, mySQLClientService, modeService, targetObjectService) {

    var initializeStructureGrid = function() {
        resetStructureGrid();
        $scope.structureGrid = {
            data: "structureData",
            columnDefs: "structureColumnDefs",
            enableColumnResize: true,
            headerRowHeight: 25,
            rowHeight: 25
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
        $("#structureGrid").height($(window).height() - 76);
    };

    var updateStructureColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.name,
                displayName: columnDefinition.name,
                width: Math.min(Number(columnDefinition.columnLength) * 14, 300)
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
            if ($scope.tableName !== tableName) {
                $scope.tableName = tableName;
                loadStructure(tableName);
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
                loadStructure(tableName);
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
