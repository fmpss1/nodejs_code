"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var ip = "localhost";	//127.0.0.1
var port_server = process.env.PORT || 3000;
var port_routes = process.env.PORT || 5000;
var SerdidorDaEquipa = 'routes/SerdidorDaEquipa.js';	//Ainda não está a funcionar (single quotes)
var array_children_pids = [];
var array_children_ports = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Server = require("./server.js");
var Routes = require("./routes/routes.js");

var server = new Server(app,ip,port_server);
var routes = new Routes(app,port_routes,SerdidorDaEquipa,array_children_pids,array_children_ports);

setInterval(function () {
	
	//Clear terminal/console in loop
	console.log('\x1Bc');

	var os = require('os');
	var cpuCount = os.cpus().length;
	console.log('Plataforma: ' + process.platform + '\nNúmero de CPUs disponíveis: ' + cpuCount);
	console.log('\n--- PROXY\n');

	console.log('\n--- MEMS');
	console.log('Processo PID do app: ' + process.pid + '\nNúmero de child PIDs: ' + array_children_pids.length);
	array_children_pids.forEach(function(i){
		console.log('* Servidor ' + i);
	});
	
	//var exec = require('child_process').exec;
	//exec('ls', function(err,stdout,stderr){
	//	console.log(stdout);
	//});

}, 5000);
