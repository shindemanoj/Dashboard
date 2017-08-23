(function () {
    angular
        .module('Dashboard')
        .controller('ChartsController', chartsController);

    function chartsController($http, fCsv, $rootScope, NgTableParams) {
        var model = this;

        model.processData = processData;
        model.cleanData = cleanData;

        var data = [{name: "Moroni", age: 50}, {name: "Moroni", age: 50}];
        model.tableParams = new NgTableParams({}, { dataset: data});

        function init(){
            if($rootScope.jsondata){
                model.jsondata = $rootScope.jsondata;
                cleanData(model.jsondata);
            }
            else{
                $http.get('errorReport210717.csv').success(processData);
            }
        }
        init();

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            model.jsondata = JSON.parse(jsonStr);
            cleanData(model.jsondata);
        };

        function cleanData(jsonArr){
            for(var i=0; i < jsonArr.length; i++){
                if(jsonArr[i].Comments.includes("Unknown")){
                    jsonArr[i]["Defect Id"] = "Unknown";
                    jsonArr[i]["Screenshot"] = "NA";
                }
                else {
                    var commentArr = jsonArr[i].Comments.split(" ");
                    jsonArr[i]["Defect Id"] = "CR " + commentArr[commentArr.length-1];
                    jsonArr[i]["Screenshot"] = commentArr[1];
                }
                jsonArr[i]["Error Date"] = new Date(jsonArr[i]["Error Date"]);
                jsonArr[i]["Last Reboot"] = new Date(jsonArr[i]["Last Reboot"]);
            }
            model.jsondata = jsonArr;
            $rootScope.jsondata = jsonArr;
        }
    }
})();