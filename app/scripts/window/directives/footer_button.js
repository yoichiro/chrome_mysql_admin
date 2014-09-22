chromeMyAdmin.directive("footerButton", [function() {
    return {
        restrict: "E",
        templateUrl: "templates/footer_button.html",
        replace: true,
        scope: {
            icon: "@",
            title: "@",
            click: "&",
            enable: "&"
        },
        link: function(scope, element, attrs) {
            if (!attrs.enable) {
                scope.enable = function() {
                    return true;
                };
            }
            if (attrs.align === "left") {
                scope.align = "Left";
            } else {
                scope.align = "Right";
            }
        }
    };
}]);
