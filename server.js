/**
 * Created by manojs on 11-08-2017.
 */
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// configure a public directory to host static content
app.use(express.static(__dirname));

var connectionString = 'mongodb://127.0.0.1:27017/dashboard';
if(process.env.MLAB_USERNAME) {
    connectionString = process.env.MLAB_USERNAME + ":" +
        process.env.MLAB_PASSWORD + "@" +
        process.env.MLAB_HOST + ':' +
        process.env.MLAB_PORT + '/' +
        process.env.MLAB_APP_NAME;
}

var mongoose = require("mongoose");
mongoose.connect(connectionString);

var assignment = require("./project-server-code/app.js");
assignment(app);

var port = process.env.PORT || 80;

app.listen(port);