"use strict";

var ip = "localhost";	//127.0.0.1
var port = process.env.PORT || 3000;

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
var routes = require("./routes/routes.js")(app);
 
var server = app.listen(port, ip, function () {
    console.log(`Servidor: Listening on http://${ip}:${port}/`);
});
