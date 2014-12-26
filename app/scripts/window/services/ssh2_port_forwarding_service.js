chromeMyAdmin.factory("ssh2PortForwardingService", ["$rootScope", "$q", function($rootScope, $q) {
    "use strict";

    var deferred;

    var listener = document.querySelector("#listener");
    listener.addEventListener("message", function(evt) {
        $rootScope.hideProgressBar();
        if (deferred) {
            var result = JSON.parse(evt.data);
            if (result.message === "error") {
                deferred.reject(result);
            } else {
                deferred.resolve(result);
            }
            deferred = null;
        }
    }, true);

    return {
        connect: function(ssh2ServerHostname, ssh2ServerPort) {
            $rootScope.showProgressBar();
            deferred = $q.defer();
            var module = document.querySelector("#ssh2_port_forwarding");
            var obj = {
                command: "connect",
                args: [
                    ssh2ServerHostname,
                    ssh2ServerPort
                ]
            };
            module.postMessage(JSON.stringify(obj));
            return deferred.promise;
        },
        portForwarding: function(ssh2AuthType, ssh2Username, ssh2Password, serverHostname, serverPort, privateKey) {
            $rootScope.showProgressBar();
            deferred = $q.defer();
            var module = document.querySelector("#ssh2_port_forwarding");
            var obj = {
                command: "forward",
                args: [
                    ssh2AuthType,
                    ssh2Username,
                    ssh2Password,
                    serverHostname,
                    serverPort,
                    privateKey || ""
                ]
            };
            module.postMessage(JSON.stringify(obj));
            return deferred.promise;
        }
    };

}]);
