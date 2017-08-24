/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('OverviewController', overviewController);

    function overviewController($http, fCsv, $scope) {
        var model = this;

        model.processData = processData;
        model.cleanData = cleanData;

        function init(){
            $http.get('errorReport210717.csv').success(processData)
                .then(function(response) {
                    createLineGraph();
                    createCrashCountPieChart();
                    createCrashPerPieChart();
                });
        }
        init();

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            model.jsondata = JSON.parse(jsonStr);
            cleanData(model.jsondata);
        }

        function cleanData(jsonArr){
            for(var i=0; i < jsonArr.length; i++){
                jsonArr[i]["hostname"] = jsonArr[i]["Hostname (IP)"];
                delete jsonArr[i]["Hostname (IP)"];
                jsonArr[i]["errorType"] = jsonArr[i]["Error Type"];
                delete jsonArr[i]["Error Type"];
                jsonArr[i]["errorDate"] = jsonArr[i]["Error Date"];
                delete jsonArr[i]["Error Date"];
                jsonArr[i]["lastReboot"] = jsonArr[i]["Last Reboot"];
                delete jsonArr[i]["Last Reboot"];

                if(jsonArr[i].Comments.includes("Unknown")){
                    jsonArr[i]["defectId"] = "Unknown";
                    jsonArr[i]["Screenshot"] = "NA";
                }
                else {
                    var commentArr = jsonArr[i].Comments.split(" ");
                    jsonArr[i]["defectId"] = "CR " + commentArr[commentArr.length-1];
                    jsonArr[i]["Screenshot"] = commentArr[1];
                }
                jsonArr[i]["errorDate"] = new Date(jsonArr[i]["errorDate"]);
                jsonArr[i]["lastReboot"] = new Date(jsonArr[i]["lastReboot"]);
            }
            model.jsondata = jsonArr;
        }

        function createLineGraph() {
            $scope.lineGraph = {
                chart: {
                    type: 'discreteBarChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 55
                    },
                    x: function(d){return d.label;},
                    y: function(d){return d.value + (1e-10);},
                    showValues: true,
                    valueFormat: function(d){
                        return d3.format(',.0f')(d);
                    },
                    duration: 500,
                    xAxis: {
                        axisLabel: 'Date'
                    },
                    yAxis: {
                        axisLabel: 'Number of Crashes',
                        axisLabelDistance: -10
                    }
                }
            };

            $scope.lineGraphData = computeGraphData();
        }

        function computeGraphData() {
           jsonArray = model.jsondata;
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
                crashValues.push({"label" : dateKey , "value" : crashData[dateKey]});
            }

            return [
                {
                    key: "Crashes by Day",
                    values: crashValues
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
            jsonArray = model.jsondata;
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
                defectValues.push({key : defectId , y : (defectCountData[defectId]/totalCrashCount) * 100});
            }
            unknownCrashCount = defectCountData["Unknown"];
            knownCrashCount = totalCrashCount - unknownCrashCount;
            unknownCrashPer = (unknownCrashCount / totalCrashCount) * 100;

            model.totalCrashCount = totalCrashCount;
            model.knownCrashCount = knownCrashCount;
            model.unknownCrashCount = unknownCrashCount;
            return defectValues;
        }
    }
})();