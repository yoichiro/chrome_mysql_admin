var chromeMyAdmin = angular.module("chromeMyAdmin", ["ngGrid"]);

chromeMyAdmin.run(["$rootScope", "Events", "ErrorLevel", function($rootScope, Events, ErrorLevel) {
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

    $rootScope.notifyConnectionChanged = function(connectionInfo) {
        $rootScope.$broadcast(Events.CONNECTION_CHANGED, connectionInfo);
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

    var adjustMainPanelHeight = function() {
        $("#mainPanel").height($(window).height() - 76);
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustMainPanelHeight();
        });
    };

    assignWindowResizeEventHandler();
    adjustMainPanelHeight();
}]);

chromeMyAdmin.directive("resizeWhen", function() {
    "use strict";

    return {
        restrict: "A",
        scope: false,
        link: function(scope, elem, attrs, ctrl) {
            var resizeExpr = attrs.resizeWhen;
            var listener = scope.$watch(resizeExpr, function(value) {
                if (value) {
                    elem.resize();
                    listener();
                }
            }, false);
        }
    };
});

chromeMyAdmin.directive("createTableDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/create_table_dialog.html"
    };
});

chromeMyAdmin.directive("fatalDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/fatal_dialog.html"
    };
});

chromeMyAdmin.directive("mainFooter", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/main_footer.html"
    };
});

chromeMyAdmin.directive("loginForm", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/login_form.html"
    };
});

chromeMyAdmin.directive("databasePanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/database_panel.html"
    };
});

chromeMyAdmin.directive("queryPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/query_panel.html"
    };
});

chromeMyAdmin.directive("structurePanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/structure_panel.html"
    };
});

chromeMyAdmin.directive("insertRowDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/insert_row_dialog.html"
    };
});

chromeMyAdmin.directive("rowsPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/rows_panel.html"
    };
});

chromeMyAdmin.directive("favoriteListPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/favorite_list_panel.html"
    };
});

chromeMyAdmin.directive("databaseObjectListPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/database_object_list_panel.html"
    };
});

chromeMyAdmin.directive("navbarPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/navbar_panel.html"
    };
});

chromeMyAdmin.directive("progressPanel", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/progress_panel.html"
    };
});

chromeMyAdmin.directive("confirmDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/confirm_dialog.html"
    };
});

chromeMyAdmin.directive("errorDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/error_dialog.html"
    };
});

chromeMyAdmin.directive("addColumnDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/add_column_dialog.html"
    };
});

chromeMyAdmin.directive("addIndexDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/add_index_dialog.html"
    };
});
