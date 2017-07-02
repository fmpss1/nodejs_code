"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = require('router')
var flash = require('flash');
var app = express();

var Datastore = require('nedb');
var db = new Datastore({ filename: 'teams_db/users', autoload: true });

var os = require('os');
var cpuCount = os.cpus().length;

var ip = "localhost";	//127.0.0.1
//Esclarecer a questão dos portos ficarem ocupados
var port_server = process.env.PORT || 3000;
var port_routes = process.env.PORT || 5000;
//Ainda não está a funcionar, por causa das single quotes
var SerdidorDaEquipa = 'servers/SerdidorDaEquipa.js';
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

app.use(cookieParser());
app.use(session({ secret: 'example', resave: true, saveUninitialized: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(checkAuth);
app.use(flash());
//app.use(router);	// o npm do router esta instalado, se nao for preciso desinstalar
app.set('view engine', 'jade');
app.set('view options', { layout: false });

var Server = require("./servers/server.js");
var Proxy = require("./routes/proxy.js");
var MEMS = require("./routes/mems.js");

var server = new Server(logger, app ,ip ,port_server);
var proxy = new Proxy(logger, app, db);
var mems = new MEMS(logger, app, port_routes, SerdidorDaEquipa, array_children_pids, array_children_ports);

setInterval(function () {
	//Clear terminal/console in loop
	console.log('\x1Bc');
	logger.info('\nPlataforma: ' + process.platform + ' | ' + repository_location_pwd() +
	//logger.info('\nPlataforma: ' + process.platform + ' | ' +
		'\nNúmero de CPUs disponíveis: ' + cpuCount +
		'\n--- PROXY\n' +
		'Equipas e utilizadores registadas:\n' + getDB(logger) +
		//'Equipas e utilizadores registadas:\n' +
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

/*
var spawn = require('child_process').spawn;
var child = spawn('node', ['-v']);
console.log(child);

function nodejs_version(){
	var exec = require('child_process').exec;
	exec('node -v', function(err,stdout,stderr){
		//console.log(stdout);
		logger.info(stdout);
	});
}
*/

function getDB(logger){
	db.find({}, function (err, data) {
		logger.info(data);
	});
}

//Tentar pôr esta função dentro do ficheiro proxy,js, faz mais sentido
function checkAuth (req, res, next) {
	console.log('checkAuth ' + req.url);

	// don't serve /secure to those not logged in
	// you should add to this list, for each and every secure url
	if (req.url === '/secure' && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
		return;
	}
	next();
}
