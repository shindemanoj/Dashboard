module.exports = function () {

    var dashModel = require("./dashboard/dash.model.server")();
    var baseLineModel = require("./dashboard/baseline.model.server")();

    var model = {
        dashModel: dashModel,
        baseLineModel: baseLineModel
    };

    dashModel.setModel(model);
    baseLineModel.setModel(model);
    return model;
};