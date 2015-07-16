chromeMyAdmin.factory("identityKeepService", function(
    $rootScope,
    $q
) {
    "use strict";

    var getKeyLength = function(map) {
        var len = 0;
        for (var key in map) {
            len++;
        }
        return len;
    };

    return {
        set: function(hostName, port, userName, password) {
            var deferred = $q.defer();
            chrome.storage.sync.get("identities", function(items) {
                var identities = items.identities || {};
                if (getKeyLength(identities) >= 10) {
                    var minKey = null;
                    for (var k in identities) {
                        if (minKey) {
                            var obj = identities[k];
                            var prev = identities[minKey];
                            if (obj.created < prev.created) {
                                minKey = k;
                            }
                        }
                    }
                    if (minKey) {
                        delete identities[minKey];
                    }
                }
                var key = hostName + ":" + port + ":" + userName;
                var identity = identities[key] || {};
                identity.password = password;
                identity.created = (new Date()).getTime();
                identities[key] = identity;
                chrome.storage.sync.set({identities: identities}, function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        },
        get: function(hostName, port, userName) {
            var deferred = $q.defer();
            chrome.storage.sync.get("identities", function(items) {
                var identities = items.identities || {};
                var key = hostName + ":" + port + ":" + userName;
                var result = identities[key];
                if (result) {
                    deferred.resolve(result);
                } else {
                    deferred.reject();
                }
            });
            return deferred.promise;
        }
    };

});
