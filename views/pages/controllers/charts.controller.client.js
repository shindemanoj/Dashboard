(function () {
    angular
        .module('Dashboard')
        .controller('ChartsController', chartsController);

    function chartsController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }
        $scope.sortType     = 'Id'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order
        $scope.searchTable   = '';     // set the default search/filter term

        function init(){
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (response) {
                    console.log(response);
                });
            DashboardService
                .getLatestReport()
                .success(function (response) {
                    $scope.tableData = DashboardService.processData(response);
                });
        }
        init();

        function updateReportData() {
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (response) {
                    console.log(response);
                });
        }
    }
})();