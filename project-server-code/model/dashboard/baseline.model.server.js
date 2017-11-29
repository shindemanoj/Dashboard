    module.exports = function () {
    var model = null;
    var mongoose = require("mongoose");
    var BaseLineSchema = require('./baseline.schema.server')();
    var BaseLineModel = mongoose.model('BaseLineModel', BaseLineSchema);

    var api = {
        "getBaseLine": getBaseLine,
        "setBaseLine": setBaseLine,
        "setModel":setModel
    };

    return api;

    function getBaseLine() {
        return BaseLineModel.findOne({id:"baseline"});
    }

    function setBaseLine(data) {
        return BaseLineModel.update(
            { id:"baseline"},
            data,
            { upsert: true }
        );
    }

    function setModel(_model) {
        model = _model;
    }
};