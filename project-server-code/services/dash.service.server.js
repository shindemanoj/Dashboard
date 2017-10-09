module.exports = function (app,dashModel) {

    app.get("/api/dashboard/:instType", findReports);
    app.post("/api/dashboard", saveReport);
    app.get("/api/getfilenames", getfilenames);

    var fs = require('fs');

    function getfilenames(req, res){
        var path = 'Gem4K';

        fs.readdir(path, function(err, items) {
            res.json(items);
        });
    }

    function saveReport(req, res) {
        var newReport = req.body;
        dashModel
            .saveFile(newReport)
            .then(function (report) {
                res.json(report);
            }, function (err) {
                res.sendStatus(404).send(err);
            });

    }

    function findReports(req, res) {
        var instType = req.params.instType;
        dashModel
            .findReports(instType)
            .then(function (reports) {
                res.json(reports);
            }, function (err) {
                res.sendStatus(500).send(err);
            });

    }

}