/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('OverviewController', overviewController);

    function overviewController($http, fCsv, $rootScope, $scope) {
        var model = this;

        model.processData = processData;
        model.cleanData = cleanData;

        function init(){
            $http.get('errorReport210717.csv').success(processData)
                .then(function(response) {
                    createLineGraph();
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
                jsonArr[i]["Error Date"] = new Date(jsonArr[i]["Error Date"]);
                jsonArr[i]["Last Reboot"] = new Date(jsonArr[i]["Last Reboot"]);
            }
            model.jsondata = jsonArr;
            $rootScope.jsondata = jsonArr;
        }

        function createLineGraph() {
            $scope.options = {
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

            $scope.data = computeGraphData();
        }

        function computeGraphData() {
           jsonArray = $rootScope.jsondata;
            var crashData = {};
            for (var i = 0; i < jsonArray.length; i++) {
                var date = jsonArray[i]['Error Date'].toDateString();
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
    }
})();