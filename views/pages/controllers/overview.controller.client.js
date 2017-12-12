/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('OverviewController', overviewController);

    function overviewController($routeParams, $scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.exportData = exportData;
        model.updateReportData = updateReportData;
        model.updateBaseLine = updateBaseLine;
        var startDate = $routeParams['startDate'];
        var selectedInst = $routeParams['instType'];

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }
        function init(){
            model.baseDisabled = false;
            if(selectedInst){
                $scope.selectedInst.instType = selectedInst;
                $scope.selectedInst.disabled = true;
            }
            if(startDate){
                $scope.selectedInst.startDate = startDate;
            }
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (config) {
                    model.config = config;
                    model.startDate = config.startDate;
                    model.endDate = config.endDate;
                    initializeBaseline();
                    getReportData();
                });
        }
        init();

        function updateReportData() {
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (config) {
                    model.jsonReport = undefined;
                    model.config = config;
                    model.startDate = config.startDate;
                    model.endDate = config.endDate;
                    initializeBaseline();
                    getReportData();
                });
        }


        function updateBaseLine(version) {
            if(confirm("Do you want to make "+version +" as a baseline?")){
                var date = new Date(model.startDate).toISOString();
                model.baseDisabled = true;
                if($scope.selectedInst.instType === "GEM5K"){
                    DashboardService
                        .getBaseLine()
                        .success(function (response) {
                            var baseArr = response.baseGEM5K;
                            baseArr.push(date);
                            DashboardService
                                .setBaseLine({baseGEM5K:baseArr})
                                .success(function (response) {
                                });
                        });
                }
                else if($scope.selectedInst.instType === "GEM4K"){
                    DashboardService
                        .getBaseLine()
                        .success(function (response) {
                            var baseArr = response.baseGEM4K;
                            baseArr.push(date);
                            DashboardService
                                .setBaseLine({baseGEM4K:baseArr})
                                .success(function (response) {
                                });
                        });
                }
                else if($scope.selectedInst.instType === "GWP"){
                    DashboardService
                        .getBaseLine()
                        .success(function (response) {
                            var baseArr = response.baseGWP;
                            baseArr.push(date);
                            DashboardService
                                .setBaseLine({baseGWP:baseArr})
                                .success(function (response) {
                                });
                        });
                }
                alert("Marked as a BaseLine");
            }
        }

        function initializeBaseline() {
            DashboardService
                .getBaseLine()
                .success(function (response) {
                    if($scope.selectedInst.instType === "GEM5K"){
                        model.baseline = response.baseGEM5K[response.baseGEM5K.length-1];
                    }
                    else if($scope.selectedInst.instType === "GEM4K"){
                        model.baseline = response.baseGEM4K[response.baseGEM4K.length-1];
                    }
                    else if($scope.selectedInst.instType === "GWP"){
                        model.baseline = response.baseGWP[response.baseGWP.length-1];
                    }
                });
        }

        function saveReport(){
            var newReport = {
                build: model.config.Version,
                reportData:model.jsonReport,
                overallFR: model.failureRate,
                stableFR: model.stableFailureRate,
                unstableFR: model.unstableFailureRate,
                instType: $scope.selectedInst.instType,
                startDate: model.startDate,
                endDate: model.endDate,
                config: model.config
            };
            DashboardService
                .saveReport(newReport)
                .success(function (response) {
                })
        }

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
                        model.jsonReport = jsonArr;
                        if($scope.selectedInst.instType === "GEM4K"){
                            processConfigFileForGEM4K(model.config);
                        }
                        if($scope.selectedInst.instType === "GWP"){
                            processConfigFileForGWP(model.config);
                        }
                        getSummary();
                    })
            }
            else{
                getDataFromInstrument();
            }
        }

        function getDataFromInstrument() {
            var reportData = "Version,Hostname (IP),Error Type,Error Date,Comments,Last Reboot\n";
            DashboardService.getFileNames($scope.selectedInst.instType)
                .success(function (fileNames) {
                    for(i in fileNames){
                        if(fileNames[i].includes(".csv")){
                            DashboardService.readFile($scope.selectedInst.instType + '/' + fileNames[i])
                                .success(function (response) {
                                    reportData += response;
                                    model.jsonReport = DashboardService.processData(reportData);
                                    if($scope.selectedInst.instType === "GEM4K"){
                                        processConfigFileForGEM4K(model.config);
                                    }
                                    if($scope.selectedInst.instType === "GWP"){
                                        processConfigFileForGWP(model.config);
                                    }
                                    findFailureRate();
                                    getSummary();
                                    saveReport();
                                })
                        }
                    }
                    if(model.jsonReport === undefined){
                        if($scope.selectedInst.instType === "GEM4K"){
                            processConfigFileForGEM4K(model.config);
                        }
                        if($scope.selectedInst.instType === "GWP"){
                            processConfigFileForGWP(model.config);
                        }
                        findFailureRate();
                        getSummary();
                        saveReport();
                    }
                });
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
                    if(instConfig[j].Hostname.replace(/\s/g, '') === hostname){
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
                            if(instConfig[k].Hostname.replace(/\s/g, '') === hostname){
                                if(instConfig[k].Network === "Stable"){
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
            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            var firstDate = new Date(model.startDate);
            var secondDate = new Date(model.endDate);

            var runDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
            var jsonArray = model.jsonReport;
            var stableCrashCount = 0; var unstableCrashCount = 0;
            var analyserStableCount = 0; var analyserUnstableCount = 0;
            var instConfig = model.config.InstConfig;
            if(jsonArray){
                for (var i = 0; i < jsonArray.length; i++) {
                    var hostname = jsonArray[i]['hostname'];
                    for(k in instConfig){
                        if(instConfig[k].Hostname.replace(/\s/g, '') === hostname){
                            if(instConfig[k].Network === "Stable"){
                                stableCrashCount += 1;
                            }
                            else{
                                unstableCrashCount += 1;
                            }
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
            model.failureRate = ((stableCrashCount + unstableCrashCount) / (model.analyserCount * runDays))*100;
            model.failureRate = model.failureRate.toFixed(2);

            model.stableFailureRate = (stableCrashCount / (analyserStableCount * runDays))*100;
            model.stableFailureRate = model.stableFailureRate.toFixed(2);

            model.unstableFailureRate = (unstableCrashCount / (analyserUnstableCount * runDays))*100;
            model.unstableFailureRate = model.unstableFailureRate.toFixed(2);
        }

        function hslToRgb(h, s, l){
            var r, g, b;

            if(s == 0){
                r = g = b = l; // achromatic
            }else{
                function hue2rgb(p, q, t){
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;
                    if(t < 1/6) return p + (q - p) * 6 * t;
                    if(t < 1/2) return q;
                    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
        }

        // convert a number to a color using hsl
        function numberToColorHsl(i) {
            // as the function expects a value between 0 and 1, and red = 0° and green = 120°
            // we convert the input to the appropriate hue value
            var hue = i * 1.2 / 360;
            // we convert hsl to rgb (saturation 100%, lightness 50%)
            var rgb = hslToRgb(hue, 1, .5);
            // we format to css value and return
            return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
        }

        $scope.colors = [numberToColorHsl(70)];

        var colorVal = 50;
        for (var i = 0; i <100; i++) {
            if(colorVal === 0){
                var nc = numberToColorHsl(0);
            }
            else{
                var nc = numberToColorHsl(colorVal);
                colorVal -= 5;
            }
            $scope.colors.push(nc);
        }
    }
})();