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
            getSummaryGEM5K();
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
                    getSummaryGEM5K();
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
                reportData:model.jsonReport,
                overallFR: 9.13,
                stableFR: 11.11,
                unstableFR: 6.12,
                releaseData: model.releaseVer,
                instType: "GEM5K"
            };
            // DashboardService
            //     .getSaveReport(newReport)
            //     .success(function (response) {
            //         console.log(response);
            //     })
        }

        function getSummaryGEM5K() {
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
    }
})();