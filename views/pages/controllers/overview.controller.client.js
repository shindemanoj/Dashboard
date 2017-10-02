/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('OverviewController', overviewController);

    function overviewController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.exportData = exportData;
        model.updateReportData = updateReportData;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }
        function init(){
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (config) {
                    model.config = config;
                    getReportData();
                });

            DashboardService
                .getReleaseVersion()
                .success(function (releaseVerData) {
                    releaseVerArr = releaseVerData.trim().split("\n");
                    buildData = {};
                    for(i in releaseVerArr){
                        dataArr = releaseVerArr[i].split("=");
                        buildData[dataArr[0]] = dataArr[1];
                    }
                    model.releaseVer = buildData;
                    console.log(buildData);
                });
        }
        init();

        function getReportData() {
            DashboardService
                .getLatestReport()
                .success(function (response) {
                    model.jsonReport = DashboardService.processData(response);
                    findFailureRate();
                    getSummary();
                    saveReport();
                })
        }

        function updateReportData() {
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (response) {
                    model.config = response;
                    getReportData();
                })
        }
        function saveReport(){
            var newReport = {
                build: "GWP-5.2-B9 G5K-B29",
                reportData:model.jsonReport,
                overallFR: 0.19,
                stableFR: 0,
                unstableFR: 0.62,
                releaseData: model.releaseVer,
                instType: "GEM5K",
                dateCreated: new Date("09/06/2017")
            };
            // DashboardService
            //     .getSaveReport(newReport)
            //     .success(function (response) {
            //         console.log(response);
            //     })
        }

        function getSummary() {
            var jsonArray = model.jsonReport;
            var summary = [];
            var defectIds = [];
            for (i in jsonArray) {
                var defectId = jsonArray[i].defectId;
                if (jQuery.inArray(defectId, defectIds) === -1) {
                    defectIds.push(defectId);
                    summary.push({DefectId:defectId, StableCount:0, UnstableCount:0})
                }
            }
            for (i in jsonArray) {
                for(j in summary){
                    if(jsonArray[i].defectId === summary[j].DefectId){
                        var hostname = jsonArray[i]['hostname'];
                        if(jQuery.inArray(hostname, model.config.Stable) !== -1){
                            summary[j].StableCount += 1;
                        }
                        else{
                            summary[j].UnstableCount += 1;
                        }
                    }
                }
            }
            model.summary = summary;
        }

        function exportData(){
            html2canvas(document.getElementById('exportthis'), {
                onrendered: function (canvas) {
                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500,
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download("StressTestReport.pdf");
                }
            });
        }

        function findFailureRate() {
            var jsonArray = model.jsonReport;
            var analyserHostnames = [];
            var stableCrashCount = 0; var unstableCrashCount = 0;
            for (var i = 0; i < jsonArray.length; i++) {
                var hostname = jsonArray[i]['hostname'];
                if(jQuery.inArray(hostname, model.config.Stable) !== -1){
                    stableCrashCount += 1;
                }
                else{
                    unstableCrashCount += 1;
                }
                if (jQuery.inArray(hostname, analyserHostnames) === -1) {
                    analyserHostnames.push(hostname);
                }
            }
            model.analyserCount = analyserHostnames.length;
            model.failureRate = (model.totalCrashCount / (model.analyserCount * 14))*100;
            model.failureRate = model.failureRate.toFixed(2);

            model.stableFailureRate = (stableCrashCount / (model.config.Stable.length * 14))*100;
            model.stableFailureRate = model.stableFailureRate.toFixed(2);

            model.unstableFailureRate = (unstableCrashCount / (model.config.Unstable.length * 14))*100;
            model.unstableFailureRate = model.unstableFailureRate.toFixed(2);
        }
    }
})();