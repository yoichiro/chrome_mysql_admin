chromeMyAdmin.factory("relationService", function(
    $q,
    $rootScope,
    mySQLQueryService
) {
    "use strict";

    var parseForeignKeysFromCreateTableDdl = function(ddl) {
        var result = [];
        var lines = ddl.split("\n");
        angular.forEach(lines, function(line) {
            line = line.trim();
            if (line.indexOf("CONSTRAINT") !== -1 &&
                line.indexOf("FOREIGN KEY") !== -1) {
                var divided = divideWords(line);
                var onDelete = "";
                var onUpdate = "";
                for (var i = 0; i < divided.length; i++) {
                    if (divided[i] === "ON") {
                        var operation = divided[i + 1];
                        for (var j = i + 2; j < divided.length; j++) {
                            if (divided[j] !== "ON") {
                                if (operation === "DELETE") {
                                    onDelete += " " + divided[j];
                                } else if (operation === "UPDATE") {
                                    onUpdate += " " + divided[j];
                                }
                            } else {
                                break;
                            }
                        }
                        i = j - 1;
                    }
                }
                var constraint = {
                    name: divided[1],
                    column: divided[4].substring(1, divided[4].length - 1),
                    fkTable: divided[6],
                    fkColumn: divided[7].substring(1, divided[7].length - 1),
                    onDelete: onDelete,
                    onUpdate: onUpdate
                };
                result.push(constraint);
            }
        });
        return result;
    };

    var divideWords = function(line) {
        var inStr = false;
        var result = [];
        var tmp = "";
        for (var i = 0; i < line.length; i++) {
            var c = line.charAt(i);
            if (c === " " && !inStr) {
                result.push(tmp);
                tmp = "";
            } else if (c === "`") {
                inStr = !inStr;
            } else {
                tmp += c;
            }
        }
        if (tmp.charAt(tmp.length - 1) === ",") {
            tmp = tmp.substring(0, tmp.length - 1);
        }
        result.push(tmp);
        return result;
    };

    return {
        getRelations:  function(table) {
            var deferred = $q.defer();
            mySQLQueryService.showCreateTable(table).then(function(result) {
                var relations = parseForeignKeysFromCreateTableDdl(result.ddl);
                deferred.resolve(relations);
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        }
    };

});
