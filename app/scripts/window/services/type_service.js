chromeMyAdmin.factory("typeService", function(
    $rootScope,
    TypeMap
) {
    "use strict";

    var types = [];

    for (var type in TypeMap) {
        types.push(type);
    }

    return {
        getTypes: function() {
            return types;
        },
        isString: function(type) {
            var info = TypeMap[type];
            return info.isString;
        },
        isNumeric: function(type) {
            var info = TypeMap[type];
            return info.isNumeric;
        },
        isDateTime: function(type) {
            var info = TypeMap[type];
            return info.isDateTime;
        }
    };

});
