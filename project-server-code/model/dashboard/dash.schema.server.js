module.exports = function() {
    var mongoose = require("mongoose");
    var DashSchema = mongoose.Schema({
        reportData: JSON,
        build: String,
        instType: String,
        overallFR: Number,
        stableFR: Number,
        unstableFR: Number,
        startDate: Date,
        endDate: Date,
        config: JSON
    }, {collection: "dashboard.reports"});
    return DashSchema;
};