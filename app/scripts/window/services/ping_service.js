chromeMyAdmin.factory("pingService", function(
    $rootScope,
    Events,
    $timeout,
    mySQLClientService,
    Configurations
) {
    "use strict";

    var autoPingPromise = null;

    var ping = function() {
        mySQLClientService.ping().then(function() {
            startTimer();
        }, function(reason) {
            $rootScope.fatalErrorOccurred("MySQL server connection lost.");
        });
    };

    var startTimer = function() {
        autoPingPromise = $timeout(ping, Configurations.DEFAULT_PING_SPAN);
    };

    $rootScope.$on(Events.CONNECTION_CHANGED, function(event, data) {
        if (mySQLClientService.isConnected()) {
            startTimer();
        } else {
            $timeout.cancel(autoPingPromise);
        }
    });

    return {
    };
});
