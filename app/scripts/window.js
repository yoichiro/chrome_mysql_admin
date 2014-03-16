"use strict";

var chromeMyAdmin = angular.module("chromeMyAdmin", ["ngGrid"]);

chromeMyAdmin.run(function($rootScope) {

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
        $rootScope.$broadcast("fatalErrorOccurred", errorMessage);
    };

    $rootScope.notifyConnectionChanged = function() {
        $rootScope.$broadcast("connectionChanged", null);
    };

    $rootScope.notifyDatabaseChanged = function(database) {
        $rootScope.$broadcast("databaseChanged", database);
    };

    $rootScope.notifyTableChanged = function(table) {
        $rootScope.$broadcast("tableChanged", table);
    };

    $rootScope.showMainStatusMessage = function(message) {
        $rootScope.$broadcast("showMainStatusMessage", message);
    };

    $rootScope.showProgressBar = function() {
        $rootScope.$broadcast("showProgressBar", null);
    };

    $rootScope.hideProgressBar = function() {
        $rootScope.$broadcast("hideProgressBar", null);
    };

});
