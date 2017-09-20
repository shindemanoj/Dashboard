(function () {
    angular
        .module('Dashboard')
        .controller('DownloadsController', downloadsController);

    function downloadsController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }

        function init(){
            DashboardService
                .getAllReports($scope.selectedInst.instType)
                .success(function (response) {
                    model.reports = response;
                });
        }
        init();

        function updateReportData() {
            DashboardService
                .getAllReports($scope.selectedInst.instType)
                .success(function (response) {
                    model.reports = response;
                });
        }
    }
})();