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

var port = process.env.PORT || 3000;

app.listen(port);