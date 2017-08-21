"use strict";

/** Global configurations */
var config = require('./config')
var app = config.app;

/** Express definition */
app.set('config', config);
app.set('views', __dirname + '/views')
app.set('view engine', 'pug');
app.set('view options', { layout: false });
app.use(config.cookieParser());
app.use(config.morgan('combined'));
app.use(config.session({ secret: 'example', resave: true, saveUninitialized: true }));
app.use(config.bodyParser.json());
app.use(config.bodyParser.urlencoded({ extended: true }));
app.locals.moment = require('moment');
app.use(config.flash());

/** Routes to proxy */
app.use(require('./module_master/proxy'));

//Ainda não está a funcionar, por causa das single quotes
var SerdidorDaEquipa = 'SerdidorDaEquipa.js';

var Ldap = require("./module_master/ldap.js");
var server_ldap = config.ldap.createServer();
var LDAP = new Ldap(config.ldap, server_ldap);

var Cluster = require("./module_scale/cluster.js");
var cluster = new Cluster (server_ldap);


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
