(function(){
    angular
        .module("Dashboard")
        .factory('InstrumentDataService', instrumentDataService);

    // Service to share common data between all controllers
    function instrumentDataService() {
        return {instType:'', startDate:'', disabled:''}
    }
})();