chromeMyAdmin.factory("targetObjectService", ["$rootScope", "Events", function($rootScope, Events) {
    "use strict";

    var database = null;
    var table = null;

    var _changeDatabase = function(newDatabase) {
        database = newDatabase;
        if (database) {
            $rootScope.$broadcast(Events.DATABASE_CHANGED, database);
        }
    };

    var _changeTable = function(newTable) {
        table = newTable;
        $rootScope.$broadcast(Events.TABLE_CHANGED, table);
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
            $rootScope.$broadcast(Events.REQUEST_INSERT_ROW, table);
        },
        showInsertRowPanel: function(columnDefinitions) {
            $rootScope.$broadcast(Events.SHOW_INSERT_ROW_PANEL, columnDefinitions);
        }
    };

}]);
