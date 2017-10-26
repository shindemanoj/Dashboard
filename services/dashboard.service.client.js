(function(){
    angular
        .module("Dashboard")
        .factory('DashboardService', dashboardService);

    function dashboardService($http, fCsv) {

        var api = {
            getReport: getReport,
            getFileNames: getFileNames,
            readFile: readFile,
            getConfiguration: getConfiguration,
            getReleaseVersion: getReleaseVersion,
            saveReport: saveReport,
            processData: processData,
            getAllReports: getAllReports
        };
        return api;

        function getReport(reqData) {
            return $http.get('/api/getReport/'+reqData.startDate+'/'+reqData.instType);
        }

        function getFileNames(path) {
            return $http.get('/api/getfilenames/'+path)
        }

        function getAllReports(instType) {
            return $http.get('/api/dashboard/'+instType);
        }
        function saveReport(report) {
            return $http.post('/api/dashboard', report);
        }

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            var jsonArr = JSON.parse(jsonStr);
            var result = [];
            for(var i=0; i < jsonArr.length; i++){
                jsonArr[i]["hostname"] = jsonArr[i]["Hostname (IP)"].replace(/\s/g, '');
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
            for(var i=0; i < jsonArr.length; i++){
                var duplicate = false;
                for(var j=i+1; j < jsonArr.length; j++){
                    if(jsonArr[i].errorDate.getTime() === jsonArr[j].errorDate.getTime() && jsonArr[i].errorType === jsonArr[j].errorType && jsonArr[i].hostname === jsonArr[j].hostname){
                        duplicate = true;
                        break;
                    }
                }
                if(!duplicate){
                    result.push(jsonArr[i]);
                }
            }
            return result;
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
        function getReleaseVersion(instType) {
            return $http.get(instType+'/ReleaseVersion');
        }
        function readFile(fileName) {
            return $http.get(fileName);
        }
    }
})();