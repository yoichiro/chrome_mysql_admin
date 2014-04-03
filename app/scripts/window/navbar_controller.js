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

chromeMyAdmin.controller("NavbarController", ["$scope", "mySQLClientService", "modeService", "targetObjectService", function($scope, mySQLClientService, modeService, targetObjectService) {
    "use strict";

    var loadDatabaseList = function() {
        mySQLClientService.getDatabases().then(function(databases) {
            $scope.safeApply(function() {
                $scope.selectedDatabase = "[Select database]";
                $scope.databases = databases;
                modeService.changeMode("database");
            });
        });
    };

    var onConnectionChanged = function(connectionInfo) {
        if (mySQLClientService.isConnected()) {
            $scope.safeApply(function() {
                targetObjectService.resetDatabase();
                loadDatabaseList();
                $scope.connectionInfo = connectionInfo;
                $("body").popover({
                    placement: "bottom",
                    trigger: "hover",
                    html: true,
                    content: function() {
                        var info = $scope.connectionInfo;
                        return "Server: " +
                            info.hostName + ":" + info.port + "<br />" +
                            "MySQL version: " +
                            info.initialHandshakeRequest.serverVersion;
                    },
                    container: "body",
                    selector: "[rel=\"popover\"]"
                });
            });
        }
    };

    $scope.initialize = function() {
        $scope.$on("connectionChanged", function(event, connectionInfo) {
            onConnectionChanged(connectionInfo);
        });
        $scope.selectedDatabase = "[Select database]";
    };

    $scope.isNavbarVisible = function() {
        return mySQLClientService.isConnected();
    };

    $scope.selectDatabase = function(event, database) {
        $scope.selectedDatabase = database;
        targetObjectService.changeDatabase(database);
    };

    $scope.logout = function(event) {
        $("#logoutConfirmDialog").modal("show");
    };

    $scope.isRowsActive = function() {
        return modeService.getMode() === "rows";
    };

    $scope.isStructureActive = function() {
        return modeService.getMode() === "structure";
    };

    $scope.isQueryActive = function() {
        return modeService.getMode() === "query";
    };

    $scope.isDatabaseActive = function() {
        return modeService.getMode() === "database";
    };

    $scope.selectRows = function() {
        modeService.changeMode("rows");
    };

    $scope.selectStructure = function() {
        modeService.changeMode("structure");
    };

    $scope.selectQuery = function() {
        modeService.changeMode("query");
    };

    $scope.showDatabaseInfo = function() {
        modeService.changeMode("database");
    };

}]);
