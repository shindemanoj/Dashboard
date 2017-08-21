/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('LineGraphController', lineGraphController);

    function lineGraphController($rootScope, $scope) {
        var model = this

        model.computeGraphData = computeGraphData;

        function init(){
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
                        return d3.format(',.4f')(d);
                    },
                    duration: 500,
                    xAxis: {
                        axisLabel: 'X Axis'
                    },
                    yAxis: {
                        axisLabel: 'Y Axis',
                        axisLabelDistance: -10
                    }
                }
            };

            $scope.data = computeGraphData();
        }
        init();

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

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    key: "Crashes by Day",
                    values: crashValues
                }
            ];
        }
    }
})();