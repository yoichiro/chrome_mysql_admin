var chromeMyAdmin = angular.module("chromeMyAdmin", ["ngGrid", "ui.ace"]);

chromeMyAdmin.run(["$rootScope", "Events", "ErrorLevel", "mySQLClientService", "$q", "UIConstants", "KeyCodes", "pingService", function($rootScope, Events, ErrorLevel, mySQLClientService, $q, UIConstants, KeyCodes, pingService) {
    "use strict";

    $rootScope.connected = false;

    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $rootScope.fatalErrorOccurred = function(errorMessage) {
        $rootScope.$broadcast(Events.SHOW_ERROR_DIALOG, {
            errorLevel: ErrorLevel.FATAL,
            reason: errorMessage
        });
    };

    $rootScope.showErrorDialog = function(message, reason) {
        $rootScope.$broadcast(Events.SHOW_ERROR_DIALOG, {
            errorLevel: ErrorLevel.ERROR,
            message: message,
            reason: reason
        });
    };

    $rootScope.showCustomErrorDialog = function(title, message, reason) {
        $rootScope.$broadcast(Events.SHOW_ERROR_DIALOG, {
            errorLevel: ErrorLevel.ERROR,
            title: title,
            message: message,
            reason: reason
        });
    };

    $rootScope.notifyConnectionChanged = function(connectionInfo) {
        $rootScope.$broadcast(Events.CONNECTION_CHANGED, connectionInfo);
    };

    $rootScope.notifyExecutingQuery = function(query) {
        $rootScope.$broadcast(Events.EXECUTING_QUERY, query);
    };

    $rootScope.notifyQueryExecuted = function() {
        $rootScope.$broadcast(Events.QUERY_EXECUTED, null);
    };

    $rootScope.showMainStatusMessage = function(message) {
        $rootScope.$broadcast(Events.SHOW_MAIN_STATUS_MESSAGE, message);
    };

    $rootScope.showProgressBar = function() {
        $rootScope.$broadcast(Events.SHOW_PROGRESS_BAR, null);
    };

    $rootScope.hideProgressBar = function() {
        $rootScope.$broadcast(Events.HIDE_PROGRESS_BAR, null);
    };

    $rootScope.callbackFromConfirmDialog = function(callbackEvent, result) {
        $rootScope.$broadcast(callbackEvent, result);
    };

    $rootScope.showConfirmDialog = function(
        message, yesButtonLabel, noButtonLabel, callbackEvent) {
        $rootScope.$broadcast(Events.SHOW_CONFIRM_DIALOG, {
            message: message,
            yesButtonLabel: yesButtonLabel,
            noButtonLabel: noButtonLabel,
            callbackEvent: callbackEvent
        });
    };

    $rootScope.showConfigurationDialog = function() {
        $rootScope.$broadcast(Events.SHOW_CONFIGURATION_DIALOG, null);
    };

    $rootScope.showQueryPanel = function(query) {
        $rootScope.$broadcast(Events.SHOW_QUERY_PANEL, {query: query});
    };

    $rootScope.login = function() {
        $rootScope.$broadcast(Events.LOGIN, null);
    };

    $rootScope.getDisplayValue = function(value) {
        if (value === null) {
            return "NULL";
        } else {
            return value;
        }
    };

    $rootScope.getDisplayValueClass = function(value) {
        if (value === null) {
            return "nullValueOnCell";
        } else {
            return "";
        }
    };

    $rootScope.onKeyUp = function($event) {
        if ($event.keyCode === KeyCodes.F5) {
            $rootScope.$broadcast(Events.REQUEST_REFRESH, null);
        }
    };

    var adjustMainPanelHeight = function() {
        $("#mainPanel").height(
            $(window).height() -
                UIConstants.WINDOW_TITLE_PANEL_HEIGHT -
                UIConstants.NAVBAR_HEIGHT -
                UIConstants.FOOTER_HEIGHT);
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustMainPanelHeight();
        });
    };

    assignWindowResizeEventHandler();
    adjustMainPanelHeight();
}]);
