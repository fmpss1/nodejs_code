"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = require("./server.js")(app);
var routes = require("./routes/routes.js")(app);

var os = require('os');
var cpuCount = os.cpus().length;
var cpuCount_obj = os.cpus().toString();
console.log('Número de CPUs disponíveis: ' + cpuCount);
console.log('Número de CPUs disponíveis: ' + cpuCount_obj);
