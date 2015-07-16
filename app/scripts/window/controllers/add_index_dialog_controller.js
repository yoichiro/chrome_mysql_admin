chromeMyAdmin.controller("AddIndexDialogController", function(
    $scope,
    Events,
    mySQLClientService,
    targetObjectService
) {
    "use strict";

    var onShowDialog = function(data) {
        resetErrorMessage();
        $scope.selectedTable = data.table;
        $scope.keyType = "PRIMARY";
        $scope.keyName = "PRIMARY";
        $scope.columns = data.columns;
        if ($scope.columns.length > 0) {
            $scope.column = $scope.columns[0];
        }
        $scope.selectedColumns = [];
        $("#addIndexDialog").modal("show");
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_ADD_INDEX_DIALOG, function(event, data) {
            onShowDialog(data);
        });
    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    var setupItems = function() {
        $scope.keyTypes = ["PRIMARY", "INDEX", "UNIQUE"];
        $scope.keyType = "PRIMARY";
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
        setupItems();
    };

    $scope.onChangeKeyType = function() {
        if ($scope.keyType === "PRIMARY") {
            $scope.keyName = "PRIMARY";
        } else if ($scope.keyName === "PRIMARY") {
            $scope.keyName = "";
        }
    };

    $scope.isKeyNameDisabled = function() {
        return $scope.keyType === "PRIMARY";
    };

    $scope.isAddDisabled = function() {
        return !$scope.selectedColumns || $scope.selectedColumns.length === 0;
    };

    $scope.addColumn = function() {
        $scope.selectedColumns.push($scope.column);
        $scope.columns = $scope.columns.filter(function(e) {
            return $scope.column !== e;
        });
        if ($scope.columns.length > 0) {
            $scope.column = $scope.columns[0];
        }
    };

    $scope.deleteSelectedColumn = function(selectedColumn) {
        $scope.columns.push(selectedColumn);
        $scope.selectedColumns = $scope.selectedColumns.filter(function(e) {
            return selectedColumn !== e;
        });
        if ($scope.columns.length === 1) {
            $scope.column = $scope.columns[0];
        }
    };

    $scope.upColumn = function(index) {
        var previous = $scope.selectedColumns[index - 1];
        $scope.selectedColumns[index - 1] = $scope.selectedColumns[index];
        $scope.selectedColumns[index] = previous;
    };

    $scope.downColumn = function(index) {
        var next = $scope.selectedColumns[index + 1];
        $scope.selectedColumns[index + 1] = $scope.selectedColumns[index];
        $scope.selectedColumns[index] = next;
    };

    var createColumnListString = function(list) {
        var tmp = [];
        angular.forEach($scope.selectedColumns, function(e) {
            this.push("`" + e + "`");
        }, tmp);
        return tmp.join(",");
    };

    $scope.addIndex = function() {
        resetErrorMessage();
        var sql = "";
        var columnListString = "(" + createColumnListString($scope.selectedColumns) + ")";
        if ($scope.keyType === "PRIMARY") {
            sql += "ALTER TABLE `" + $scope.selectedTable.name + "` ADD PRIMARY KEY ";
            sql += columnListString;
        } else if ($scope.keyType === "INDEX") {
            sql += "ALTER TABLE `" + $scope.selectedTable.name + "` ADD INDEX ";
            if ($scope.keyName) {
                sql += "`" + $scope.keyName + "` ";
            }
            sql += columnListString;
        } else if ($scope.keyType === "UNIQUE") {
            sql += "ALTER TABLE `" + $scope.selectedTable.name + "` ADD UNIQUE INDEX ";
            if ($scope.keyName) {
                sql += "`" + $scope.keyName + "` ";
            }
            sql += columnListString;
        }
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Adding index failed.");
            } else {
                $("#addIndexDialog").modal("hide");
                targetObjectService.reSelectTable();
            }
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.errorMessage = errorMessage;
        });
    };

});
