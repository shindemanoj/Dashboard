module.exports = function() {
    var mongoose = require("mongoose");
    var DashSchema = mongoose.Schema({
        reportData: JSON,
        dateCreated: {type:Date, default: Date.now()}
    }, {collection: "dashboard.reports"});
    return DashSchema;
};