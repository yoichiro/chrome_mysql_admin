chromeMyAdmin.controller("CreateTableDialogController", function(
    $scope,
    targetObjectService,
    mySQLClientService,
    Events,
    modeService,
    Modes,
    Engines,
    mySQLQueryService
) {
    "use strict";

    var loadCharacterSets = function() {
        mySQLQueryService.showCharacterSet().then(function(result) {
            $scope.characterSets = result.resultsetRows;
            $scope.characterSet = "utf8";
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
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
                targetObjectService.changeTable({
                    name: tableName,
                    type: "BASE TABLE",
                    className: "glyphicon-th-large"
                });
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
        $scope.engines = Engines;
        $scope.engine = Engines[0];
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

});
