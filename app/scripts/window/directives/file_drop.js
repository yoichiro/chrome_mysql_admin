chromeMyAdmin.directive("fileDrop", [function() {
    return {
        restrict: "A",
        scope: {
            onFileDrop: "&fileDrop"
        },
        controller: ["$scope", function($scope) {
            $scope.onDragEnterOrOver = function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
            };

            $scope.onDrop = function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                $scope.onFileDrop({
                    files: evt.originalEvent.dataTransfer.files
                });
            };

            $scope.assignEventHandlers = function(element) {
                element.bind("dragover", function(evt) {
                    $scope.onDragEnterOrOver(evt);
                });
                element.bind("dragenter", function(evt) {
                    $scope.onDragEnterOrOver(evt);
                });
                element.bind("drop", function(evt) {
                    $scope.onDrop(evt);
                });
            };
        }],
        link: function(scope, element, attrs) {
            scope.assignEventHandlers(element);
        }
    };
}]);
