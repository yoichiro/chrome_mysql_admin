/*
 * Copyright (c) 2014 Yoichiro Tanaka. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

chromeMyAdmin.controller("FatalDialogController", ["$scope", "mySQLClientService", function($scope, mySQLClientService) {
    "use strict";

    $scope.initialize = function() {
        $("#fatalDialog").on("hidden.bs.modal", function() {
            var promise = mySQLClientService.logout();
            promise.then(function() {
                $scope.safeApply(function() {
                    $scope.notifyConnectionChanged();
                });
            });
        });
        $scope.$on("fatalErrorOccurred", function(event, errorMessage) {
            $scope.safeApply(function() {
                $scope.reason = errorMessage;
                $("#fatalDialog").modal("show");
            });
        });
    };

}]);
