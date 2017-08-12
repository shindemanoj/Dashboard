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

            .when("/dashboard", {
                templateUrl: "views/templates/dashboard.view.client.html",
                controller: "DashController",
                controllerAs: "model"
            })
            .otherwise({
                redirectTo: "/dashboard"
            });
    }
})();