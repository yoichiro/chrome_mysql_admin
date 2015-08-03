chromeMyAdmin.factory("modeService", function(
    $rootScope,
    Events,
    Modes
) {
    "use strict";

    var mode = Modes.DATABASE;

    return {
        changeMode: function(newMode) {
            mode = newMode;
            $rootScope.$broadcast(Events.MODE_CHANGED, mode);
        },
        getMode: function() {
            return mode;
        }
    };

});
