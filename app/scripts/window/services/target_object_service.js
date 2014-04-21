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
        _fireTableChangedEvent(table);
    };

    var _fireTableChangedEvent = function(table) {
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
        showInsertRowDialog: function(columnDefinitions) {
            $rootScope.$broadcast(Events.SHOW_INSERT_ROW_DIALOG, columnDefinitions);
        },
        reSelectTable: function() {
            _fireTableChangedEvent(table);
        },
        refreshTableList: function() {
            $rootScope.$broadcast(Events.REFRESH_TABLE_LIST, database);
        },
        requestDropSelectedTable: function() {
            $rootScope.$broadcast(Events.REQUEST_DROP_TABLE, table);
        },
        showAddColumnDialog: function() {
            $rootScope.$broadcast(Events.SHOW_ADD_COLUMN_DIALOG, table);
        }
    };

}]);
