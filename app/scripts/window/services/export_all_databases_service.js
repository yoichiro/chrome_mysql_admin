chromeMyAdmin.factory("exportAllDatabasesService", function(
    $rootScope,
    $q,
    Events,
    mySQLClientService,
    mySQLQueryService,
    $filter,
    typeService,
    sqlExpressionService,
    TableTypes
) {
    "use strict";

    var connectionInfo;

    $rootScope.$on(Events.CONNECTION_CHANGED, function(event, info) {
        connectionInfo = info;
    });

    var createHeader = function() {
        var result = [];
        var manifest = chrome.runtime.getManifest();
        var aboutMe = manifest.name + " version " + manifest.version;
        result.push("-- " + aboutMe);
        result.push("--");
        result.push("-- Host: " + connectionInfo.hostName);
        result.push("-- ------------------------------------------------------");
        result.push("-- Server version " + connectionInfo.initialHandshakeRequest.serverVersion);
        result.push("");
        result.push("/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;");
        result.push("/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;");
        result.push("/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;");
        result.push("/*!40101 SET NAMES utf8 */;");
        result.push("/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;");
        result.push("/*!40103 SET TIME_ZONE='+00:00' */;");
        result.push("/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;");
        result.push("/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;");
        result.push("/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;");
        result.push("/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;");
        return result.join("\n");
    };

    var createFooter = function() {
        var result = [];
        result.push("/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;");
        result.push("/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;");
        result.push("/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;");
        result.push("/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;");
        result.push("/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;");
        result.push("/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;");
        result.push("/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;");
        result.push("/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;");
        result.push("");
        var now = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss");
        result.push("-- Dump completed on " + now);
        return result.join("\n");
    };

    var getDatabases = function() {
        var deferred = $q.defer();
        mySQLClientService.getDatabases().then(function(databases) {
            var result = [];
            angular.forEach(databases, function(database) {
                if ((database !== "information_schema") && (database !== "performance_schema")) {
                    this.push(database);
                }
            }, result);
            deferred.resolve(result);
        }, function(reason) {
            deferred.reject(reason);
        });
        return deferred.promise;
    };

    var getCreateDatabaseStatements = function(databases) {
        var deferred = $q.defer();
        loadCreateDatabase(databases, 0, [], deferred);
        return deferred.promise;
    };

    var loadCreateDatabase = function(databases, index, results, deferred) {
        if (index === databases.length) {
            deferred.resolve(results);
        } else {
            var database = databases[index];
            var sql = "SHOW CREATE DATABASE `" + database + "`";
            mySQLClientService.query(sql).then(function(result) {
                results.push({
                    databaseName: result.resultsetRows[0].values[0],
                    createStatement: result.resultsetRows[0].values[1]
                });
                loadCreateDatabase(databases, ++index, results, deferred);
            }, function(reason) {
                deferred.reject(reason);
            });
        }
    };

    var createCreateDatabases = function(databases) {
        var result = [];
        angular.forEach(databases, function(database) {
            var lines = [];
            lines.push("--");
            lines.push("-- Current Database: `" + database.databaseName + "`");
            lines.push("--");
            lines.push("");
            var stmt = database.createStatement;
            lines.push(stmt.substring(0, 15) + " /*!32312 IF NOT EXISTS*/ " + stmt.substring(16) + ";");
            lines.push("");
            lines.push("use `" + database.databaseName + "`;");
            this.push({
                databaseName: database.databaseName,
                createStatement: lines.join("\n"),
                tables: []
            });
        }, result);
        return result;
    };

    var getTables = function(databases) {
        var deferred = $q.defer();
        loadTables(databases, 0, deferred);
        return deferred.promise;
    };

    var loadTables = function(databases, index, deferred) {
        if (index === databases.length) {
            deferred.resolve(databases);
        } else {
            var database = databases[index];
            mySQLQueryService.useDatabase(database.databaseName).then(function() {
                return mySQLQueryService.showTables();
            }).then(function(result) {
                var resultsetRows = result.resultsetRows;
                angular.forEach(resultsetRows, function(row) {
                    if (row.values[1] === TableTypes.BASE_TABLE) {
                        database.tables.push({
                            tableName: row.values[0],
                            tableType: row.values[1]
                        });
                    } else if (row.values[1] === TableTypes.VIEW) {
                        database.tables.push({
                            tableName: row.values[0],
                            tableType: row.values[1]
                        });
                    }
                });
                getCreateTableStatement(database.tables).then(function(result) {
                    return getDumpData(database.tables);
                }).then(function(result) {
                    loadTables(databases, ++index, deferred);
                }, function(reason) {
                    deferred.reject(reason);
                });
            }, function(reason) {
                deferred.reject(reason);
            });
        }
    };

    var getCreateTableStatement = function(tables) {
        var deferred = $q.defer();
        loadCreateTableStatement(tables, 0, deferred);
        return deferred.promise;
    };

    var loadCreateTableStatement = function(tables, index, deferred) {
        if (index == tables.length) {
            deferred.resolve(tables);
        } else {
            var table = tables[index];
            mySQLQueryService.showCreateTable(table.tableName).then(function(result) {
                if (table.tableType === TableTypes.BASE_TABLE) {
                    table["createStatement"] = createCreateTable(table.tableName, result.ddl);
                } else if (table.tableType === TableTypes.VIEW) {
                    table["createStatement"] = createCreateView(table.tableName, result.ddl);
                }
                loadCreateTableStatement(tables, ++index, deferred);
            }, function(reason) {
                deferred.reject(reason);
            });
        }
    };

    var getDumpData = function(tables) {
        var deferred = $q.defer();
        loadDumpData(tables, 0, deferred);
        return deferred.promise;
    };

    var loadDumpData = function(tables, index, deferred) {
        if (index == tables.length) {
            deferred.resolve(tables);
        } else {
            var table = tables[index];
            if (table.tableType === TableTypes.BASE_TABLE) {
                var columns = null;
                mySQLQueryService.showFullColumns(table.tableName).then(function(result) {
                    columns = result.resultsetRows;
                    var sql = "SELECT * FROM `" + table.tableName + "`";
                    return mySQLClientService.query(sql);
                }).then(function(result) {
                    var insert = "INSERT INTO `" + table.tableName + "` VALUES ";
                    var resultsetRows = result.resultsetRows;
                    if (resultsetRows.length > 0) {
                        var rows = [];
                        angular.forEach(resultsetRows, function(row) {
                            var values = [];
                            angular.forEach(columns, function(column, index) {
                                var typeName = getTypeName(column.values[1]);
                                var value = row.values[index];
                                if (value != null) {
                                    if (typeService.isNumeric(typeName)) {
                                        values.push(value);
                                    } else {
                                        values.push("'" + sqlExpressionService.replaceValue(value).replace(/\n/g, "\\n") + "'");
                                    }
                                } else {
                                    values.push("NULL");
                                }
                            });
                            rows.push("(" + values.join(",") + ")");
                        });
                        insert += rows.join(",");
                        insert += ";";
                        table["dumpData"] = createDumpData(table, insert);
                    } else {
                        table["dumpData"] = createDumpData(table, null);
                    }
                    loadDumpData(tables, ++index, deferred);
                }, function(reason) {
                    deferred.reject(reason);
                });
            } else {
                loadDumpData(tables, ++index, deferred);
            }
        }
    };

    var getTypeName = function(type) {
        var result = "";
        var b = type.indexOf("(");
        var s = type.indexOf(" ");
        if (b !== -1) {
            result = type.substring(0, b);
        } else if (s !== -1) {
            result = type.substring(0, s);
        } else {
            result = type;
        }
        return result.toUpperCase();
    };

    var createCreateTable = function(table, ddl) {
        var result = [];
        result.push("--");
        result.push("-- Table structure for table `" + table + "`");
        result.push("--");
        result.push("");
        result.push("DROP TABLE IF EXISTS `" + table + "`;");
        result.push("/*!40101 SET @saved_cs_client     = @@character_set_client */;");
        result.push("/*!40101 SET character_set_client = utf8 */;");
        result.push(ddl + ";");
        result.push("/*!40101 SET character_set_client = @saved_cs_client */;");
        return result.join("\n");
    };

    var createCreateView = function(table, ddl) {
        var result = [];
        result.push("--");
        result.push("-- View structure for view `" + table + "`");
        result.push("--");
        result.push("");
        result.push("DROP VIEW IF EXISTS `" + table + "`;");
        result.push("/*!40101 SET @saved_cs_client     = @@character_set_client */;");
        result.push("/*!40101 SET character_set_client = utf8 */;");
        result.push(ddl + ";");
        result.push("/*!40101 SET character_set_client = @saved_cs_client */;");
        return result.join("\n");
    };

    var createDumpData = function(table, insert) {
        var result = [];
        result.push("--");
        result.push("-- Dumping data for table `" + table.tableName + "`");
        result.push("--");
        result.push("");
        result.push("LOCK TABLES `" + table.tableName + "` WRITE;");
        result.push("/*!40000 ALTER TABLE `" + table.tableName + "` DISABLE KEYS */;");
        if (insert) {
            result.push(insert);
        }
        result.push("/*!40000 ALTER TABLE `" + table.tableName + "` ENABLE KEYS */;");
        result.push("UNLOCK TABLES;");
        return result.join("\n");
    };

    return {
        exportAllDatabases: function() {
            var deferred = $q.defer();
            var header = createHeader();
            var footer = createFooter();
            getDatabases().then(function(databases) {
                return getCreateDatabaseStatements(databases);
            }).then(function(result) {
                var databases = createCreateDatabases(result);
                return getTables(databases);
            }).then(function(result) {
                var array = [];
                array.push(header);
                array.push("\n\n");
                angular.forEach(result, function(database) {
                    array.push(database.createStatement);
                    array.push("\n\n");
                    angular.forEach(database.tables, function(table) {
                        array.push(table.createStatement);
                        array.push("\n\n");
                        if (table.tableType === TableTypes.BASE_TABLE) {
                            array.push(table.dumpData);
                            array.push("\n\n");
                        }
                    });
                });
                array.push(footer);
                deferred.resolve(new Blob(array, {type: "text/plain"}));
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        }
    };
});
