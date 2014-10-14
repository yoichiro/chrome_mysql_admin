chromeMyAdmin.directive("statusGraph", [function() {

    var createGraphOption = function() {
        return {
            seriesDefaults: {
                markerOptions: {
                    show: false
                },
                shadow: false,
                fill: true,
                fillAlpha: 0.3,
                fillAndStroke: true
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
            normalData: "=",
            deltaData: "=",
            statusName: "=target",
            closedCallback: "&closed",
            graphType: "="
        },
        controller: ["$scope", "GraphTypes", function($scope, GraphTypes) {
            this.assignEventHandlers = function(scope, element) {
                window.addEventListener("resize", function(e) {
                    scope.replot();
                });
                element.on("$destroy", function() {
                    scope.destroy();
                });
            };

            this.createGraph = function(scope, element) {
                var data;
                if ($scope.graphType === GraphTypes.NORMAL) {
                    data = scope.normalData[scope.statusName];
                } else {
                    data = scope.deltaData[scope.statusName];
                }
                return element.find("div.graph").jqplot(
                    [data],
                    createGraphOption()
                ).data("jqplot");
            };

            $scope.replot = function() {
                var options = createGraphOption();
                var data;
                if ($scope.graphType === GraphTypes.NORMAL) {
                    data = $scope.normalData[$scope.statusName];
                } else {
                    data = $scope.deltaData[$scope.statusName];
                }
                options.data = [data];
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

                scope.$watch("deltaData", function(newVal, oldVal) {
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
