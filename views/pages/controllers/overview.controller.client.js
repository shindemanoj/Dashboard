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

            $scope.data = sinAndCos();
        }
        init();

        /*Random Data Generator */
        function sinAndCos() {
            $http.get('errorReport210717.csv').success(processData);
            var sin = [],sin2 = [],
                cos = [];

            //Data is represented as an array of {x,y} pairs.
            for (var i = 0; i < 100; i++) {
                sin.push({x: i, y: Math.sin(i/10)});
                sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5});
                cos.push({x: i, y: .5 * Math.cos(i/10+ 2) + Math.random() / 10});
            }

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    key: "Cumulative Return",
                    values: [
                        {
                            "label" : "A" ,
                            "value" : -29.765957771107
                        } ,
                        {
                            "label" : "B" ,
                            "value" : 0
                        } ,
                        {
                            "label" : "C" ,
                            "value" : 32.807804682612
                        } ,
                        {
                            "label" : "D" ,
                            "value" : 196.45946739256
                        } ,
                        {
                            "label" : "E" ,
                            "value" : 0.19434030906893
                        } ,
                        {
                            "label" : "F" ,
                            "value" : -98.079782601442
                        } ,
                        {
                            "label" : "G" ,
                            "value" : -13.925743130903
                        } ,
                        {
                            "label" : "H" ,
                            "value" : -5.1387322875705
                        }
                    ]
                }
            ];
        }

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            $rootScope.jsondata = JSON.parse(jsonStr);
            model.jsondata = $rootScope.jsondata;
            cleanData(model.jsondata);
        }

        function cleanData(jsonArr){
            for(var i=0; i < jsonArr.length; i++){
                jsonArr[i]["Error Date"] = new Date(jsonArr[i]["Error Date"]);
                jsonArr[i]["Last Reboot"] = new Date(jsonArr[i]["Last Reboot"]);
            }
            model.jsondata = jsonArr;
        }
    }
})();