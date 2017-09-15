"use strict";


/** Dependencies */
var express 	= require("express");
var router 		= express.Router();
var morgan 		= require("morgan");
var bodyParser 	= require("body-parser");
var sessions 	= require('client-sessions');
var pug 		= require('pug');
var ldap 		= require('ldapjs');
var assert 		= require('assert');
var app 		= express();

/** Global configurations */
var config = require('./config');

/** Express definition */
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.set('view options', { layout: false });
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Nota: em localhost usar um dos browsers em anónimo
app.use(sessions({
	cookieName: 'session',
	secret: 'example',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));
app.locals.moment = require('moment');

/** Routes to proxy and then to api*/
app.use(require('./module_master/proxy'));

//Ainda não está a funcionar, por causa das single quotes
var SerdidorDaEquipa = 'SerdidorDaEquipa.js';

var Ldap = require('./module_master/ldap');
var server_ldap = ldap.createServer();
var LDAP = new Ldap(ldap, server_ldap);

var Cluster = require('./module_scale/cluster');
var cluster = new Cluster (app, server_ldap);


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
