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

chromeMyAdmin.factory("rowsSelectionService", ["$rootScope", function($rootScope) {
    "use strict";

    var selectedRow = null;

    return {
        reset: function() {
            selectedRow = null;
        },
        setSelectedRows: function(newSelectedRow) {
            selectedRow = newSelectedRow;
            $rootScope.$broadcast("rowsSelectionChanged", selectedRow);
        },
        getSelectedRows: function() {
            return selectedRow;
        },
        confirmDeleteSelectedRow: function() {
            $rootScope.$broadcast("confirmDeleteSelectedRow", selectedRow);
        },
        requestDeleteSelectedRow: function() {
            $rootScope.$broadcast("requestDeleteSelectedRow", selectedRow);
        }
    };

}]);
