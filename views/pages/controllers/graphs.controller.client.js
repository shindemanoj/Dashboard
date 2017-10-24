/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('GraphsController', graphsController);

    function graphsController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;
        model.updateFailureRateGraph = updateFailureRateGraph;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }
        function init(){
            DashboardService
                .getReleaseVersion($scope.selectedInst.instType)
                .success(function (releaseVerData) {
                    releaseVerArr = releaseVerData.trim().split("\n");
                    buildData = {};
                    for(i in releaseVerArr){
                        dataArr = releaseVerArr[i].split("=");
                        buildData[dataArr[0]] = dataArr[1];
                    }
                    model.releaseVer = buildData;
                    DashboardService
                        .getConfiguration($scope.selectedInst.instType)
                        .success(function (config) {
                            model.config = config;
                            model.startDate = config.startDate;
                            model.endDate = config.endDate;
                            getReportData();
                        });
                });
        }
        init();

        function getReportData() {
            var reportData = "Version,Hostname (IP),Error Type,Error Date,Comments,Last Reboot\n";
            DashboardService.getFileNames($scope.selectedInst.instType)
                .success(function (fileNames) {
                    for(i in fileNames){
                        if(fileNames[i].includes(".csv")){
                            DashboardService.readFile($scope.selectedInst.instType + '/' + fileNames[i])
                                .success(function (response) {
                                    reportData += response;
                                    model.jsonReport = DashboardService.processData(reportData);
                                    createLineGraph();
                                    createCrashCountPieChart();
                                    createCrashPerPieChart();
                                    findFailureRate();
                                    saveReport();
                                    gelHistoricalData();
                                })
                        }
                    }
                });
        }

        function updateFailureRateGraph() {
            createFailureRateGraph();
        }

        function updateReportData() {
            DashboardService
                .getReleaseVersion($scope.selectedInst.instType)
                .success(function (releaseVerData) {
                    releaseVerArr = releaseVerData.trim().split("\n");
                    buildData = {};
                    for(i in releaseVerArr){
                        dataArr = releaseVerArr[i].split("=");
                        buildData[dataArr[0]] = dataArr[1];
                    }
                    model.releaseVer = buildData;
                    DashboardService
                        .getConfiguration($scope.selectedInst.instType)
                        .success(function (config) {
                            model.config = config;
                            model.startDate = config.startDate;
                            model.endDate = config.endDate;
                            getReportData();
                        });
                });
        }

        function saveReport(){
            var newReport = {
                build: model.releaseVer.Version,
                reportData:model.jsonReport,
                overallFR: model.failureRate,
                stableFR: model.stableFailureRate,
                unstableFR: model.unstableFailureRate,
                releaseData: model.releaseVer,
                instType: $scope.selectedInst.instType,
                startDate: model.startDate,
                endDate: model.endDate
            };
            DashboardService
                .getSaveReport(newReport)
                .success(function (response) {
                })
        }

        function gelHistoricalData() {
            DashboardService.getAllReports($scope.selectedInst.instType)
                .success(function (response) {
                    model.oldReportData = response;
                    startDate = new Date(model.startDate);
                    if(response.length > 4){
                        model.selOldReportCount = new Date(response[3].startDate).toLocaleDateString();
                    }
                    else{
                        model.selOldReportCount = new Date(response[response.length-1].startDate).toLocaleDateString();
                    }
                    createFailureRateGraph();
                })
        }

        function createLineGraph() {
            $scope.lineGraph = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function(e){ console.log("stateChange"); },
                        changeState: function(e){ console.log("changeState"); },
                        tooltipShow: function(e){ console.log("tooltipShow"); },
                        tooltipHide: function(e){ console.log("tooltipHide"); }
                    },
                    xAxis: {
                        axisLabel: 'Date',
                        tickFormat: function(d) {
                            return d3.time.format('%m/%d/%y')(new Date(d))
                        },
                        showMaxMin: true,
                        staggerLabels: true
                    },
                    yAxis: {
                        axisLabel: 'Number Of Crashes',
                        axisLabelDistance: -10
                    }
                }
            };

            $scope.lineGraphData = computeGraphData();
        }

        function computeGraphData() {
           jsonArray = model.jsonReport;
            //Comparer Function
            function GetSortOrder(prop) {
                return function(a, b) {
                    if (a[prop] > b[prop]) {
                        return 1;
                    } else if (a[prop] < b[prop]) {
                        return -1;
                    }
                    return 0;
                }
            }
            jsonArray.sort(GetSortOrder("errorDate"));

            var crashData = {};
            for (var i = 0; i < jsonArray.length; i++) {
                var date = jsonArray[i]['errorDate'].toDateString();
                if (date in crashData) {
                    var count = crashData[date];
                    crashData[date] = count + 1;
                }
                else {
                    crashData[date] = 1;
                }
            }

            crashValues = [];
            for(var dateKey in crashData){
                crashValues.push({x : new Date(dateKey).getTime() , y : crashData[dateKey]});
            }

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    values: crashValues,      //values - represents the array of {x,y} data points
                    key: 'Crashes', //key  - the name of the series.
                    color: '#ff7f0e',  //color - optional: choose your own line color.
                }
            ];
        }

        function createCrashCountPieChart(){
            $scope.pieChart1 = {
                chart: {
                    type: 'pieChart',
                    height: 500,
                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showLabels: true,
                    duration: 500,
                    labelThreshold: 0.01,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    }
                }
            };

            $scope.pieChartData1 = computeCrashCountData();
        }

        function computeCrashCountData() {
            jsonArray = model.jsonReport;
            var errorTypeCountData = {};
            for (var i = 0; i < jsonArray.length; i++) {
                var errorType = jsonArray[i]['errorType'];
                if (errorType in errorTypeCountData) {
                    var count = errorTypeCountData[errorType];
                    errorTypeCountData[errorType] = count + 1;
                }
                else {
                    errorTypeCountData[errorType] = 1;
                }
            }

            defectValues = []; totalCrashCount = 0;
            for(var errorType in errorTypeCountData){
                totalCrashCount += errorTypeCountData[errorType];
                defectValues.push({key : errorType , y : errorTypeCountData[errorType]});
            }

            return defectValues;
        }

        function createCrashPerPieChart(){
            $scope.pieChart2 = {
                chart: {
                    type: 'pieChart',
                    height: 500,
                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showLabels: true,
                    duration: 500,
                    labelThreshold: 0.01,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    }
                }
            };

            $scope.pieChartData2 = computeCrashPerData();
        }

        function computeCrashPerData() {
            var defectCountData = {};
            for (var i = 0; i < jsonArray.length; i++) {
                var defectId = jsonArray[i]['defectId'];
                if (defectId in defectCountData) {
                    var count = defectCountData[defectId];
                    defectCountData[defectId] = count + 1;
                }
                else {
                    defectCountData[defectId] = 1;
                }
            }

            defectValues = []; totalCrashCount = jsonArray.length;
            for(var defectId in defectCountData){
                defectPer = (defectCountData[defectId]/totalCrashCount) * 100;
                defectValues.push({key : defectId + " ("+ defectPer.toFixed(2) +"%)" , y : defectCountData[defectId]});
            }
            unknownCrashCount = defectCountData["Unknown"];
            knownCrashCount = totalCrashCount - unknownCrashCount;
            unknownCrashPer = (unknownCrashCount / totalCrashCount) * 100;

            return defectValues;
        }

        function findFailureRate() {
            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            var firstDate = new Date(model.startDate);
            var secondDate = new Date(model.endDate);

            var runDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
            var jsonArray = model.jsonReport;
            var stableCrashCount = 0; var unstableCrashCount = 0;
            var analyserStableCount = 0; var analyserUnstableCount = 0;
            for (var i = 0; i < jsonArray.length; i++) {
                var hostname = jsonArray[i]['hostname'];
                var instConfig = model.config.InstConfig;
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

        function createFailureRateGraph() {
            $scope.failureRateGraph = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function(e){ console.log("stateChange"); },
                        changeState: function(e){ console.log("changeState"); },
                        tooltipShow: function(e){ console.log("tooltipShow"); },
                        tooltipHide: function(e){ console.log("tooltipHide"); }
                    },
                    xAxis: {
                        axisLabel: 'Instrument Release and Build',
                        tickFormat: function(d) {
                            return model.instBuild[d]
                        },
                        showMaxMin: true,
                        staggerLabels: true
                    },
                    yAxis: {
                        axisLabel: 'Failure Rate',
                        tickFormat: function(d){
                            return d3.format(',.1%')(d/100);
                        },
                        axisLabelDistance: -10
                    }
                }
            };

            $scope.failureRateGraphData = computeFailureRateGraphData();
        }

        function computeFailureRateGraphData() {
            oldReports = model.oldReportData;

            function GetSortOrderReverse(prop) {
                return function(a, b) {
                    if (a[prop] > b[prop]) {
                        return -1;
                    } else if (a[prop] < b[prop]) {
                        return 1;
                    }
                    return 0;
                }
            }
            oldReports.sort(GetSortOrderReverse("startDate"));
            model.build = model.releaseVer.Version;
            model.instBuild = [];
            model.oldReportCount = [];
            startDate = new Date(model.startDate);
            for(var i=0;i<oldReports.length;i++){
                model.oldReportCount.push(new Date(oldReports[i].startDate).toLocaleDateString());
            }
            totalFailureRate = [];
            stableFailureRate = [];
            unstableFailureRate = [];

            if(model.config.Baseline){
                model.instBuild.push("BaseLine");
                totalFailureRate.push({x:0, y:model.config.Baseline.Overall});
                stableFailureRate.push({x:0, y:model.config.Baseline.Stable});
                unstableFailureRate.push({x:0, y:model.config.Baseline.Unstable});
            }

            selOldReportIndex = model.oldReportCount.indexOf(model.selOldReportCount);
            for(var i=0;i<=selOldReportIndex;i++){
                if(model.config.Baseline){
                    model.instBuild.push(oldReports[i].build);
                    totalFailureRate.push({x:i+1, y:oldReports[i].overallFR});
                    stableFailureRate.push({x:i+1, y:oldReports[i].stableFR});
                    unstableFailureRate.push({x:i+1, y:oldReports[i].unstableFR});
                }
                else{
                    model.instBuild.push(oldReports[i].build);
                    totalFailureRate.push({x:i, y:oldReports[i].overallFR});
                    stableFailureRate.push({x:i, y:oldReports[i].stableFR});
                    unstableFailureRate.push({x:i, y:oldReports[i].unstableFR});
                }
            }

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    values: totalFailureRate,      //values - represents the array of {x,y} data points
                    key: 'Overall' //key  - the name of the series.
                },
                {
                    values: stableFailureRate,      //values - represents the array of {x,y} data points
                    key: 'Stable' //key  - the name of the series.
                },
                {
                    values: unstableFailureRate,      //values - represents the array of {x,y} data points
                    key: 'Unstable' //key  - the name of the series.
                }
            ];
        }
    }
})();