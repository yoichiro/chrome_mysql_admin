chromeMyAdmin.directive("navbarMenuItem", ["mySQLClientService", function(mySQLClientService) {
    return {
        restrict: "E",
        templateUrl: "templates/navbar_menu_item.html",
        replace: true,
        scope: {
            icon: "@",
            title: "@",
            click: "&",
            active: "&"
        },
        link: function(scope, element, attrs) {
            scope.isConnected = function() {
                return mySQLClientService.isConnected();
            };
            element.tooltip({
                title: scope.title
            });
        }
    };
}]);
