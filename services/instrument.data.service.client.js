(function(){
    angular
        .module("Dashboard")
        .factory('InstrumentDataService', instrumentDataService);

    function instrumentDataService() {
        return {instType:'', startDate:'', disabled:''}
    }
})();