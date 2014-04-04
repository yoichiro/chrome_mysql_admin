chromeMyAdmin.factory("modeService", ["$rootScope", function($rootScope) {
    "use strict";

    var mode = "database";

    return {
        changeMode: function(newMode) {
            mode = newMode;
            $rootScope.$broadcast("modeChanged", mode);
        },
        getMode: function() {
            return mode;
        }
    };

}]);
