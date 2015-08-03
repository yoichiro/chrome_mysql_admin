chromeMyAdmin.controller("CreateRoutineDialogController", function(
    $scope,
    Events,
    mySQLClientService,
    typeService,
    sqlExpressionService,
    targetObjectService
) {
    "use strict";

    var onShowDialog = function() {
        resetErrorMessage();
        $scope.routineName = "";
        $scope.routineType = "PROCEDURE";
        $scope.parameters = [];
        $scope.routineBody = "";
        $scope.deterministic = "false";
        $scope.sqlSecurity = "DEFINER";
        $scope.characteristic = "CONTAINS SQL";
        $scope.comment = "";
        $scope.returnTypeName = "INT";
        $scope.returnTypeLength = null;
        $scope.returnTypeOption = "";
        resetNewPrameterForm();
        $("#createRoutineDialog").modal("show");
    };

    var resetNewPrameterForm = function() {
        $scope.newIo = "IN";
        $scope.newParamName = "";
        $scope.newTypeName = "INT";
        $scope.newTypeLength = null;
        $scope.newTypeOption = "";
    };

    var assignEventHandlers = function() {
        $scope.$on(Events.SHOW_CREATE_ROUTINE_DIALOG, function(event, data) {
            onShowDialog();
        });
    };

    var setupItems = function() {
        $scope.ios = ["IN", "OUT", "INOUT"];
        $scope.types = typeService.getTypes();
        $scope.typeOptions = ["", "UNSIGNED", "ZEROFILL", "UNSIGNED ZEROFILL"];
        $scope.characteristics = ["CONTAINS SQL", "NO SQL", "READS SQL DATA", "MODIFIES SQL DATA"];
        $scope.routineTypes = ["PROCEDURE", "FUNCTION"];
    };

    var resetErrorMessage = function() {
        $scope.errorMessage = "";
    };

    $scope.isErrorMessageVisible = function() {
        return $scope.errorMessage.length > 0;
    };

    $scope.initialize = function() {
        resetErrorMessage();
        assignEventHandlers();
        setupItems();
    };

    $scope.aceLoaded = function(editor) {
        $scope.editor = editor;
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.setShowInvisibles(true);
        editor.getSession().setUseWrapMode(true);
    };

    $scope.createRoutine = function() {
        var sql = "CREATE DEFINER=CURRENT_USER ";
        sql += $scope.routineType + " `";
        sql += $scope.routineName + "` (";
        var params = [];
        angular.forEach($scope.parameters, function(param) {
            var p = [];
            if ($scope.isProcedure()) {
                p.push(param.io);
            }
            p.push("`" + param.paramName + "`");
            var type = param.typeName;
            if (param.typeLength) {
                type += "(" + param.typeLength + ")";
            }
            p.push(type);
            if (param.typeOption) {
                p.push(param.typeOption);
            }
            params.push(p.join(" "));
        });
        sql += params.join(", ") + ") ";
        if (!$scope.isProcedure()) {
            sql += "RETURNS ";
            var type = $scope.returnTypeName;
            if ($scope.returnTypeLength) {
                type += "(" + $scope.returnTypeLength + ")";
            }
            sql += type + " ";
            sql += $scope.returnTypeOption + " ";
        }
        if ($scope.deterministic === "true") {
            sql += "DETERMINISTIC ";
        }
        sql += "SQL SECURITY " + $scope.sqlSecurity + " ";
        sql += $scope.characteristic + " ";
        if ($scope.comment) {
            sql += "COMMENT '" + sqlExpressionService.replaceValue($scope.comment) + "' ";
        }
        sql += $scope.routineBody;
        mySQLClientService.query(sql).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.fatalErrorOccurred("Creating routine failed.");
            } else {
                $("#createRoutineDialog").modal("hide");
                targetObjectService.refreshProceduresFunctions();
            }
        }, function(reason) {
            var errorMessage = "[Error code:" + reason.errorCode;
            errorMessage += " SQL state:" + reason.sqlState;
            errorMessage += "] ";
            errorMessage += reason.errorMessage;
            $scope.errorMessage = errorMessage;
        });
    };

    $scope.isProcedure = function() {
        return $scope.routineType === "PROCEDURE";
    };

    $scope.addParameter = function() {
        var io = $scope.newIo;
        var paramName = $scope.newParamName;
        var typeName = $scope.newTypeName;
        var typeLength = $scope.newTypeLength;
        var typeOption = $scope.newTypeOption;
        $scope.parameters.push({
            io: io,
            paramName: paramName,
            typeName: typeName,
            typeLength: typeLength ? Number(typeLength) : null,
            typeOption: typeOption
        });
        resetNewPrameterForm();
    };

    $scope.deleteParameter = function(target) {
        var idx = -1;
        angular.forEach($scope.parameters, function(parameter, index) {
            if (parameter.paramName === target.paramName) {
                idx = index;
            }
        });
        if (idx !== -1) {
            $scope.parameters.splice(idx, 1);
        }
    };

});
