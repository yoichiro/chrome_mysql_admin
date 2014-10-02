chromeMyAdmin.directive("statusGraph", [function() {

    var createGraphOption = function() {
        return {
            seriesDefaults: {
                markerOptions: {
                    show: false
                },
                shadow: false
            },
            grid: {
                background: "#ffffff",
                shadow: false
            },
            axes: {
                xaxis: {
                    min: 0,
                    max: 52,
                    showTicks: false
                }
            }
        };
    };

    return {
        restrict: "E",
        templateUrl: "templates/status_graph.html",
        replace: true,
        scope: {
            data: "=",
            statusName: "=target",
            closedCallback: "&closed"
        },
        controller: ["$scope", function($scope) {
            this.assignEventHandlers = function(scope, element) {
                window.addEventListener("resize", function(e) {
                    scope.replot();
                });
                element.on("$destroy", function() {
                    scope.destroy();
                });
            };

            this.createGraph = function(scope, element) {
                return element.find("div.graph").jqplot(
                    [scope.data[scope.statusName]],
                    createGraphOption()
                ).data("jqplot");
            };

            $scope.replot = function() {
                var options = createGraphOption();
                options.data = [$scope.data[$scope.statusName]];
                options.clear = true;
                $scope.jqplot.replot(options);
            };

            $scope.destroy = function() {
                $scope.jqplot.destroy();
            };

            $scope.removeMe = function(element) {
                $scope.closedCallback($scope.statusName);
                element.remove();
            };
        }],
        compile: function(element, attrs) {
            return function(scope, element, attrs, ctrl) {
                scope.jqplot = ctrl.createGraph(scope, element);

                scope.$watch("data", function(newVal, oldVal) {
                    scope.replot();
                }, true);

                ctrl.assignEventHandlers(scope, element);

                scope.closeGraph = (function(e) {
                    return function() {
                        scope.removeMe(e);
                    };
                })(element);
            };
        }
    };

}]);
