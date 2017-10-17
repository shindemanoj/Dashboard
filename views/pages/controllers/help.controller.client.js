(function () {
    angular
        .module('Dashboard')
        .controller('HelpController', helpController);

    function helpController($scope, DashboardService, InstrumentDataService) {
        var model = this;
    }
})();