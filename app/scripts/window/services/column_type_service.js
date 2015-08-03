chromeMyAdmin.factory("columnTypeService", function($rootScope) {
    "use strict";

    var numericTypes = [0, 1, 2, 3, 4, 5, 8, 9, 246];

    return {
        isNumeric: function(type) {
            return numericTypes.indexOf(type) > -1;
        }
    };

});
