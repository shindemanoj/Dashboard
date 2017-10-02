module.exports = function() {
    var mongoose = require("mongoose");
    var DashSchema = mongoose.Schema({
        reportData: JSON,
        build: String,
        instType: String,
        overallFR: Number,
        stableFR: Number,
        unstableFR: Number,
        releaseData: JSON,
        dateCreated: {type:Date, default: Date.now()}
    }, {collection: "dashboard.reports"});
    return DashSchema;
};