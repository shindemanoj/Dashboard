module.exports = function () {

    var dashModel = require("./dashboard/dash.model.server")();

    var model = {
        dashModel: dashModel
    };

    dashModel.setModel(model);

    return model;
};