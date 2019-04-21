chromeMyAdmin.factory("connectionInformationService", function(
  $rootScope,
  Events,
  mySQLClientService,
  mySQLQueryService,
) {
  "use strict";

  var connectionId = null;

  $rootScope.$on(Events.CONNECTION_CHANGED, function(event, data) {
    if (mySQLClientService.isConnected()) {
      mySQLQueryService.getConnectionId().then(function(result) {
        connectionId = result.resultsetRows[0].values[0];
      }, function(reason) {
        $rootScope.fatalErrorOccurred(reason);
      });
    } else {
      connectionId = null;
    }
  });

  return {
    getConnectionId: function() {
      return connectionId;
    }
  };
});
