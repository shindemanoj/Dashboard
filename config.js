/**
 * Created by manojs on 11-08-2017.
 */
(function(){
    angular
        .module("Dashboard")
        .config(configuration);

    function configuration($routeProvider, $httpProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/json;charset=utf-8';

        $routeProvider

            .when("/overview", {
                templateUrl: "views/templates/overview.view.client.html",
                controller: "OverviewController",
                controllerAs: "model"
            })
            .when("/charts", {
                templateUrl: "views/templates/charts.view.client.html",
                controller: "ChartsController",
                controllerAs: "model"
            })
            .otherwise({
                redirectTo: "/overview"
            });
    }
})();