chromeMyAdmin.controller("CreateDatabaseDialogController", function(
    $scope,
    Events,
    mySQLClientService,
    targetObjectService,
    mySQLQueryService
) {
    "use strict";

    var onShowDialog = function() {
        resetErrorMessage();
        $("#createDatabaseDialog").modal("show");
        loadCharacterSet();
    };

    var loadCharacterSet = function() {
        mySQLQueryService.showCharacterSet().then(function(result) {
            $scope.characterSets = result.resultsetRows;
            $scope.characterSet = "utf8";
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_CREATE_DATABASE_DIALOG, function(event, data) {
            onShowDialog();
        });

    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    var doCreateDatabase = function() {
        var sql = "CREATE DATABASE `" + $scope.databaseName + "` CHARACTER SET " + $scope.characterSet;
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Creating table failed.");
            } else {
                $("#createDatabaseDialog").modal("hide");
                targetObjectService.refreshDatabases();
            }
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.errorMessage = errorMessage;
        });
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
    };

    $scope.isCreateDatabaseButtonDisabled = function() {
        return !$scope.databaseName || $scope.databaseName.length == 0;
    };

    $scope.createDatabase = function() {
        resetErrorMessage();
        doCreateDatabase();
    };

});
