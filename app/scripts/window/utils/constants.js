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

    SHOW_INSERT_ROW_PANEL: "showInsertRowPanel",
    SHOW_MAIN_STATUS_MESSAGE: "showMainStatusMessage",
    SHOW_PROGRESS_BAR: "showProgressBar",
    HIDE_PROGRESS_BAR: "hideProgressBar",
    CONFIRM_DELETE_SELECTED_ROW: "confirmDeleteSelectedRow",
    REQUEST_DELETE_SELECTED_ROW: "requestDeleteSelectedRow",
    REQUEST_INSERT_ROW: "requestInsertRow",
    FATAL_ERROR_OCCURRED: "fatalErrorOccurred",
    REFRESH_TABLE_LIST: "refreshTableList"
});

chromeMyAdmin.constant("Modes", {
    DATABASE: "database",
    ROWS: "rows",
    STRUCTURE: "structure",
    QUERY: "query"
});
