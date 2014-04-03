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

chromeMyAdmin.controller("DatabaseObjectListController", ["$scope", "mySQLClientService", "targetObjectService", function($scope, mySQLClientService, targetObjectService) {
    "use strict";

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustObjectListHeight();
        });
    };

    var adjustObjectListHeight = function() {
        $("#objectList").height($(window).height() - 51 - 35);
    };

    var databaseChanged = function() {
        targetObjectService.resetTable();
        mySQLClientService.query(
            "USE " + targetObjectService.getDatabase()).then(function(result) {
                if (result.hasResultsetRows) {
                    $scope.fatalErrorOccurred("Changing database failed.");
                } else {
                    loadTables();
                }
            }, function(reason) {
                var errorMessage = reason.errorMessage;
                $scope.fatalErrorOccurred(errorMessage);
            });
    };

    var loadTables = function() {
        mySQLClientService.query("SHOW TABLES").then(function(result) {
            if (result.hasResultsetRows) {
                updateTableList(
                    result.columnDefinitions,
                    result.resultsetRows);
            } else {
                $scope.fatalErrorOccurred("Retrieving tables failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateTableList = function(columnDefinition, resultsetRows) {
        var tables = [];
        for (var i = 0; i < resultsetRows.length; i++) {
            tables.push(resultsetRows[i].values[0]);
        }
        $scope.tables = tables;
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            $scope.tables = [];
        }
    };

    $scope.initialize = function() {
        $scope.$on("databaseChanged", function(event, database) {
            databaseChanged();
        });
        $scope.tables = [];
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        assignWindowResizeEventHandler();
        adjustObjectListHeight();
    };

    $scope.selectTable = function(tableName) {
        targetObjectService.changeTable(tableName);
    };

    $scope.isTableActive = function(tableName) {
        return tableName === targetObjectService.getTable();
    };

    $scope.refresh = function() {
        if (targetObjectService.getDatabase()) {
            targetObjectService.resetTable();
            loadTables();
        }
    };

    $scope.isDatabaseObjectListVisible = function() {
        return mySQLClientService.isConnected();
    };

}]);
