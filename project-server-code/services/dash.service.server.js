module.exports = function (app,dashModel) {


    app.get("/api/user", findUser);
    app.get("/api/dashboard/:instType", findReports);
    app.put("/api/user/:userId", updateUser);
    app.delete("/api/user/:userId", deleteUser);
    app.post("/api/dashboard", saveReport);
    app.get('/api/allUsers', findAllUsers);


    function findAllUsers(req, res) {
        dashModel
            .findAllUsers()
            .then(function (users) {
                res.json(users);
            }, function (err) {
                res.sendStatus(404).send(err);
            });
    }

    function deleteUser(req, res) {
        var userId = req.params.userId;
        dashModel
            .deleteUser(userId)
            .then(function (response) {
                res.sendStatus(200);
            }, function (err) {
                res.sendStatus(404);
            });
    }


    function saveReport(req, res) {
        var newReport = req.body;
        dashModel
            .saveFile(newReport)
            .then(function (report) {
                res.json(report);
            }, function (err) {
                res.sendStatus(404).send(err);
            });

    }

    function updateUser(req, res) {
        var userId = req.params['userId'];
        var newUser = req.body;
        dashModel
            .updateUser(userId, newUser)
            .then(function (response) {
                if (response.nModified === 1) {
                    // Update was successful
                    dashModel
                        .findUserById(userId)
                        .then(function (response) {
                            res.json(response);
                        }, function () {
                            res.sendStatus(404);
                        })
                }
                else {
                    res.sendStatus(404);
                }
            }, function () {
                res.sendStatus(404);
            });
    }

    function findReports(req, res) {
        var instType = req.params.instType;
        dashModel
            .findReports(instType)
            .then(function (reports) {
                res.json(reports);
            }, function (err) {
                res.sendStatus(500).send(err);
            });

    }

    function findUser(req, res) {
        var username = req.query['username'];
        var password = req.query['password'];
        if (username && password) {
            findUserByCredentials(req, res);
        } else if (username) {
            findUserByUsername(req, res);
        }
    }

    function findUserByUsername(req, res) {
        var username = req.query.username;
        dashModel
            .findUserbyUsername(username)
            .then(function (user) {
                if (user != null) {
                    res.json(user);
                }
                else {
                    res.sendStatus(404);
                }
            }, function (err) {
                res.sendStatus(404);
            });
    }

    function findUserByCredentials(req, res) {
        var username = req.query['username'];
        var password = req.query['password'];
        dashModel
            .findUserByCredentials(username, password)
            .then(function (response) {
                if (response.length != 0) {
                    res.json(response[0]);
                }
                else {
                    res.sendStatus(404);
                }
            }, function (err) {
                res.sendStatus(404);
            });
    }
}