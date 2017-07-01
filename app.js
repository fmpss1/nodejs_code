"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var os = require('os');
var cpuCount = os.cpus().length;

var ip = "localhost";	//127.0.0.1
var port_server = process.env.PORT || 3000;
var port_routes = process.env.PORT || 5000; //Esclarecer a questão dos portos ficarem ocupados
var SerdidorDaEquipa = 'routes/SerdidorDaEquipa.js';	//Ainda não está a funcionar (single quotes)
var array_children_pids = [];
var array_children_ports = [];

var log4js = require('log4js');
log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: 'logs/logs.txt', category: 'log' }
	]
});
var logger = log4js.getLogger('log');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Server = require("./server.js");
var Routes = require("./routes/routes.js");

var server = new Server(logger, app ,ip ,port_server);
var routes = new Routes(logger, app, port_routes, SerdidorDaEquipa, array_children_pids, array_children_ports);

setInterval(function () {
	
	//Clear terminal/console in loop
	console.log('\x1Bc');
	logger.info('\nPlataforma: ' + process.platform + ' | ' + repository_location_pwd() +
		'\nNúmero de CPUs disponíveis: ' + cpuCount +
		'\n--- PROXY\n' +
		'\n--- MEMS\n' +
		'Processo PID do app: ' + process.pid + '\nNúmero de child PIDs: ' + array_children_pids.length);
	array_children_pids.forEach(function(i){
		logger.info('* Servidor ' + i);
	});

}, 5000);

//Não está a funcionar como pretendido, perceber porque.
function repository_location_pwd(){
	var exec = require('child_process').exec;
	exec('pwd', function(err,stdout,stderr){
		//console.log(stdout);
		logger.info(stdout);
	});
}