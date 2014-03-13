"use strict";

var chromeMyAdmin = angular.module("chromeMyAdmin", ["ngGrid"]);

chromeMyAdmin.run(function($rootScope) {

    $rootScope.connected = false;

    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $rootScope.fatalErrorOccurred = function(errorMessage) {
        $rootScope.$broadcast("fatalErrorOccurred", errorMessage);
    };

});

chromeMyAdmin.controller("DatabaseObjectListController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    var databaseSelected = function(database) {
        $scope.selectedDatabase = database;
        MySQL.client.query("USE " + database, function(columnDefinitions, resultsetRows) {
            // Never called.
        }, function(result) {
            if (result.isSuccess()) {
                loadTables();
            } else {
                $scope.fatalErrorOccurred("Using database [" + database + "] failed.");
            }
        }, function(result) {
            var errorMessage = result.errorMessage;
            $scope.fatalErrorOccurred(errorMessage);
        }, function(result) {
            $scope.fatalErrorOccurred(result);
        });
    };

    var loadTables = function() {
        console.log("loadTables");
        MySQL.client.query("SHOW TABLES", function(columnDefinitions, resultsetRows) {
            $scope.safeApply(function() {
                updateTableList(columnDefinitions, resultsetRows);
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

    var updateTableList = function(columnDefinition, resultsetRows) {
        console.log("updateTableList");
        var tables = [];
        for (var i = 0; i < resultsetRows.length; i++) {
            tables.push(resultsetRows[i].values[0]);
        }
        $scope.tables = tables;
    };

    var onConnectionChanged = function() {
        if ($rootScope.connected === false) {
            $scope.tables = [];
        }
    };

    $scope.initialize = function() {
        $scope.$on("databaseSelected", function(event, database) {
            console.log("databaseSelected");
            databaseSelected(database);
        });
        $scope.tables = [];
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
    };

    $scope.selectTable = function(tableName) {
        $rootScope.$broadcast("tableSelected", tableName);
    };

}]);

chromeMyAdmin.controller("LogoutConfirmDialogController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    $scope.logout = function() {
        console.log("logout");
        $("#logoutConfirmDialog").modal("hide");
        MySQL.client.logout(function() {
            $scope.safeApply(function() {
                $rootScope.connected = false;
                $rootScope.$broadcast("connectionChanged", null);
            });
        });
    };

}]);

chromeMyAdmin.controller("FatalDialogController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    $scope.initialize = function() {
        $("#fatalDialog").on("hidden.bs.modal", function() {
            MySQL.client.logout(function() {
                $scope.safeApply(function() {
                    $rootScope.connected = false;
                    $rootScope.$broadcast("connectionChanged", null);
                });
            });
        });
        $scope.$on("fatalErrorOccurred", function(event, errorMessage) {
            $scope.safeApply(function() {
                $scope.reason = errorMessage;
                $("#fatalDialog").modal("show");
            });
        });
    };

}]);

chromeMyAdmin.controller("DatabaseObjectController", ["$scope", "$rootScope",  function($scope, $rootScope) {

    var initializeRowsGrid = function() {
        resetRowsGrid();
        $scope.rowsGrid = {
            data: "rowsData",
            columnDefs: "rowsColumnDefs"
        };
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
        $("#rowsPanel").height($(window).height() - 55);
    };

    var updateRowsColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({field: columnDefinition.name, displayName: columnDefinition.name});
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
