module.exports = function() {
    var mongoose = require("mongoose");
    var BaseLineSchema = mongoose.Schema({
        id: String,
        baseGEM5K: Date,
        baseGEM4K: Date,
        baseGWP: Date
    }, {collection: "dashboard.baseline"});
    return BaseLineSchema;
};