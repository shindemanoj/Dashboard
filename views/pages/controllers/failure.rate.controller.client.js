/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('FailureRateController', failureRateController);

    function failureRateController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;
        model.failureRateView = failureRateView;

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
                    model.startDate = config.startDate;
                    model.endDate = config.endDate;
                    getReportData();
                });
        }
        init();

        // Function to update Report data based on instrument selection of a user
        function updateReportData() {
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (config) {
                    model.jsonReport = undefined;
                    model.config = config;
                    model.startDate = config.startDate;
                    model.endDate = config.endDate;
                    getReportData();
                })
        }

        // Function to Save Report in the Database
        function saveReport(){
            var newReport = {
                build: model.config.Version,
                reportData:model.jsonReport,
                overallFR: model.failureRate,
                stableFR: model.stableFailureRate,
                unstableFR: model.unstableFailureRate,
                config: model.config,
                instType: $scope.selectedInst.instType,
                startDate: model.startDate,
                endDate: model.endDate
            };
            DashboardService
                .saveReport(newReport)
                .success(function (response) {
                })
        }

        // Funciton to create Failure Rate View
        function failureRateView() {
            var jsonArray = model.jsonReport;
            var config = model.config.InstConfig;
            var dateArray = [];
            var failureRateData = [];
            for(i in config){
                failureRateData.push({"hostname":config[i].Hostname.replace(/\s/g, ''), "name":config[i].Name, "frArray":[], "h_total":0});
            }

            startDate = new Date(model.startDate);
            endDate = new Date(model.endDate);
            endDate.setDate(endDate.getDate() + 1);
            var index = 0;
            while(startDate.toLocaleDateString() !== endDate.toLocaleDateString()){
                dateArray.push(startDate.toLocaleDateString());
                for(i in failureRateData){
                    failureRateData[i].frArray[index] = 0;
                }
                startDate.setDate(startDate.getDate() + 1);
                index += 1;
            }
            model.dateArray = dateArray;
            model.v_totalArr = [];
            for(i in dateArray){
                var v_total = 0;
                for(j in jsonArray){
                    var errorDate = jsonArray[j]['errorDate'].toLocaleDateString();
                    if(dateArray[i] === errorDate){
                        v_total += 1;
                        for(k in failureRateData){
                            if(jsonArray[j].hostname === failureRateData[k].hostname){
                                failureRateData[k].h_total += 1;
                                failureRateData[k].frArray[i] += 1;
                            }
                        }
                    }
                }
                model.v_totalArr.push(v_total);
            }
            model.failureRateData = failureRateData;
        }

        // Function to get report from server or database
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
                        failureRateView();
                    })
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
                                    model.jsonReport = DashboardService.processData(reportData);
                                    failureRateView();
                                    findFailureRate();
                                    saveReport();
                                })
                        }
                    }
                    if(model.jsonReport === undefined){
                        failureRateView();
                        findFailureRate();
                        saveReport();
                    }
                });
        }

        // Funciton to find Failure Rate
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