"use strict";

chromeMyAdmin.factory("mySQLClientService", ["$q", "$rootScope", function($q, $rootScope) {

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

    var _addQueryQueue = function(query) {
        var deferred = $q.defer();
        queryQueue.push({
            query: query,
            deferred: deferred
        });
        if (queryQueue.length === 1) {
            _query();
        }
        return deferred.promise;
    };

    var _query = function() {
        var task = queryQueue[0];
        $rootScope.showMainStatusMessage("Executing query...");
        $rootScope.showProgressBar();
        var deferred = $q.defer();
        console.log("Query: " + task.query);
        MySQL.client.query(task.query, function(columnDefinitions, resultsetRows) {
            $rootScope.showMainStatusMessage(
                "No errors. Rows count is " + resultsetRows.length);
            queryQueue.shift();
            task.deferred.resolve({
                hasResultsetRows: true,
                columnDefinitions: columnDefinitions,
                resultsetRows: resultsetRows
            });
            $rootScope.hideProgressBar();
            if (queryQueue.length > 0) {
                _query();
            }
        }, function(result) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage(
                "No errors. Affected rows count is " + result.affectedRows);
            queryQueue.shift();
            task.deferred.resolve({
                hasResultsetRows: false,
                result: result
            });
            if (queryQueue.length > 0) {
                _query();
            }
        }, function(result) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage(result.errorMessage);
            queryQueue.shift();
            task.deferred.reject(result);
            if (queryQueue.length > 0) {
                _query();
            }
        }, function(result) {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("Fatal error occurred. " + result);
            queryQueue = [];
            $rootScope.fatalErrorOccurred(result);
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
            $rootScope.showMainStatusMessage("Retrieving database list...");
            $rootScope.showProgressBar();
            var deferred = $q.defer();
            MySQL.client.getDatabases(function(databases) {
                $rootScope.hideProgressBar();
                $rootScope.showMainStatusMessage("Retrieved database list.");
                deferred.resolve(databases);
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
        },
        query: function(query) {
            return _addQueryQueue(query);
        }
    };

}]);
