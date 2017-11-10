    module.exports = function () {
    var model = null;
    var mongoose = require("mongoose");
    var DashSchema = require('./dash.schema.server')();
    var DashboardModel = mongoose.model('DashModel', DashSchema);

    var api = {
        "getReport": getReport,
        "saveFile": saveReport,
        "findReports":findReports,
        "deleteUser":deleteUser,
        "setModel":setModel
    };

    return api;

    function getReport(reqData) {
        return DashboardModel.findOne({instType:reqData.instType, build: report.build});
    }

    function saveReport(report) {
        return DashboardModel.update(
            { build: report.build, instType: report.instType},
            report,
            { upsert: true }
        );
    }
    function findReports(instType) {
        return DashboardModel.find({instType:instType});
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

    function setModel(_model) {
        model = _model;
    }
};