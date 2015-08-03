chromeMyAdmin.factory("mySQLQueryService", function(
    $q,
    $rootScope,
    mySQLClientService
) {
    "use strict";

    return {
        showCharacterSet: function() {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW CHARACTER SET").then(function(result) {
                if (result.hasResultsetRows) {
                    if (result.resultsetRows.length > 0) {
                        deferred.resolve(result);
                    } else {
                        deferred.reject("No character set.");
                    }
                } else {
                    deferred.reject("Fetching character set failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showCollations: function() {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW COLLATION").then(function(result) {
                if (result.hasResultsetRows) {
                    if (result.resultsetRows.length > 0) {
                        deferred.resolve(result);
                    } else {
                        deferred.reject("No collation.");
                    }
                } else {
                    deferred.reject("Fetching collations failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        useDatabase: function(database) {
            var deferred = $q.defer();
            mySQLClientService.query("USE `" + database + "`").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.reject("Changing database failed.");
                } else {
                    deferred.resolve();
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showTables: function() {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW /*!50002 FULL*/ TABLES").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.resolve(result);
                } else {
                    deferred.reject("Retrieving tables failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;

        },
        showCreateTable: function(table) {
            var deferred = $q.defer();
            var sql = "SHOW CREATE TABLE `" + table + "`";
            mySQLClientService.query(sql).then(function(result) {
                if (result.hasResultsetRows) {
                    var resultsetRows = result.resultsetRows;
                    if (resultsetRows && resultsetRows.length == 1) {
                        var row = resultsetRows[0];
                        var ddl = row.values[1];
                        deferred.resolve({
                            row: row,
                            ddl: ddl
                        });
                    } else {
                        deferred.reject("Retrieving create table DDL failed.");
                    }
                } else {
                    deferred.reject("Retrieving create table DDL failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showTableStatus: function(table) {
            var deferred = $q.defer();
            var sql = "SHOW TABLE STATUS LIKE '" + table + "'";
            mySQLClientService.query(sql).then(function(result) {
                if (result.hasResultsetRows) {
                    var resultsetRows = result.resultsetRows;
                    if (resultsetRows && resultsetRows.length == 1) {
                        deferred.resolve(result);
                    } else {
                        deferred.reject("Retrieving table status failed.");
                    }
                } else {
                    deferred.reject("Retrieving table status failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showFullColumns: function(table) {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW FULL COLUMNS FROM `" + table + "`").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.resolve(result);
                } else {
                    deferred.reject("Retrieving full columns failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showIndex: function(table) {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW INDEX FROM `" + table + "`").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.resolve(result);
                } else {
                    deferred.reject("Retrieving index failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showProcedureStatus: function(database) {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW PROCEDURE STATUS WHERE db = '" + database + "'").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.resolve(result);
                } else {
                    deferred.reject("Retrieving procedures failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showFunctionStatus: function(database) {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW FUNCTION STATUS WHERE db = '" + database + "'").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.resolve(result);
                } else {
                    deferred.reject("Retrieving functions failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showCreateRoutine: function(database, routineName, routineType) {
            var deferred = $q.defer();
            mySQLClientService.query("SHOW CREATE " + routineType + " `" + database + "`.`" + routineName + "`").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.resolve(result);
                } else {
                    deferred.reject("Retrieving routine code failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        showGlobalStatus: function() {
            var deferred = $q.defer();
            mySQLClientService.queryWithoutProgressBar("SHOW GLOBAL STATUS").then(function(result) {
                if (result.hasResultsetRows) {
                    deferred.resolve(result);
                } else {
                    deferred.reject("Retrieving status failed.");
                }
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        }
    };

});
