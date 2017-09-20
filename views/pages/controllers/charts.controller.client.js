(function () {
    angular
        .module('Dashboard')
        .controller('ChartsController', chartsController);

    function chartsController($http, fCsv, $scope, DashboardService, InstrumentDataService) {
        var model = this;

        model.processData = processData;
        model.cleanData = cleanData;
        model.updateReportData = updateReportData;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }
        $scope.sortType     = 'Id'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order
        $scope.searchTable   = '';     // set the default search/filter term
        $http.get('errorReport210717.csv').success(processData)
            .then(function(response) {
                $scope.tableData = model.jsondata;
            });

        function init(){
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (response) {
                    console.log(response);
                })
        }
        init();

        function updateReportData() {
            DashboardService
                .getConfiguration($scope.selectedInst.instType)
                .success(function (response) {
                    console.log(response);
                })
        }

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            model.jsondata = JSON.parse(jsonStr);
            cleanData(model.jsondata);
        };

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
                    jsonArr[i]["defectId"] = "CR " + commentArr[commentArr.length-1];
                    jsonArr[i]["Screenshot"] = commentArr[1];
                }
                jsonArr[i]["errorDate"] = new Date(jsonArr[i]["errorDate"]);
                jsonArr[i]["lastReboot"] = new Date(jsonArr[i]["lastReboot"]);
            }
            model.jsondata = jsonArr;
        }
    }
})();