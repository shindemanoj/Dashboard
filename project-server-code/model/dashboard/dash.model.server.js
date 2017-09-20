    module.exports = function () {
    var model = null;
    var mongoose = require("mongoose");
    var DashSchema = require('./dash.schema.server')();
    var DashboardModel = mongoose.model('DashModel', DashSchema);

    var api = {
        "saveFile": saveReport,
        "findReports":findReports,
        "findUserbyUsername":findUserbyUsername,
        "findUserByCredentials":findUserByCredentials,
        "deleteUser":deleteUser,
        "updateUser":updateUser,
        "findAllUsers": findAllUsers,
        "setModel":setModel,
        "findUserByGoogleId":findUserByGoogleId,
        "findUserByFacebookId": findUserByFacebookId

    };

    return api;

        function findUserByFacebookId(facebookId) {
            return DashboardModel.findOne({'facebook.id': facebookId});
        }
        function findUserByGoogleId(googleId) {
            return DashboardModel.findOne({'google.id': googleId});
        }

    function findAllUsers() {
        return DashboardModel.find().sort({dateCreated:-1});
    }

    function saveReport(report) {
        return DashboardModel.create(report);
    }
    function findReports(instType) {
        return DashboardModel.find({instType:instType});
    }
    function findUserbyUsername(username) {
        return DashboardModel.findOne({"username":username});
    }
    function findUserByCredentials(_username, _password) {
        return DashboardModel.find({username:_username, password: _password});
    }

    function deleteUser(userId) {
        return model.eventModel.findEventsbyCreator(userId)
            .then(function (events) {
                var eventsForUser = events;
                return deleteAll(eventsForUser, userId);
            }, function (err) {
                return err;
            });
    }

    function deleteAll(events, userId) {
        if(events.length == 0){
            return findUserById(userId)
                .then(function (user) {
                    return model.commentModel.deleteCommentByUserName(user.username)
                        .then(function (res) {
                                return model.eventModel.findEventByPerticipants(user.username)
                                    .then(function (participatedEvents) {
                                            return spliceUserFromEvents(participatedEvents, user);
                                        },
                                        function (err) {
                                            return err;
                                        });
                            },
                            function (err) {
                                return err;
                            });
                    },
                    function (err) {
                        return err;
                    });
        }
        model.eventModel.deleteEvent(events.shift()._id)
            .then(function (res) {
                return deleteAll(events, userId);
            }, function (err) {
                return err;
            });
    }

    function spliceUserFromEvents(events, user) {
        if(events.length == 0){
            return DashboardModel.remove({_id:user._id})
                .then(function (response) {
                        return response;
                    },
                    function (err) {
                        return err;
                    });

        }
        model.eventModel.findEventById(events.shift()._id)
            .then(function (event) {
                event.participants.splice(event.participants.indexOf(user.username), 1);
                event.save();
                return spliceUserFromEvents(events, user);
            }, function (err) {
                return err;
            });
    }

    function updateUser(userId, updatedUser) {
        return DashboardModel.update({_id:userId},{$set:updatedUser});
    }
    function setModel(_model) {
        model = _model;
    }
};