chromeMyAdmin.factory("mySQLClientService", function(
    $q,
    $rootScope
) {
    "use strict";

    var mySQLClient = new MySQL.Client();
    mySQLClient.setSocketImpl(new MySQL.ChromeSocket2());

    var queryQueue = [];
    var queryHistory = [];

    var _logout = function() {
        $rootScope.showMainStatusMessage("Logging out from MySQL server...");
        $rootScope.showProgressBar();
        var deferred = $q.defer();
        $rootScope.notifyExecutingQuery("Logging out from MySQL server.");
        mySQLClient.logout(function() {
            $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("Logged out from MySQL server.");
            queryQueue = [];
            deferred.resolve();
        });
        return deferred.promise;
    };

    var _addQueryQueue = function(type, query) {
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
            return _doQuery(task, true);
        } else if (task.type === "queryWithoutProgressBar") {
            return _doQuery(task, false);
        } else if (task.type === "getDatabases") {
            return _getDatabases(task);
        } else if (task.type === "getStatistics") {
            return _getStatistics(task);
        } else if (task.type === "ping") {
            return _doPing(task);
        } else {
            $rootScope.fatalErrorOccurred("Unknown query type: " + task.type);
            return null;
        }
    };

    var _addQueryHistory = function(query) {
        $rootScope.safeApply(function() {
            for (var i = 0; i < queryHistory.length; i++) {
                if (queryHistory[i] === query) {
                    queryHistory.splice(i, 1);
                    break;
                }
            }
            queryHistory.unshift(query);
        });
    };

    var _doQuery = function(task, showProgressBar) {
        if (showProgressBar) {
            $rootScope.showMainStatusMessage("Executing query...");
            $rootScope.showProgressBar();
        }
        var deferred = $q.defer();
        console.log("Query: " + task.query);
        _addQueryHistory(task.query);
        $rootScope.notifyExecutingQuery(task.query);
        mySQLClient.query(task.query, function(columnDefinitions, resultsetRows) {
            $rootScope.showMainStatusMessage(
                "No errors. Rows count is " + resultsetRows.length);
            queryQueue.shift();
            var remaining = queryQueue.length;
            task.deferred.resolve({
                hasResultsetRows: true,
                columnDefinitions: columnDefinitions,
                resultsetRows: resultsetRows
            });
            if (showProgressBar) {
                $rootScope.hideProgressBar();
            }
            if (remaining > 0) {
                _consumeQuery();
            }
        }, function(result) {
            if (showProgressBar) {
                $rootScope.hideProgressBar();
            }
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
            if (showProgressBar) {
                $rootScope.hideProgressBar();
            }
            $rootScope.showMainStatusMessage(result.errorMessage);
            queryQueue.shift();
            var remaining = queryQueue.length;
            task.deferred.reject(result);
            if (remaining > 0) {
                _consumeQuery();
            }
        }, function(result) {
            if (showProgressBar) {
                $rootScope.hideProgressBar();
            }
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
        $rootScope.notifyExecutingQuery("Retrieving database list.");
        mySQLClient.getDatabases(function(databases) {
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
        $rootScope.notifyExecutingQuery("Retrieving statistics.");
        mySQLClient.getStatistics(function(statistics) {
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

    var _doPing = function(task) {
        $rootScope.showMainStatusMessage("Ping...");
        // $rootScope.showProgressBar();
        var deferred = $q.defer();
        console.log("Ping");
        $rootScope.notifyExecutingQuery("Ping.");
        mySQLClient.ping(function(result) {
            // $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("");
            if (result.isSuccess()) {
                queryQueue.shift();
                var remaining = queryQueue.length;
                task.deferred.resolve();
                if (remaining > 0) {
                    _consumeQuery();
                }
            } else {
                _logout();
                deferred.reject("Fatal error: Ping failed (Server returned error).");
            }
        }, function() {
            // $rootScope.hideProgressBar();
            $rootScope.showMainStatusMessage("");
            $rootScope.fatalErrorOccurred(
                "Fatal error: Ping failed.");
        });
        return deferred.promise;
    };

    return {
        isConnected: function() {
            return mySQLClient.isConnected();
        },
        login: function(hostName, portNumber, userName, password) {
            $rootScope.showMainStatusMessage("Logging in to MySQL server...");
            $rootScope.showProgressBar();
            var deferred = $q.defer();
            $rootScope.notifyExecutingQuery("Logging in to MySQL server.");
            mySQLClient.login(
                hostName,
                Number(portNumber),
                userName,
                password,
                false,
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
        loginWithSSL: function(hostName, portNumber, userName, password, ca, checkCN) {
            $rootScope.showMainStatusMessage("Logging in to MySQL server with SSL...");
            $rootScope.showProgressBar();
            var deferred = $q.defer();
            $rootScope.notifyExecutingQuery("Logging in to MySQL server with SSL.");
            mySQLClient.loginWithSSL(
                hostName,
                Number(portNumber),
                userName,
                password,
                false,
                ca,
                checkCN,
                function(initialHandshakeRequest, result) {
                    $rootScope.hideProgressBar();
                    if (result.isSuccess()) {
                        $rootScope.showMainStatusMessage("Logged in to MySQL server with SSL.");
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
        queryWithoutProgressBar: function(query) {
            return _addQueryQueue("queryWithoutProgressBar", query);
        },
        getStatistics: function() {
            return _addQueryQueue("getStatistics", null);
        },
        getQueryHistory: function() {
            return queryHistory;
        },
        ping: function() {
            return _addQueryQueue("ping", null);
        }
    };

});
