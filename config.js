'use strict'


//Dependencies
var express   	 = require("express");
var session   	 = require('express-session');
var morgan   	 = require("morgan");
var bodyParser   = require("body-parser");
var cookieParser = require('cookie-parser');
var router    	 = require('router');
var flash   	 = require('flash');
var pug			 = require('pug');
var app    		 = express();
var cluster  	 = require('cluster');
var http  		 = require('http');
var os   		 = require('os');
var ldap   		 = require('ldapjs');
var assert   	 = require('assert');
var log4js 		 = require('log4js');


//Global configurations
var ip		  	 = '127.0.0.1'; //'localhost'
var port_http    = process.env.PORT || 3000;
var port_ldap    = process.env.PORT || 1389;
var URL_HTTP     = 'http://'+ ip +':'+ port_http;
var URL_LDAP     = 'ldap://'+ ip +':'+ port_ldap;


//Logs
log4js.configure({
	appenders: [ { type: 'console' },
				 { type: 'file', filename: 'logs/logs.txt', category: 'log' }
			   ]});
var logger = log4js.getLogger('log');


//Exports
module.exports.express   	= express;
module.exports.session   	= session;
module.exports.morgan   	= morgan;
module.exports.bodyParser   = bodyParser;
module.exports.cookieParser = cookieParser;
module.exports.router    	= router;
module.exports.flash   	 	= flash;
module.exports.pug			= pug;
module.exports.app    		= app;
module.exports.cluster  	= cluster;
module.exports.http  		= http;
module.exports.os   		= os;
module.exports.ldap   		= ldap;
module.exports.assert   	= assert;
module.exports.logger   	= logger;
module.exports.ip 		 	= ip;
module.exports.port_http 	= port_http;
module.exports.port_ldap 	= port_ldap;
module.exports.URL_HTTP  	= URL_HTTP;
module.exports.URL_LDAP  	= URL_LDAP;
