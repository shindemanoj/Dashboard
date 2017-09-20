module.exports = function (app) {

    var models=require('./model/models.server')();
    require('./services/dash.service.server')(app,models.dashModel);
};