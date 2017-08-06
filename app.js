"use strict";

var express   		= require("express");
var session   		= require('express-session');
var morgan   		= require("morgan");
var bodyParser  	= require("body-parser");
var cookieParser 	= require('cookie-parser');
var router    		= require('router')
var flash   		= require('flash');
var pug				= require('pug');
var app    			= express();
var cluster  		= require('cluster');
var http  			= require('http');
var os   			= require('os');
var ldap   			= require('ldapjs');
var assert   		= require('assert');

var ip			= '127.0.0.1'; //'localhost'
var port_http	= process.env.PORT || 3000;
var port_ldap 	= process.env.PORT || 1389;
var URL_HTTP 	= 'http://'+ ip +':'+ port_http;
var URL_LDAP 	= 'ldap://'+ ip +':'+ port_ldap;

//Ainda não está a funcionar, por causa das single quotes
var SerdidorDaEquipa = 'SerdidorDaEquipa.js';

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
//app.set('view engine', 'jade');
app.set('view engine', 'pug');
app.set('view options', { layout: false });

var Ldap = require("./module_master/ldap.js");
var server_ldap = ldap.createServer();
var LDAP = new Ldap(ldap, server_ldap);

var Cluster = require("./module_scale/cluster.js");
var cluster = new Cluster (logger, app, server_ldap, URL_HTTP, URL_LDAP, os, cluster, http);

var Proxy = require("./module_master/proxy.js");
var proxy = new Proxy (logger, app, ldap, URL_LDAP, assert);


/*
setInterval(function () {
	//Clear terminal/console in loop
	console.log('\x1Bc');
	logger.info('\nPlataforma: ' + process.platform + ' | ' + repository_location_pwd() +
		'\nNúmero de CPUs disponíveis: ' + os.cpus().length +
		'\n--- PROXY ---\n' +
		'Equipas e utilizadores registadas: ' +
		getDBTeamsCount() + '\n' + getDBTeams() +
		'\n--- SCALE ---\n' +
		'Processo PID do app: ' + process.pid + '\nNúmero de child PIDs: ' +
		getDBChildrenCount() + '\n' + getDBChildren());
}, 50000);

function repository_location_pwd(){
	var exec = require('child_process').exec;
	exec('pwd', function(err,stdout,stderr){
		logger.info(stdout);
	});
}

*/







/*
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

*/



//Tentar pôr esta função dentro do ficheiro proxy.js, faz mais sentido
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
