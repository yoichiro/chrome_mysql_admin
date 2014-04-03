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

chromeMyAdmin.controller("MainFooterController", ["$scope", "modeService", "mySQLClientService", "rowsPagingService", "rowsSelectionService", "targetObjectService", function($scope, modeService, mySQLClientService, rowsPagingService, rowsSelectionService, targetObjectService) {
    "use strict";

    var showMainStatusMessage = function(message) {
        $scope.safeApply(function() {
            $scope.mainStatusMessage = message;
        });
    };

    var _hasPrevisouPage = function() {
        return rowsPagingService.hasPrevious();
    };

    var _hasNextPage = function() {
        return rowsPagingService.hasNext();
    };

    $scope.initialize = function() {
        $scope.$on("showMainStatusMessage", function(event, message) {
            showMainStatusMessage(message);
        });
    };

    $scope.isButtonsVisible = function() {
        return mySQLClientService.isConnected() && modeService.getMode() === "rows";
    };

    $scope.hasPreviousPage = function() {
        return _hasPrevisouPage();
    };

    $scope.hasNextPage = function() {
        return _hasNextPage();
    };

    $scope.goPreviousPage = function() {
        if (_hasPrevisouPage()) {
            rowsPagingService.previous();
        }
    };

    $scope.goNextPage = function() {
        if (_hasNextPage()) {
            rowsPagingService.next();
        }
    };

    $scope.getPagingInfo = function() {
        return (rowsPagingService.getCurrentPageIndex() + 1) + "/" + rowsPagingService.getTotalPageCount();
    };

    $scope.refresh = function() {
        rowsPagingService.refresh();
    };

    $scope.isRowSelection = function() {
        if (rowsSelectionService.getSelectedRows() &&
           modeService.getMode() === "rows") {
            return true;
        } else {
            return false;
        }
    };

    $scope.confirmDeleteSelectedRow = function() {
        rowsSelectionService.confirmDeleteSelectedRow();
    };

    $scope.isTableSelection = function() {
        return targetObjectService.getTable();
    };

    $scope.insertRow = function() {
        targetObjectService.requestInsertRow();
    };

}]);
