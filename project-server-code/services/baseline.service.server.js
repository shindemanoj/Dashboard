module.exports = function (app,baseLineModel) {
    app.get("/api/baseline", getBaseLine);
    app.post("/api/baseLine", setBaseLine);


    function getBaseLine(req, res) {
        baseLineModel
            .getBaseLine()
            .then(function (report) {
                res.json(report);
            }, function (err) {
                res.status(404).send(err);
            });
    }

    function setBaseLine(req, res) {
        var baseData = req.body;
        baseLineModel
            .setBaseLine(baseData)
            .then(function (report) {
                res.json(report);
            }, function (err) {
                res.sendStatus(404).send(err);
            });

    }
};