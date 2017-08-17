(function () {
    angular
        .module('Dashboard')
        .controller('ChartsController', chartsController);

    function chartsController($http, fCsv, $rootScope) {
        var model = this;

        model.processData = processData;

        function init(){
            if($rootScope.jsondata){
                model.jsondata = $rootScope.jsondata;
            }
            else{
                $http.get('errorReport210717.csv').success(processData);
            }
        }
        init();

        function processData(allText) {
            var jsonStr = fCsv.toJson(allText);
            $rootScope.jsondata = JSON.parse(jsonStr);
            model.jsondata = $rootScope.jsondata;
        };
    }
})();