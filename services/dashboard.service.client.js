(function(){
    angular
        .module("Dashboard")
        .factory('DashboardService', dashboardService);

    function dashboardService($http, fCsv) {

        var api = {
            getFileNames: getFileNames,
            readFile: readFile,
            getConfiguration: getConfiguration,
            getReleaseVersion: getReleaseVersion,
            getSaveReport: getSaveReport,
            processData: processData,
            getAllReports: getAllReports,
            getCommonConfig: getCommonConfig
        };
        return api;

        function getFileNames(path) {
            return $http.get('/api/getfilenames/'+path)
        }

        function getAllReports(instType) {
            return $http.get('/api/dashboard/'+instType);
        }
        function getSaveReport(report) {
            return $http.post('/api/dashboard', report);
        }

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            var jsonArr = JSON.parse(jsonStr);
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
            return jsonArr;
        }
        function getConfiguration(instType){
            var url = "";
            if(instType === 'GEM5K')
                url = "Gem5K.properties";
            else if(instType === 'GEM4K')
                url = "Gem4K.properties";
            else
                url = "GWP.properties";
            return $http.get("Properties/"+url);
        }
        function getCommonConfig() {
            return $http.get("Properties/CommonConfig.properties");
        }
        function getReleaseVersion(instType) {
            return $http.get(instType+'/ReleaseVersion');
        }
        function readFile(fileName) {
            return $http.get(fileName);
        }
    }
})();