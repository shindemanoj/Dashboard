module.exports = function (app,dashModel) {

    app.get("/api/dashboard/:instType", findReports);
    app.post("/api/dashboard", saveReport);
    app.get("/api/getfilenames/:path", getfilenames);
    app.get("/api/getReport/:startDate/:instType", getReport);

    var fs = require('fs');

    function getfilenames(req, res){
        var path = req.params.path;

        fs.readdir(path, function(err, items) {
            res.json(items);
        });
    }

    function getReport(req, res) {
        var reqData = {
            startDate: req.params.startDate,
            instType: req.params.instType
        };
        dashModel
            .getReport(reqData)
            .then(function (report) {
                res.json(report);
            }, function (err) {
                res.status(404).send(err);
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