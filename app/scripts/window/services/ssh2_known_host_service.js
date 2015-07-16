chromeMyAdmin.factory("ssh2KnownHostService", function(
    $rootScope,
    $q
) {
    "use strict";

    var lastChecked = null;

    return {
        check: function(hostName, port, method, fingerprint) {
            lastChecked = {
                hostName: hostName,
                port: port,
                method: method,
                fingerprint: fingerprint
            };
            var deferred = $q.defer();
            chrome.storage.sync.get("knownHosts", function(items) {
                var knownHosts = items.knownHosts || {};
                var key = hostName + ":" + port;
                var knownHost = knownHosts[key];
                if (knownHost) {
                    if (knownHost.method === method &&
                        knownHost.fingerprint === fingerprint) {
                        deferred.resolve({
                            result: "found"
                        });
                    } else {
                        deferred.resolve({
                            result: "not_same",
                            method: knownHost.method,
                            fingerprint: knownHost.fingerprint
                        });
                    }
                } else {
                    deferred.resolve({
                        result: "not_found"
                    });
                }
            });
            return deferred.promise;
        },
        addLastChecked: function() {
            var deferred = $q.defer();
            chrome.storage.sync.get("knownHosts", function(items) {
                var knownHosts = items.knownHosts || {};
                var key = lastChecked.hostName + ":" + lastChecked.port;
                var value = {
                    method: lastChecked.method,
                    fingerprint: lastChecked.fingerprint
                };
                knownHosts[key] = value;
                chrome.storage.sync.set({knownHosts: knownHosts}, function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        },
        getAll: function() {
            var deferred = $q.defer();
            chrome.storage.sync.get("knownHosts", function(items) {
                var knownHosts = items.knownHosts || {};
                deferred.resolve(knownHosts);
            });
            return deferred.promise;
        }
    };
});
