/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('DashController', dashController);

    function dashController($http) {
        var model = this;

        model.readCSV = readCSV;
        model.processData = processData;

        function init(){

        }
        init();

        function readCSV() {
            $http.get('errorReport210717.csv').success(processData);
        };

        function processData(allText) {
            var allTextLines = allText.split(/\r\n|\n/);
            var headers = allTextLines[0].split(',');
            var lines = [];

            for ( var i = 0; i < allTextLines.length; i++) {
                // split content based on comma
                var data = allTextLines[i].split(',');
                if (data.length == headers.length) {
                    var tarr = [];
                    for ( var j = 0; j < headers.length; j++) {
                        tarr.push(data[j]);
                    }
                    lines.push(tarr);
                }
            }
            model.data = lines;
        };
    }
})();