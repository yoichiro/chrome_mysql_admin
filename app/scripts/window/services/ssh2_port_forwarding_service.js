chromeMyAdmin.factory("ssh2PortForwardingService", ["$rootScope", "$q", function($rootScope, $q) {
    "use strict";

    var deferred;

    var listener = document.querySelector("#listener");
    listener.addEventListener("message", function(evt) {
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

    var errorHandler = function(e, deferred) {
        var msg = "";
        switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = "QUOTA_EXCEEDED_ERR";
            break;
        case FileError.NOT_FOUND_ERR:
                msg = "NOT_FOUND_ERR";
            break;
        case FileError.SECURITY_ERR:
            msg = "SECURITY_ERR";
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = "INVALID_MODIFICATION_ERR";
            break;
        case FileError.INVALID_STATE_ERR:
            msg = "INVALID_STATE_ERR";
            break;
        default:
            msg = "Unknown Error";
            break;
        };
        console.log('Error: ' + msg);
        deferred.reject(msg);
    };

    return {
        connect: function(ssh2ServerHostname, ssh2ServerPort) {
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
        },
        storePrivateKeyToFile: function(privateKey) {
            var deferred = $q.defer();
            navigator.webkitTemporaryStorage.requestQuota(1024 * 10, function(bytes) {
                window.webkitRequestFileSystem(window.TEMPORARY, bytes, function(fs) {
                    fs.root.getDirectory("cma", {create: true}, function(dir) {
                        dir.getFile("id_rsa", {create: true}, function(file) {
                            file.createWriter(function(writer) {
                                writer.onwriteend = function(e) {
                                    console.log(e);
                                    deferred.resolve();
                                };
                                writer.onerror = function(e) {
                                    deferred.reject(e.toString());
                                };
                                var blob = new Blob([privateKey], {type: "text/plain"});
                                writer.write(blob);
                            }, function(error) {
                                errorHandler(error, deferred);
                            });
                        }, function(error) {
                            errorHandler(error, deferred);
                        });
                    }, function(error) {
                        errorHandler(error, deferred);
                    });
                });
            });
            return deferred.promise;
        }
    };

}]);
