'use strict'

//All dependencies of the project
var express 		= require("express");
var session 		= require('express-session');
var morgan 			= require("morgan");
var bodyParser 		= require("body-parser");
var cookieParser 	= require('cookie-parser');
var router 			= require('router');
var flash 			= require('flash');
var pug 			= require('pug');
var app 			= express();
var cluster 		= require('cluster');
var http 			= require('http');
var httpProxy 		= require('http-proxy');
var os 				= require('os');
var ldap 			= require('ldapjs');
var assert 			= require('assert');
var log4js 			= require('log4js');
var path 			= require('path');
var fs 				= require('fs');


//All global configurations of the project
const ip 			= '127.0.0.1'; //'localhost'
const port_proxy 	= process.env.PORT || 3000;
const port_http_1 	= process.env.PORT || 3001;
const port_http_2 	= process.env.PORT || 3002;
const port_ldap 	= process.env.PORT || 1389;
const addresses 	= [ { ip: ip, port: port_http_1 }, { ip: ip, port: port_http_2 }];
const URL_proxy 	= 'http://'+ ip +':'+ port_proxy;
const URL_http_1	= 'http://'+ ip +':'+ addresses[0].port;
const URL_http_2	= 'http://'+ ip +':'+ addresses[1].port;
const URL_LDAP 		= 'ldap://'+ ip +':'+ port_ldap;


//Logs
log4js.configure({
	appenders: [ { type: 'console' },
				 { type: 'file', filename: 'logs/logs.txt', category: 'log' }
			   ]});
var logger = log4js.getLogger('log');


//Exports
module.exports.express 			= express;
module.exports.session 			= session;
module.exports.morgan 			= morgan;
module.exports.bodyParser 		= bodyParser;
module.exports.cookieParser 	= cookieParser;
module.exports.router 			= router;
module.exports.flash 			= flash;
module.exports.pug 				= pug;
module.exports.app 				= app;
module.exports.cluster 			= cluster;
module.exports.http 			= http;
module.exports.httpProxy 		= httpProxy;
module.exports.os 				= os;
module.exports.ldap 			= ldap;
module.exports.assert 			= assert;
module.exports.logger 			= logger;
module.exports.path 			= path;
module.exports.fs 				= fs;
module.exports.ip 				= ip;
module.exports.port_proxy 		= port_proxy;
module.exports.port_http_1 		= port_http_1;
module.exports.port_http_2		= port_http_2;
module.exports.port_ldap 		= port_ldap;
module.exports.addresses 		= addresses;
module.exports.URL_proxy 		= URL_proxy;
module.exports.URL_http_1 		= URL_http_1;
module.exports.URL_http_2 		= URL_http_2;
module.exports.URL_LDAP 		= URL_LDAP;
