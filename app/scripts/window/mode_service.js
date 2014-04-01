"use strict";

chromeMyAdmin.factory("modeService", ["$rootScope", function($rootScope) {

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
