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

chromeMyAdmin.controller("InsertRowPanelController", ["$scope", "targetObjectService", "rowsPagingService", "mySQLClientService", function($scope, targetObjectService, rowsPagingService, mySQLClientService) {
    "use strict";

    var insertRowPanelVisible = false;

    var doClose = function() {
        insertRowPanelVisible = false;
    };

    var doOpen = function(columnDefinitions) {
        resetErrorMessage();
        $scope.values = {};
        $scope.columnDefinitions = columnDefinitions;
        insertRowPanelVisible = true;
    };

    var assignEventHandlers = function() {
        $scope.$on("databaseChanged", function(event, database) {
            doClose();
        });
        $scope.$on("tableChanged", function(event, tableName) {
            doClose();
        });
        $scope.$on("showInsertRowPanel", function(event, columnDefinitions) {
            doOpen(columnDefinitions);
        });
    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
    };

    $scope.close = function() {
        doClose();
    };

    $scope.isInsertRowPanelVisible = function() {
        return insertRowPanelVisible;
    };

    $scope.targetInputColumns = function() {
        var result = [];
        angular.forEach($scope.columnDefinitions, function(column) {
            // TODO filter
            result.push(column);
        }, result);
        return result;
    };

    $scope.insertRow = function() {
        resetErrorMessage();
        var targetColumns = [];
        var targetValues = [];
        angular.forEach($scope.values, function(value, columnName) {
            if (value) {
                targetColumns.push("`" + columnName + "`");
                targetValues.push("'" + value.replace(/'/g, "\\'") + "'");
            }
        });
        if (targetColumns.length !== 0) {
            var sql = "INSERT INTO `" + targetObjectService.getTable() + "` (";
            sql += targetColumns.join(", ");
            sql += ") VALUES (";
            sql += targetValues.join(", ");
            sql += ")";
            mySQLClientService.query(sql).then(function(result) {
                if (result.hasResultsetRows) {
                    $scope.fatalErrorOccurred("Inserting row failed.");
                } else {
                    doClose();
                    rowsPagingService.refresh();
                }
            }, function(reason) {
                var errorMessage = "[Error code:" + reason.errorCode;
                errorMessage += " SQL state:" + reason.sqlState;
                errorMessage += "] ";
                errorMessage += reason.errorMessage;
                $scope.errorMessage = errorMessage;
            });
        } else {
            $scope.errorMessage = "Any values not filled in.";
        }
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

}]);
