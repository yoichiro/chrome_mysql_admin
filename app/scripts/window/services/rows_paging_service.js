chromeMyAdmin.factory("rowsPagingService", function(
    $rootScope,
    Events,
    configurationService,
    Configurations
) {
    "use strict";

    var rowCountPerPage = 100;
    var currentPageIndex = 0;
    var totalRowCount = 0;

    configurationService.addConfigurationChangeListener(function(name, value) {
        if (name === Configurations.ROW_COUNT_PER_PAGE_IN_ROWS_PANEL) {
            rowCountPerPage = value;
        }
    });

    configurationService.getRowCountPerPageInRowsPanel().then(function(rowCount) {
        rowCountPerPage = rowCount;
    });

    return {
        reset: function() {
            currentPageIndex = 0;
            totalRowCount = 0;
        },
        updateTotalRowCount: function(newTotalRowCount) {
            totalRowCount = newTotalRowCount;
        },
        hasPrevious: function() {
            var previousPageIndex = currentPageIndex - 1;
            return previousPageIndex >= 0;
        },
        hasNext: function() {
            var nextPageIndex = currentPageIndex + 1;
            var start = nextPageIndex * rowCountPerPage;
            return (totalRowCount - 1) >= start;
        },
        next: function() {
            currentPageIndex++;
            $rootScope.$broadcast(Events.ROWS_PAGING_CHANGED, currentPageIndex);
        },
        previous: function() {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                $rootScope.$broadcast(Events.ROWS_PAGING_CHANGED, currentPageIndex);
            }
        },
        current: function() {
            var start = currentPageIndex * rowCountPerPage;
            return {
                offset: start,
                count: rowCountPerPage
            };
        },
        getTotalPageCount: function() {
            return Math.ceil(totalRowCount / rowCountPerPage);
        },
        getCurrentPageIndex: function() {
            return currentPageIndex;
        },
        refresh: function() {
            $rootScope.$broadcast(Events.ROWS_PAGING_CHANGED, currentPageIndex);
        }
    };

});
