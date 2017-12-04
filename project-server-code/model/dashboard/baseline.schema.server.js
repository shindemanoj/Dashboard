module.exports = function() {
    var mongoose = require("mongoose");
    var BaseLineSchema = mongoose.Schema({
        id: String,
        baseGEM5K: [{type: Date}],
        baseGEM4K: [{type: Date}],
        baseGWP: [{type: Date}]
    }, {collection: "dashboard.baseline"});
    return BaseLineSchema;
};