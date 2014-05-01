chromeMyAdmin.directive("createTableDialog", function() {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "templates/create_table_dialog.html"
    };
});

chromeMyAdmin.controller("CreateTableDialogController", ["$scope", "targetObjectService", "mySQLClientService", "Events", "modeService", "Modes", function($scope, targetObjectService, mySQLClientService, Events, modeService, Modes) {
    "use strict";

    var loadCharacterSets = function() {
        mySQLClientService.query("SHOW CHARACTER SET").then(function(result) {
            if (result.hasResultsetRows) {
                $scope.characterSets = result.resultsetRows;
                if (result.resultsetRows.length > 0) {
                    $scope.characterSet = "utf8";
                } else {
                    $scope.fatalErrorOccurred("No character set.");
                }
            } else {
                $scope.fatalErrorOccurred("Fetching character set failed.");
            }
        }, function(reason) {
            var errorMessage = reason.errorMessage;
            $scope.fatalErrorOccurred(errorMessage);
        });
    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var assignEventHandlers = function() {
        $("#createTableDialog").on("show.bs.modal", onShowCreateTableDialog);
    };

    var onShowCreateTableDialog = function(event) {
        resetErrorMessage();
        $scope.selectedDatabase = targetObjectService.getDatabase();
        $scope.tableName = "";
        $scope.engine = "InnoDB";
        loadCharacterSets();
    };

    var doCreateTable = function() {
        var tableName = $scope.tableName;
        var sql = "CREATE TABLE `" + tableName + "` (";
        sql += "id INT(11) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT) ";
        sql += "DEFAULT CHARACTER SET `" + $scope.characterSet + "` ";
        sql += "ENGINE = `" + $scope.engine + "`";
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Creating table failed.");
            } else {
                $("#createTableDialog").modal("hide");
                targetObjectService.refreshTableList();
                targetObjectService.changeTable(tableName);
                modeService.changeMode(Modes.STRUCTURE);
            }
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.errorMessage = errorMessage;
        });
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
        $scope.engines = ["InnoDB", "MyISAM", "ARCHIVE", "MEMORY", "MERGE", "NDBCLUSTER"];
        $scope.engine = "InnoDB";
    };

    $scope.createTable = function() {
        resetErrorMessage();
        if (!$scope.tableName) {
            $scope.errorMessage = "Table name is empty.";
            return;
        }
        doCreateTable();
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

}]);
