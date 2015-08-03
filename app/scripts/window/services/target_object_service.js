chromeMyAdmin.factory("targetObjectService", function(
    $rootScope,
    Events
) {
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
        requestUpdateRow: function() {
            $rootScope.$broadcast(Events.REQUEST_UPDATE_ROW, table);
        },
        showInsertRowDialog: function(columnDefinitions) {
            $rootScope.$broadcast(Events.SHOW_INSERT_ROW_DIALOG, columnDefinitions);
        },
        showUpdateRowDialog: function(data) {
            $rootScope.$broadcast(Events.SHOW_UPDATE_ROW_DIALOG, data);
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
        },
        showAddIndexDialog: function(columnNames) {
            $rootScope.$broadcast(Events.SHOW_ADD_INDEX_DIALOG, {
                table: table,
                columns: columnNames
            });
        },
        showEditColumnDialog: function(columnDefs, columnStructure) {
            $rootScope.$broadcast(Events.SHOW_EDIT_COLUMN_DIALOG, {
                table: table,
                columnDefs: columnDefs,
                columnStructure: columnStructure
            });
        },
        showCreateDatabaseDialog: function() {
            $rootScope.$broadcast(Events.SHOW_CREATE_DATABASE_DIALOG, null);
        },
        refreshDatabases: function() {
            $rootScope.$broadcast(Events.REFRESH_DATABASES, null);
        },
        showAddRelationDialog: function(table) {
            $rootScope.$broadcast(Events.SHOW_ADD_RELATION_DIALOG, {
                table: table
            });
        },
        refreshProceduresFunctions: function() {
            $rootScope.$broadcast(Events.REFRESH_PROCEDURES_FUNCTIONS, null);
        },
        refreshErDiagram: function() {
            $rootScope.$broadcast(Events.REFRESH_ER_DIAGRAM, null);
        },
        saveErDiagramImage: function() {
            $rootScope.$broadcast(Events.SAVE_ER_DIAGRAM_IMAGE, null);
        },
        exportAllDatabases: function() {
            $rootScope.$broadcast(Events.EXPORT_ALL_DATABASES, null);
        }
    };

});
