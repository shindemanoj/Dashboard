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
                templateUrl: "views/pages/templates/overview.view.client.html",
                controller: "OverviewController",
                controllerAs: "model"
            })
            .when("/graphs", {
                templateUrl: "views/pages/templates/graphs.view.client.html",
                controller: "GraphsController",
                controllerAs: "model"
            })
            .when("/charts", {
                templateUrl: "views/pages/templates/charts.view.client.html",
                controller: "ChartsController",
                controllerAs: "model"
            })
            .when("/downloads", {
                templateUrl: "views/pages/templates/downloads.view.client.html",
                controller: "DownloadsController",
                controllerAs: "model"
            })
            .when("/help", {
                templateUrl: "views/pages/templates/help.view.client.html",
                controller: "HelpController",
                controllerAs: "model"
            })
            .otherwise({
                redirectTo: "/overview"
            });
    }
})();