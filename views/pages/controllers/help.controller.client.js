(function () {
    angular
        .module('Dashboard')
        .controller('HelpController', helpController);

    function helpController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }

        function init(){
            DashboardService
                .getLatestReport()
                .success(function (response) {
                    $scope.tableData = DashboardService.processData(response);
                });
        }
        init();

        function updateReportData() {

        }
    }
})();