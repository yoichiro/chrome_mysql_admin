chromeMyAdmin.factory("rowsPagingService", ["$rootScope", function($rootScope) {
    "use strict";

    var ROW_COUNT_PER_PAGE = 100;
    var currentPageIndex = 0;
    var totalRowCount = 0;

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
            var start = nextPageIndex * ROW_COUNT_PER_PAGE;
            return (totalRowCount - 1) >= start;
        },
        next: function() {
            currentPageIndex++;
            $rootScope.$broadcast("rowsPagingChanged", currentPageIndex);
        },
        previous: function() {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                $rootScope.$broadcast("rowsPagingChanged", currentPageIndex);
            }
        },
        current: function() {
            var start = currentPageIndex * ROW_COUNT_PER_PAGE;
            return {
                offset: start,
                count: ROW_COUNT_PER_PAGE
            };
        },
        getTotalPageCount: function() {
            return Math.ceil(totalRowCount / ROW_COUNT_PER_PAGE);
        },
        getCurrentPageIndex: function() {
            return currentPageIndex;
        },
        refresh: function() {
            $rootScope.$broadcast("rowsPagingChanged", currentPageIndex);
        }
    };

}]);
