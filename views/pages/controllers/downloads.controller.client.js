(function () {
    angular
        .module('Dashboard')
        .controller('DownloadsController', downloadsController);

    function downloadsController($scope, DashboardService, InstrumentDataService) {
        var model = this;
        model.updateReportData = updateReportData;
        model.exportToCSV = exportToCSV;
        model.changeBaseline = changeBaseline;

        $scope.names = ["GEM5K", "GEM4K", "GWP"];
        $scope.selectedInst = InstrumentDataService;
        if($scope.selectedInst.instType === ""){
            $scope.selectedInst.instType = 'GEM5K';
        }

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
                    console.log(response);
                    if($scope.selectedInst.instType === "GEM5K"){
                        if(response.baseGEM5K){
                            model.baseline = response.baseGEM5K;
                        }
                        else{
                            DashboardService
                                .setBaseLine({baseGEM5K:model.reports[model.reports.length-1].startDate})
                                .success(function (response) {
                                    model.baseline = model.reports[model.reports.length-1].startDate;
                                });
                        }
                    }
                    if($scope.selectedInst.instType === "GEM4K"){
                        if(response.baseGEM4K){
                            model.baseline = response.baseGEM4K;
                        }
                        else{
                            DashboardService
                                .setBaseLine({baseGEM4K:model.reports[model.reports.length-1].startDate})
                                .success(function (response) {
                                    model.baseline = model.reports[model.reports.length-1].startDate;
                                });
                        }
                    }
                    if($scope.selectedInst.instType === "GWP"){
                        if(response.baseGWP){
                            model.baseline = response.baseGWP;
                        }
                        else{
                            DashboardService
                                .setBaseLine({baseGWP:model.reports[model.reports.length-1].startDate})
                                .success(function (response) {
                                    model.baseline = model.reports[model.reports.length-1].startDate;
                                });
                        }
                    }
                })
                .error(function (response) {
                    DashboardService
                        .setBaseLine({baseGEM5K:model.reports[model.reports.length-1].startDate})
                        .success(function (response) {
                            model.baseline = model.reports[model.reports.length-1].startDate;
                        });
                });
        }

        function changeBaseline() {
            if($scope.selectedInst.instType === "GEM5K"){
                DashboardService
                    .setBaseLine({baseGEM5K:model.baseline})
                    .success(function (response) {
                    });
            }
            else if($scope.selectedInst.instType === "GEM4K"){
                DashboardService
                    .setBaseLine({baseGEM4K:model.baseline})
                    .success(function (response) {
                    });
            }
            else if($scope.selectedInst.instType === "GWP"){
                DashboardService
                    .setBaseLine({baseGWP:model.baseline})
                    .success(function (response) {
                    });
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