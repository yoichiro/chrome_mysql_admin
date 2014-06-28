chromeMyAdmin.constant("UIConstants", {
    GRID_COLUMN_MAX_WIDTH: 150,
    GRID_COLUMN_FONT_SIZE: 14,
    GRID_ROW_HEIGHT: 25,
    WINDOW_TITLE_PANEL_HEIGHT: 20,
    NAVBAR_HEIGHT: 51,
    FOOTER_HEIGHT: 25
});

chromeMyAdmin.constant("Events", {
    MODE_CHANGED: "modeChanged",
    TABLE_CHANGED: "tableChanged",
    DATABASE_CHANGED: "databaseChanged",
    CONNECTION_CHANGED: "connectionChanged",
    FAVORITES_CHANGED: "favoritesChanged",
    FAVORITE_SELECTED: "favoriteSelected",
    ROWS_PAGING_CHANGED: "rowsPagingChanged",
    ROWS_SELECTION_CHANGED: "rowsSelectionChanged",
    RELATION_SELECTION_CHANGED: "relationSelectionChanged",

    SHOW_INSERT_ROW_DIALOG: "showInsertRowDialog",
    SHOW_UPDATE_ROW_DIALOG: "showUpdateRowDialog",
    SHOW_MAIN_STATUS_MESSAGE: "showMainStatusMessage",
    SHOW_PROGRESS_BAR: "showProgressBar",
    SHOW_CONFIRM_DIALOG: "showConfirmDialog",
    SHOW_ERROR_DIALOG: "showErrorDialog",
    SHOW_ADD_COLUMN_DIALOG: "showAddColumnDialog",
    SHOW_ADD_INDEX_DIALOG: "showAddIndexDialog",
    SHOW_EDIT_COLUMN_DIALOG: "showEditColumnDialog",
    SHOW_CREATE_DATABASE_DIALOG: "showCreateDatabaseDialog",
    SHOW_CONFIGURATION_DIALOG: "showConfigurationDialog",
    SHOW_QUERY_PANEL: "showQueryPanel",
    SHOW_ADD_RELATION_DIALOG: "showAddRelationDialog",

    HIDE_PROGRESS_BAR: "hideProgressBar",

    DELETE_SELECTED_ROW: "deleteSelectedRow",
    DELETE_SELECTED_COLUMN: "deleteSelectedColumn",
    DELETE_SELECTED_INDEX: "deleteSelectedIndex",
    DELETE_SELECTED_DATABASE: "deleteSelectedDatabase",
    DELETE_SELECTED_RELATION: "deleteSelectedRelation",
    DROP_SELECTED_TABLE: "dropSelectedTable",
    REQUEST_INSERT_ROW: "requestInsertRow",
    REQUEST_UPDATE_ROW: "requestUpdateRow",
    FATAL_ERROR_OCCURRED: "fatalErrorOccurred",
    REFRESH_TABLE_LIST: "refreshTableList",
    REFRESH_DATABASES: "refreshDatabases",
    REQUEST_DROP_TABLE: "requestDropTable",
    LOGOUT: "logout",
    LOGIN: "login"
});

chromeMyAdmin.constant("Modes", {
    DATABASE: "database",
    ROWS: "rows",
    STRUCTURE: "structure",
    QUERY: "query",
    INFORMATION: "information",
    RELATION: "relation"
});

chromeMyAdmin.constant("ErrorLevel", {
    FATAL: "fatal",
    ERROR: "error"
});

chromeMyAdmin.constant("TypeMap", {
    "TINYINT": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "BIT": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "BOOL": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "BOOLEAN": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "SMALLINT": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "MEDUIMINT": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "INT": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "INTEGER": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "BIGINT": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "FLOAT": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "DOUBLE": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "DECIMAL": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "DEC": {
        isString: false,
        isNumeric: true,
        isDateTime: false
    },
    "DATE": {
        isString: false,
        isNumeric: false,
        isDateTime: true
    },
    "DATETIME": {
        isString: false,
        isNumeric: false,
        isDateTime: true
    },
    "TIMESTAMP": {
        isString: false,
        isNumeric: false,
        isDateTime: true
    },
    "TIME": {
        isString: false,
        isNumeric: false,
        isDateTime: true
    },
    "YEAR": {
        isString: false,
        isNumeric: false,
        isDateTime: true
    },
    "CHAR": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "VARCHAR": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "TINYBLOB": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "TINYTEXT": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "BLOB": {
        isString: false,
        isNumeric: false,
        isDateTime: false
    },
    "TEXT": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "MEDIUMBLOB": {
        isString: false,
        isNumeric: false,
        isDateTime: false
    },
    "MEDIUMTEXT": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "LONGBLOB": {
        isString: false,
        isNumeric: false,
        isDateTime: false
    },
    "LONGTEXT": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "ENUM": {
        isString: false,
        isNumeric: false,
        isDateTime: false
    },
    "SET": {
        isString: false,
        isNumeric: false,
        isDateTime: false
    }
});

chromeMyAdmin.constant("Configurations", {
    DATABASE_INFO_AUTO_UPDATE_SPAN: "database_info_auto_update_span",
    DEFAULT_DATABASE_INFO_AUTO_UPDATE_SPAN: 30000
});

chromeMyAdmin.constant("MySQLErrorCode", {
    ACCESS_DENIED: 1227
});

chromeMyAdmin.constant("Engines", [
    "InnoDB", "MyISAM", "ARCHIVE", "MEMORY"
]);

chromeMyAdmin.constant("ValueTypes", {
    VALUE: "value",
    NULL: "NULL",
    EXPRESSION: "expression"
});

chromeMyAdmin.constant("Templates", {
    CELL_TEMPLATE: "<div class=\"ngCellText {{getDisplayValueClass(row.getProperty(col.field))}}\" title=\"{{row.getProperty(col.field)}}\">{{getDisplayValue(row.getProperty(col.field))}}</div>",
    HEADER_CELL_TEMPLATE: "<div class=\"ngHeaderSortColumn {{col.headerClass}}\" ng-style=\"{'cursor': col.cursor}\" ng-class=\"{ 'ngSorted': !noSortVisible }\"><div ng-click=\"col.sort($event)\" ng-class=\"'colt' + col.index\" class=\"ngHeaderText\" title=\"{{col.displayName}}\">{{col.displayName}}</div><div class=\"ngSortButtonDown\" ng-show=\"col.showSortButtonDown()\"></div><div class=\"ngSortButtonUp\" ng-show=\"col.showSortButtonUp()\"></div><div class=\"ngSortPriority\">{{col.sortPriority}}</div><div ng-class=\"{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }\" ng-click=\"togglePin(col)\" ng-show=\"col.pinnable\"></div></div><div ng-show=\"col.resizable\" class=\"ngHeaderGrip\" ng-click=\"col.gripClick($event)\" ng-mousedown=\"col.gripOnMouseDown($event)\"></div>"
});
