"use strict";

chromeMyAdmin.controller("DatabaseObjectController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    var initializeRowsGrid = function() {
        resetRowsGrid();
        $scope.rowsGrid = {
            data: "rowsData",
            columnDefs: "rowsColumnDefs",
            enableColumnResize: true,
            headerRowHeight: 25,
            rowHeight: 25
        };
    };

    var onConnectionChanged = function() {
        if ($rootScope.connected === false) {
            resetRowsGrid();
        }
    };

    var resetRowsGrid = function() {
        $scope.rowsColumnDefs = [];
        $scope.rowsData = [];
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustRowsPanelHeight();
        });
    };

    var adjustRowsPanelHeight = function() {
        $("#mainPanel").height($(window).height() - 76);
        $("#rowsPanel").height($(window).height() - 76);
    };

    var updateRowsColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.name,
                displayName: columnDefinition.name,
                width: Math.min(Number(columnDefinition.columnLength) * 14, 300)
            });
        }, columnDefs);
        $scope.rowsColumnDefs = columnDefs;
    };

    var updateRows = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.name] = values[index];
            });
            rows.push(row);
        });
        $scope.rowsData = rows;
    };

    var loadRows = function(tableName) {
        MySQL.client.query("SELECT * FROM " + tableName + " LIMIT 1000", function(columnDefinitions, resultsetRows) {
            $scope.safeApply(function() {
                updateRowsColumnDefs(columnDefinitions);
                updateRows(columnDefinitions, resultsetRows);
            });
        }, function(result) {
            // Never called.
        }, function(result) {
            var errorMessage = result.errorMessage;
            $scope.fatalErrorOccurred(errorMessage);
        }, function(result) {
            $scope.fatalErrorOccurred(result);
        });
    };

    $scope.initialize = function() {
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        $scope.$on("databaseSelected", function(event, database) {
            resetRowsGrid();
        });
        $scope.$on("tableSelected", function(event, tableName) {
            loadRows(tableName);
        });
        initializeRowsGrid();
        assignWindowResizeEventHandler();
        adjustRowsPanelHeight();
    };

    $scope.isObjectPanelVisible = function() {
        var visible = $rootScope.connected;
        return visible !== false;
    };

}]);
