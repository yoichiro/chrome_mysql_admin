chromeMyAdmin.constant("UIConstants", {
    GRID_COLUMN_MAX_WIDTH: 150,
    GRID_COLUMN_FONT_SIZE: 14,
    GRID_ROW_HEIGHT: 25,

    DATABASE_INFO_AUTO_UPDATE_SPAN: 10000,

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

    SHOW_INSERT_ROW_DIALOG: "showInsertRowDialog",
    SHOW_MAIN_STATUS_MESSAGE: "showMainStatusMessage",
    SHOW_PROGRESS_BAR: "showProgressBar",
    SHOW_CONFIRM_DIALOG: "showConfirmDialog",
    SHOW_ERROR_DIALOG: "showErrorDialog",
    SHOW_ADD_COLUMN_DIALOG: "showAddColumnDialog",

    HIDE_PROGRESS_BAR: "hideProgressBar",

    DELETE_SELECTED_ROW: "deleteSelectedRow",
    DELETE_SELECTED_COLUMN: "deleteSelectedColumn",
    DROP_SELECTED_TABLE: "dropSelectedTable",
    REQUEST_INSERT_ROW: "requestInsertRow",
    FATAL_ERROR_OCCURRED: "fatalErrorOccurred",
    REFRESH_TABLE_LIST: "refreshTableList",
    REQUEST_DROP_TABLE: "requestDropTable",
    LOGOUT: "logout"
});

chromeMyAdmin.constant("Modes", {
    DATABASE: "database",
    ROWS: "rows",
    STRUCTURE: "structure",
    QUERY: "query"
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
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "TEXT": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "MEDIUMBLOB": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "MEDIUMTEXT": {
        isString: true,
        isNumeric: false,
        isDateTime: false
    },
    "LONGBLOB": {
        isString: true,
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
