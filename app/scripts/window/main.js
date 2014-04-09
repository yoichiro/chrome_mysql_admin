var chromeMyAdmin = angular.module("chromeMyAdmin", ["ngGrid"]);

chromeMyAdmin.run(["$rootScope", "Events", function($rootScope, Events) {
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
        $rootScope.$broadcast(Events.FATAL_ERROR_OCCURRED, errorMessage);
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
