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

chromeMyAdmin.factory("mySQLClientService", ["$q", "$rootScope", function($q, $rootScope) {
    "use strict";

    MySQL.communication.setSocketImpl(new MySQL.ChromeSocket());

    var queryQueue = [];

    var _logout = function() {
        $rootScope.showMainStatusMessage("Logging out from MySQL server...");
        $rootScope.showProgressBar();
        var deferred = $q.defer();
        MySQL.client.logout(function() {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("Logged out from MySQL server.");
            deferred.resolve();
        });
        return deferred.promise;
    };

    var _addQueryQueue = function(type, query) {
        console.log("Add query to queue: " + type + " (" + query + ")");
        var deferred = $q.defer();
        queryQueue.push({
            type: type,
            query: query,
            deferred: deferred
        });
        if (queryQueue.length === 1) {
            _consumeQuery();
        }
        return deferred.promise;
    };

    var _consumeQuery = function() {
        var task = queryQueue[0];
        if (task.type === "query") {
            return _doQuery(task);
        } else if (task.type === "getDatabases") {
            return _getDatabases(task);
        } else if (task.type === "getStatistics") {
            return _getStatistics(task);
        } else {
            $rootScope.fatalErrorOccurred("Unknown query type: " + task.type);
            return null;
        }
    };

    var _doQuery = function(task) {
        $rootScope.showMainStatusMessage("Executing query...");
        $rootScope.showProgressBar();
        var deferred = $q.defer();
        console.log("Query: " + task.query);
        MySQL.client.query(task.query, function(columnDefinitions, resultsetRows) {
            $rootScope.showMainStatusMessage(
                "No errors. Rows count is " + resultsetRows.length);
            queryQueue.shift();
            var remaining = queryQueue.length;
            task.deferred.resolve({
                hasResultsetRows: true,
                columnDefinitions: columnDefinitions,
                resultsetRows: resultsetRows
            });
            $rootScope.hideProgressBar();
            if (remaining > 0) {
                _consumeQuery();
            }
        }, function(result) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage(
                "No errors. Affected rows count is " + result.affectedRows);
            queryQueue.shift();
            var remaining = queryQueue.length;
            task.deferred.resolve({
                hasResultsetRows: false,
                result: result
            });
            if (remaining > 0) {
                _consumeQuery();
            }
        }, function(result) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage(result.errorMessage);
            queryQueue.shift();
            var remaining = queryQueue.length;
            task.deferred.reject(result);
            if (remaining > 0) {
                _consumeQuery();
            }
        }, function(result) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("Fatal error occurred. " + result);
            queryQueue = [];
            $rootScope.fatalErrorOccurred(result);
        });
        return deferred.promise;
    };

    var _getDatabases = function(task) {
        $rootScope.showMainStatusMessage("Retrieving database list...");
        $rootScope.showProgressBar();
        var deferred = $q.defer();
        console.log("Get databases");
        MySQL.client.getDatabases(function(databases) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("Retrieved database list.");
            queryQueue.shift();
            var remaining = queryQueue.length;
            task.deferred.resolve(databases);
            if (remaining > 0) {
                _consumeQuery();
            }
        }, function(result) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("");
            $rootScope.fatalErrorOccurred(result);
        }, function() {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("");
            $rootScope.fatalErrorOccurred(
                "Fatal error: Retrieving database list failed.");
        });
        return deferred.promise;
    };

    var _getStatistics = function(task) {
        $rootScope.showMainStatusMessage("Retrieving statistics...");
        $rootScope.showProgressBar();
        var deferred = $q.defer();
        console.log("Get statistics");
        MySQL.client.getStatistics(function(statistics) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("Retrieved statistics.");
            queryQueue.shift();
            var remaining = queryQueue.length;
            task.deferred.resolve(statistics);
            if (remaining > 0) {
                _consumeQuery();
            }
        }, function() {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("");
            $rootScope.fatalErrorOccurred(
                "Fatal error: Retrieving statistics failed.");
        });
        return deferred.promise;
    };

    return {
        isConnected: function() {
            return MySQL.communication.isConnected();
        },
        login: function(hostName, portNumber, userName, password) {
            $rootScope.showMainStatusMessage("Logging in to MySQL server...");
            $rootScope.showProgressBar();
            var deferred = $q.defer();
            MySQL.client.login(
                hostName,
                Number(portNumber),
                userName,
                password,
                function(initialHandshakeRequest, result) {
                    $rootScope.hideProgressBar();
                    if (result.isSuccess()) {
                        $rootScope.showMainStatusMessage("Logged in to MySQL server.");
                        deferred.resolve(initialHandshakeRequest);
                    } else {
                        _logout();
                        deferred.reject(result.errorMessage);
                    }
                }, function(errorCode) {
                    $rootScope.hideProgressBar();
                    $rootScope.showMainStatusMessage("");
                    deferred.reject(errorCode);
                }, function(result) {
                    $rootScope.hideProgressBar();
                    $rootScope.showMainStatusMessage("");
                    deferred.reject(result);
                }
            );
            return deferred.promise;
        },
        logout: function() {
            return _logout();
        },
        getDatabases: function() {
            return _addQueryQueue("getDatabases", null);
        },
        query: function(query) {
            return _addQueryQueue("query", query);
        },
        getStatistics: function() {
            return _addQueryQueue("getStatistics", null);
        }
    };

}]);
