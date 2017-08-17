/**
 * Created by manojs on 11-08-2017.
 */
(function () {
    angular
        .module('Dashboard')
        .controller('OverviewController', overviewController);

    function overviewController($http, fCsv, $rootScope) {
        var model = this;

        model.processData = processData;

        function init(){
            $http.get('errorReport210717.csv').success(processData);
        }
        init();

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            $rootScope.jsondata = JSON.parse(jsonStr);
            model.jsondata = $rootScope.jsondata;
        };
    }
})();