"use strict";

chromeMyAdmin.factory("targetObjectService", ["$rootScope", function($rootScope) {

    var database = null;
    var table = null;

    var _changeDatabase = function(newDatabase) {
        database = newDatabase;
        if (database) {
            $rootScope.$broadcast("databaseChanged", database);
        }
    };

    var _changeTable = function(newTable) {
        table = newTable;
        $rootScope.$broadcast("tableChanged", table);
    };

    return {
        changeDatabase: function(newDatabase) {
            _changeDatabase(newDatabase);
        },
        resetDatabase: function() {
            _changeDatabase(null);
        },
        getDatabase: function() {
            return database;
        },
        changeTable: function(newTable) {
            _changeTable(newTable);
        },
        resetTable: function() {
            _changeTable(null);
        },
        getTable: function() {
            return table;
        },
        requestInsertRow: function() {
            $rootScope.$broadcast("requestInsertRow", table);
        },
        showInsertRowPanel: function(columnDefinitions) {
            $rootScope.$broadcast("showInsertRowPanel", columnDefinitions);
        }
    };

}]);
