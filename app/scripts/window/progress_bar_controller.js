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

chromeMyAdmin.controller("ProgressBarController", ["$scope", function($scope) {
    "use strict";

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustProgressPanelHeight();
        });
    };

    var adjustProgressPanelHeight = function() {
        $("#progressPanel").height($(window).height());
    };

    var setVisibleProgressBar = function(newVisibleProgressBar) {
        $scope.safeApply(function() {
            $scope.visibleProgressBar = newVisibleProgressBar;
        });
    };

    $scope.initialize = function() {
        $scope.$on("showProgressBar", function(event) {
            setVisibleProgressBar(true);
        });
        $scope.$on("hideProgressBar", function(event) {
            setVisibleProgressBar(false);
        });
        $scope.visibleProgressBar = false;
        assignWindowResizeEventHandler();
        adjustProgressPanelHeight();
    };

    $scope.isVisibleProgressBar = function() {
        return $scope.visibleProgressBar;
    };

}]);
