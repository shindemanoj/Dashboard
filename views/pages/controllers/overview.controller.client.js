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
            // DashboardService
            //     .getFileNames()
            //     .success(function (response) {
            //         console.log(response);
            //     });

            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (config) {
                    model.config = config;
                    getReportData();
                    if($scope.selectedInst.instType === "GEM4K"){
                        processConfigFileForGEM4K(config);
                    }
                    if($scope.selectedInst.instType === "GWP"){
                        processConfigFileForGWP(config);
                    }
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

        function updateReportData() {
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (config) {
                    model.config = config;
                    getReportData();
                    if($scope.selectedInst.instType === "GEM4K"){
                        processConfigFileForGEM4K(config);
                    }
                    if($scope.selectedInst.instType === "GWP"){
                        processConfigFileForGWP(config);
                    }
                })
        }

        function processConfigFileForGEM4K(config){
            model.newSecoStableCount = 0;
            model.newSecoUnstableCount = 0;
            model.oldSecoStableCount = 0;
            model.oldSecoUnstableCount = 0;
            model.kontronStableCount = 0;
            model.kontronUnstableCount = 0;
            var instConfig = config.InstConfig;
            for(i in instConfig){
                if(instConfig[i].Network === "Stable" && instConfig[i].SBC === "New Seco"){
                    model.newSecoStableCount += 1;
                }
                else if(instConfig[i].Network === "Unstable" && instConfig[i].SBC === "New Seco"){
                    model.newSecoUnstableCount += 1;
                }
                else if(instConfig[i].Network === "Stable" && instConfig[i].SBC === "Old Seco"){
                    model.oldSecoStableCount += 1;
                }
                else if(instConfig[i].Network === "Unstable" && instConfig[i].SBC === "Old Seco"){
                    model.oldSecoUnstableCount += 1;
                }
                else if(instConfig[i].Network === "Stable" && instConfig[i].SBC === "Kontron"){
                    model.kontronStableCount += 1;
                }
                else if(instConfig[i].Network === "Unstable" && instConfig[i].SBC === "Kontron"){
                    model.kontronUnstableCount += 1;
                }
            }
            var jsonArray = model.jsonReport;

            model.stableNewSecoCrash = 0;
            model.unStableNewSecoCrash = 0;
            model.stableNewSecoFreeze = 0;
            model.unStableNewSecoFreeze = 0;

            model.stableOldSecoCrash = 0;
            model.unStableOldSecoCrash = 0;
            model.stableOldSecoFreeze = 0;
            model.unStableOldSecoFreeze = 0;

            model.stableKontronCrash = 0;
            model.unStableKontronCrash = 0;
            model.stableKontronFreeze = 0;
            model.unStableKontronFreeze = 0;

            for(i in jsonArray){
                var hostname = jsonArray[i].hostname;
                var errorType = jsonArray[i].errorType;
                for(j in instConfig){
                    if(instConfig[j].Hostname === hostname){
                        if(instConfig[j].Network === "Stable"){
                            if(errorType.includes("Freeze")){
                                if(instConfig[j].SBC === "New Seco"){
                                    model.stableNewSecoFreeze += 1;
                                }
                                if(instConfig[j].SBC === "Old Seco"){
                                    model.stableOldSecoFreeze += 1;
                                }
                                if(instConfig[j].SBC === "Kontron"){
                                    model.stableKontronFreeze += 1;
                                }
                            }
                            else{
                                if(instConfig[j].SBC === "New Seco"){
                                    model.stableNewSecoCrash += 1;
                                }
                                if(instConfig[j].SBC === "Old Seco"){
                                    model.stableOldSecoCrash += 1;
                                }
                                if(instConfig[j].SBC === "Kontron"){
                                    model.stableKontronCrash += 1;
                                }
                            }
                        }
                        else{
                            if(errorType.includes("Freeze")){
                                if(instConfig[j].SBC === "New Seco"){
                                    model.unStableNewSecoFreeze += 1;
                                }
                                if(instConfig[j].SBC === "Old Seco"){
                                    model.unStableOldSecoFreeze += 1;
                                }
                                if(instConfig[j].SBC === "Kontron"){
                                    model.unStableKontronFreeze += 1;
                                }
                            }
                            else{
                                if(instConfig[j].SBC === "New Seco"){
                                    model.unStableNewSecoCrash += 1;
                                }
                                if(instConfig[j].SBC === "Old Seco"){
                                    model.unStableOldSecoCrash += 1;
                                }
                                if(instConfig[j].SBC === "Kontron"){
                                    model.unStableKontronCrash += 1;
                                }
                            }
                        }
                    }
                }
            }
        }

        function processConfigFileForGWP(config){
            model.vmNewStableCount = 0;
            model.vmNewUnstableCount = 0;
            model.vmOldStableCount = 0;
            model.vmOldUnstableCount = 0;
            model.vmStableCount = 0;
            model.vmUnstableCount = 0;
            var instConfig = config.InstConfig;
            for(i in instConfig){
                if(instConfig[i].Network === "Stable" && instConfig[i].SBC === "VM New"){
                    model.vmNewStableCount += 1;
                }
                else if(instConfig[i].Network === "Unstable" && instConfig[i].SBC === "VM New"){
                    model.vmNewUnstableCount += 1;
                }
                else if(instConfig[i].Network === "Stable" && instConfig[i].SBC === "VM Old"){
                    model.vmOldStableCount += 1;
                }
                else if(instConfig[i].Network === "Unstable" && instConfig[i].SBC === "VM Old"){
                    model.vmOldUnstableCount += 1;
                }
                else if(instConfig[i].Network === "Stable" && instConfig[i].SBC === "VM"){
                    model.vmStableCount += 1;
                }
                else if(instConfig[i].Network === "Unstable" && instConfig[i].SBC === "VM"){
                    model.vmUnstableCount += 1;
                }
            }
            // var jsonArray = model.jsonReport;
            //
            // model.stableNewSecoCrash = 0;
            // model.unStableNewSecoCrash = 0;
            // model.stableNewSecoFreeze = 0;
            // model.unStableNewSecoFreeze = 0;
            //
            // model.stableOldSecoCrash = 0;
            // model.unStableOldSecoCrash = 0;
            // model.stableOldSecoFreeze = 0;
            // model.unStableOldSecoFreeze = 0;
            //
            // model.stableKontronCrash = 0;
            // model.unStableKontronCrash = 0;
            // model.stableKontronFreeze = 0;
            // model.unStableKontronFreeze = 0;
            //
            // for(i in jsonArray){
            //     var hostname = jsonArray[i].hostname;
            //     var errorType = jsonArray[i].errorType;
            //     for(j in instConfig){
            //         if(instConfig[j].Hostname === hostname){
            //             if(instConfig[j].Network === "Stable"){
            //                 if(errorType.includes("Freeze")){
            //                     if(instConfig[j].SBC === "New Seco"){
            //                         model.stableNewSecoFreeze += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Old Seco"){
            //                         model.stableOldSecoFreeze += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Kontron"){
            //                         model.stableKontronFreeze += 1;
            //                     }
            //                 }
            //                 else{
            //                     if(instConfig[j].SBC === "New Seco"){
            //                         model.stableNewSecoCrash += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Old Seco"){
            //                         model.stableOldSecoCrash += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Kontron"){
            //                         model.stableKontronCrash += 1;
            //                     }
            //                 }
            //             }
            //             else{
            //                 if(errorType.includes("Freeze")){
            //                     if(instConfig[j].SBC === "New Seco"){
            //                         model.unStableNewSecoFreeze += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Old Seco"){
            //                         model.unStableOldSecoFreeze += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Kontron"){
            //                         model.unStableKontronFreeze += 1;
            //                     }
            //                 }
            //                 else{
            //                     if(instConfig[j].SBC === "New Seco"){
            //                         model.unStableNewSecoCrash += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Old Seco"){
            //                         model.unStableOldSecoCrash += 1;
            //                     }
            //                     if(instConfig[j].SBC === "Kontron"){
            //                         model.unStableKontronCrash += 1;
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }
        }

        function getReportData() {
            var reportData = "Version,Hostname (IP),Error Type,Error Date,Comments,Last Reboot\n";
            DashboardService.getFileNames()
                .success(function (fileNames) {
                    for(i in fileNames){
                        if(fileNames[i].includes(".csv")){
                            DashboardService.readFile($scope.selectedInst.instType + '/' + fileNames[i])
                                .success(function (response) {
                                    reportData += response;
                                    model.jsonReport = DashboardService.processData(reportData);
                                    findFailureRate();
                                    getSummary();
                                    saveReport();
                                })
                        }
                    }
                });
        }


        function saveReport(){
            var newReport = {
                build: "GWP-5.2-B9 G5K-B29",
                reportData:model.jsonReport,
                overallFR: 0.19,
                stableFR: 0,
                unstableFR: 0.62,
                releaseData: model.releaseVer,
                instType: "GEM4K",
                startDate: new Date("09/15/2017"),
                endDate: new Date("09/20/2017")
            };
            DashboardService
                .getSaveReport(newReport)
                .success(function (response) {
                    console.log(response);
                })
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
                        var instConfig = model.config.InstConfig;
                        for(k in instConfig){
                            if(instConfig[k].Hostname === hostname){
                                if(instConfig[k].Network == "Stable"){
                                    summary[j].StableCount += 1;
                                }
                                else{
                                    summary[j].UnstableCount += 1;
                                }
                            }
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
            var stableCrashCount = 0; var unstableCrashCount = 0;
            var analyserStableCount = 0; var analyserUnstableCount = 0;
            for (var i = 0; i < jsonArray.length; i++) {
                var hostname = jsonArray[i]['hostname'];
                var instConfig = model.config.InstConfig;
                for(k in instConfig){
                    if(instConfig[k].Hostname === hostname){
                        if(instConfig[k].Network === "Stable"){
                            stableCrashCount += 1;
                        }
                        else{
                            unstableCrashCount += 1;
                        }
                    }
                }
            }

            for(k in instConfig) {
                if (instConfig[k].Network === "Stable") {
                    analyserStableCount += 1;
                }
                else {
                    analyserUnstableCount += 1;
                }
            }

            model.analyserCount = instConfig.length;
            model.failureRate = ((stableCrashCount + unstableCrashCount) / (model.analyserCount * 6))*100;
            model.failureRate = model.failureRate.toFixed(2);

            model.stableFailureRate = (stableCrashCount / (analyserStableCount * 6))*100;
            model.stableFailureRate = model.stableFailureRate.toFixed(2);

            model.unstableFailureRate = (unstableCrashCount / (analyserUnstableCount * 6))*100;
            model.unstableFailureRate = model.unstableFailureRate.toFixed(2);
        }
    }
})();