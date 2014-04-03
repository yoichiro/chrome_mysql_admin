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

chromeMyAdmin.factory("targetObjectService", ["$rootScope", function($rootScope) {
    "use strict";

    var database = null;
    var table = null;

    var _changeDatabase = function(newDatabase) {
        database = newDatabase;
        if (database) {
            $rootScope.$broadcast("databaseChanged", database);
        }
    };

    var _changeTable = function(newTable) {
        table = newTable;
        $rootScope.$broadcast("tableChanged", table);
    };

    return {
        changeDatabase: function(newDatabase) {
            _changeDatabase(newDatabase);
        },
        resetDatabase: function() {
            _changeDatabase(null);
        },
        getDatabase: function() {
            return database;
        },
        changeTable: function(newTable) {
            _changeTable(newTable);
        },
        resetTable: function() {
            _changeTable(null);
        },
        getTable: function() {
            return table;
        },
        requestInsertRow: function() {
            $rootScope.$broadcast("requestInsertRow", table);
        },
        showInsertRowPanel: function(columnDefinitions) {
            $rootScope.$broadcast("showInsertRowPanel", columnDefinitions);
        }
    };

}]);
