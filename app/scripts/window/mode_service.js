"use strict";

chromeMyAdmin.factory("modeService", ["$rootScope", function($rootScope) {

    var mode = "rows";

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
