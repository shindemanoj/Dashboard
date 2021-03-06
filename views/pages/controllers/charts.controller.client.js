(function () {
    angular
        .module('Dashboard')
        .controller('ChartsController', chartsController);

    function chartsController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;
        model.setImageURL = setImageURL;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }
        $scope.sortType     = 'Id'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order
        $scope.searchTable   = '';     // set the default search/filter term

        function init(){
            getReportData();
        }
        init();

        function updateReportData() {
            getReportData();
        }

        // Function to Get Report Data from Server or Database
        function getReportData() {
            if($scope.selectedInst.startDate !== ""){
                reqData = {
                    startDate: $scope.selectedInst.startDate,
                    instType: $scope.selectedInst.instType
                };
                DashboardService.getReport(reqData)
                    .success(function (response) {
                        model.config = response.config;
                        model.startDate = response.startDate;
                        model.endDate = response.endDate;
                        var jsonArr = response.reportData;
                        model.failureRate =response.overallFR;
                        model.stableFailureRate = response.stableFR;
                        model.unstableFailureRate = response.unstableFR;
                        for(i in jsonArr){
                            jsonArr[i]["errorDate"] = new Date(jsonArr[i]["errorDate"]);
                            jsonArr[i]["lastReboot"] = new Date(jsonArr[i]["lastReboot"]);
                        }
                        $scope.tableData = jsonArr;
                    });
            }
            else{
                getDataFromInstrument();
            }
        }

        // Function to get data from Server
        function getDataFromInstrument() {
            var reportData = "Version,Hostname (IP),Error Type,Error Date,Comments,Last Reboot\n";
            DashboardService.getFileNames($scope.selectedInst.instType)
                .success(function (fileNames) {
                    for(i in fileNames){
                        if(fileNames[i].includes(".csv")){
                            DashboardService.readFile($scope.selectedInst.instType + '/' + fileNames[i])
                                .success(function (response) {
                                    reportData += response;
                                    $scope.tableData = DashboardService.processData(reportData);
                                })
                        }
                    }
                    if(reportData.length === 65){
                        $scope.tableData = DashboardService.processData(reportData);
                    }
                });
        }

        // Function to set Image URL of an error
        function setImageURL(imageURL) {
            model.imageURL = $scope.selectedInst.instType + "/" + imageURL;
        }
    }
})();