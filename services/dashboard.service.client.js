(function(){
    angular
        .module("Dashboard")
        .factory('DashboardService', dashboardService);

    function dashboardService($http) {

        var api = {
            "addComment": addComment,
            // "deleteUser": deleteUser,
            //"updateUser": updateUser,
            // "findEventByCredentials": findEventByCredentials,
            // "findEventById": findEventById,
            // "findEventByUsername": findEventByUsername,
            "getConfiguration": getConfiguration,
            "findCommentsById": findCommentsById
            // "findEventsByZip":findEventsByZip,
            // "findNearByZipCodes": findNearByZipCodes,
            // addParticipant: addParticipant
        };
        return api;

        function getConfiguration(instType){
            var url = "";
            if(instType === 'GEM5K')
                url = "Gem5K.properties";
            else if(instType === 'GEM4K')
                url = "Gem4K.properties";
            else
                url = "GWP.properties";
            return $http.get(url);
        }
        function findCommentsById(eventId) {
            return $http.get("/api/comment/"+eventId);
        }
        function addComment(user, eventId) {
            return $http.post("/api/comment/"+eventId, user);
        }

        // function findEventByUsername(username) {
        //     return $http.get("/api/user?username="+username);
        // }
        //
        // function findEventByCredentials(username, password) {
        //     return $http.get("/api/user?username="+username+"&password="+password);
        // }
        //
        // // function updateUser(userId, newUser) {
        // //     return $http.put("/api/user/"+userId, newUser);
        // // }
        //
        // function findEventById(uid) {
        //     return $http.get("/api/user/"+uid);
        // }
        // function findNearByZipCodes(zipcode){
        //     var key = "js-rqggQX3IUkKVa0ZHDqFQjkn6iUqtNcofCEwtBzcvUWr5XrMARrrbMOh4JIxxVVMx";
        //     var format = "json";
        //     var units = "mile";
        //     var distance = "1";
        //     var urlBase = "https://www.zipcodeapi.com/rest/<api_key>/radius.<format>/<zip_code>/<distance>/<units>";
        //
        //     var url = urlBase.replace("<api_key>", key).replace("<format>", format).replace("<zip_code>", zipcode).replace("<distance>", distance).replace("<units>", units);
        //     return $http.get(url);
        // }



    }
})();