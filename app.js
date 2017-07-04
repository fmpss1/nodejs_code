"use strict";

var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = require('router')
var flash = require('flash');
var app = express();

var Datastore = require('nedb');
var db_teams = new Datastore({ filename: 'dbs/teams', autoload: true });
var db_children = new Datastore({ filename: 'dbs/children', autoload: true });

var os = require('os');
var cpuCount = os.cpus().length;

var ip = "localhost";	//127.0.0.1
//Esclarecer a questão dos portos ficarem ocupados
var port_server = process.env.PORT || 3000;
var port_routes = process.env.PORT || 5000;
//Ainda não está a funcionar, por causa das single quotes
var SerdidorDaEquipa = 'servers/SerdidorDaEquipa.js';

var log4js = require('log4js');
log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: 'logs/logs.txt', category: 'log' }
	]
});
var logger = log4js.getLogger('log');

app.use(cookieParser());
app.use(morgan('combined'));
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
var Scale = require("./routes/scale.js");

var server = new Server(logger, app ,ip ,port_server);
var proxy = new Proxy(logger, app, db_teams);
var scale = new Scale(logger, app, db_children, port_routes, SerdidorDaEquipa);

setInterval(function () {
	//Clear terminal/console in loop
	console.log('\x1Bc');
	logger.info('\nPlataforma: ' + process.platform + ' | ' + repository_location_pwd() +
		'\nNúmero de CPUs disponíveis: ' + cpuCount +
		'\n--- PROXY ---\n' +
		'Equipas e utilizadores registadas: ' +
		getDBTeamsCount() + '\n' + getDBTeams() +
		'\n--- SCALE ---\n' +
		'Processo PID do app: ' + process.pid + '\nNúmero de child PIDs: ' +
		getDBChildrenCount() + '\n' + getDBChildren());
}, 5000);

function repository_location_pwd(){
	var exec = require('child_process').exec;
	exec('pwd', function(err,stdout,stderr){
		logger.info(stdout);
	});
}

function run(cmd, callback) {
    var spawn = require('child_process').spawn;
    var command = spawn(cmd);
    var result = '';
    command.stdout.on('data', function(data) {
         result += data.toString();
    });
    command.on('close', function(code) {
        return callback(result);
    });
}
run("pwd", function(result) { console.log(result) });

function getDBTeams(){
	db_teams.find({}, function (err, data) {
		logger.info(data);
	});
}

function getDBChildren(){
	db_children.find({}, function (err, data) {
		logger.info(data);
	});
}

//Variável temp para as funções getDBTeamsCount() e getDBChildrenCount().
//Pensar em alternativa.
var temp=-1;
function getDBTeamsCount(){
	db_teams.count({}, function (err, data) {
		temp = data;
	});
	return temp;
}

var tempa=-1;
function getDBChildrenCount(){
	db_children.count({}, function (err, data) {
		tempa = data;
	});
	return tempa;
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
