(function () {
    angular
        .module('Dashboard')
        .controller('DownloadsController', downloadsController);

    function downloadsController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;
        model.exportToCSV = exportToCSV;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }
        $scope.sortType     = 'startDate'; // set the default sort type
        $scope.sortReverse  = true;  // set the default sort order
        $scope.searchTable   = '';     // set the default search/filter term

        function init(){
            DashboardService
                .getAllReports($scope.selectedInst.instType)
                .success(function (response) {
                    model.reports = response;
                    initializeBaseline();
                });
        }
        init();

        function updateReportData() {
            DashboardService
                .getAllReports($scope.selectedInst.instType)
                .success(function (response) {
                    model.reports = response;
                    initializeBaseline();
                });
        }

        function initializeBaseline() {
            DashboardService
                .getBaseLine()
                .success(function (response) {
                    if($scope.selectedInst.instType === "GEM5K"){
                        model.baselineArr = response.baseGEM5K;
                        addCheckedParam();
                    }
                    else if($scope.selectedInst.instType === "GEM4K"){
                        model.baselineArr = response.baseGEM4K;
                        addCheckedParam();
                    }
                    else if($scope.selectedInst.instType === "GWP"){
                        model.baselineArr = response.baseGWP;
                        addCheckedParam();
                    }
            });
        }
        
        function addCheckedParam() {
            var jsonArr = model.reports;
            for(var i=0; i < jsonArr.length; i++) {
                if(model.baselineArr.indexOf(jsonArr[i].startDate) !== -1){
                    jsonArr[i].checked = true;
                }
                else{
                    jsonArr[i].checked = false;
                }
            }
        }
        function exportToCSV(json, reportName) {
            JSONToCSVConvertor(json, reportName, true);
        }

        function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
            //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

            var CSV = '';

            //This condition will generate the Label/Header
            if (ShowLabel) {
                var row = "";

                //This loop will extract the label from 1st index of on array
                for (var index in arrData[0]) {

                    //Now convert each value to string and comma-seprated
                    row += index + ',';
                }

                row = row.slice(0, -1);

                //append Label row with line break
                CSV += row + '\r\n';
            }

            //1st loop is to extract each row
            for (var i = 0; i < arrData.length; i++) {
                var row = "";

                //2nd loop will extract each column and convert it in string comma-seprated
                for (var index in arrData[i]) {
                    row += '"' + arrData[i][index] + '",';
                }

                row.slice(0, row.length - 1);

                //add a line break after each row
                CSV += row + '\r\n';
            }

            if (CSV == '') {
                alert("Invalid data");
                return;
            }

            //Generate a file name
            var fileName = ReportTitle;
            //this will remove the blank-spaces from the title and replace it with an underscore
            fileName = ReportTitle.replace(/ /g,"_");

            //Initialize file format you want csv or xls
            var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

            // Now the little tricky part.
            // you can use either>> window.open(uri);
            // but this will not work in some browsers
            // or you will not get the correct file extension

            //this trick will generate a temp <a /> tag
            var link = document.createElement("a");
            link.href = uri;

            //set the visibility hidden so it will not effect on your web-layout
            link.style = "visibility:hidden";
            link.download = fileName + ".csv";

            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
})();