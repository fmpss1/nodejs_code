'use strict'


var log4js 			= require('log4js');

//All global configurations of the project
const ip_proxy		= 'localhost'; //'127.0.0.1' ou '0.0.0.0'
const ip_http_1		= 'localhost'; //'127.0.0.1' ou '0.0.0.0'
const ip_http_2 	= 'localhost'; //'127.0.0.1' ou '0.0.0.0'
const ip_ldap		= 'localhost'; //'127.0.0.1' ou '0.0.0.0'
const ip_w5			= 'localhost'; //'127.0.0.1' ou '0.0.0.0'
const ip_w6			= 'localhost'; //'127.0.0.1' ou '0.0.0.0'
const ip_w7			= 'localhost'; //'127.0.0.1' ou '0.0.0.0'
const ip_w8			= 'localhost'; //'127.0.0.1' ou '0.0.0.0'


//-----------------------------------------------------------------------------------------------Diferents environment
//Using locally to 8 cores (can be used only 5)
const port_proxy 	= process.env.PORT || 3000;
const port_http_1 	= process.env.PORT || 3001;
const port_http_2 	= process.env.PORT || 3002;
const port_ldap 	= process.env.PORT || 1389;
const port_w5	 	= process.env.PORT || 8005;
const port_w6	 	= process.env.PORT || 8006;
const port_w7	 	= process.env.PORT || 8007;
const port_w8	 	= process.env.PORT || 8008;

//Using Cloud9 (only 3 ports available)
//E como vai ser quando se lança outros servidores?
//Não deve haver cores e portos suficientes (limitações c9: https://docs.c9.io/docs/run-an-application)
//const port_proxy 	= process.env.PORT || 8080;
//const port_http_1 	= process.env.PORT || 8081;
//const port_http_1 	= null; //Tem que existir na mesma, porque está no código
//const port_ldap 	= process.env.PORT || 8082;
//-----------------------------------------------------------------------------------------------

//Using locally
const addresses 	= [ { ip: ip_http_1, port: port_http_1 }, { ip: ip_http_2, port: port_http_2 }];
const URL_proxy 	= 'http://'+ ip_proxy  +':'+ port_proxy;
const URL_http_1	= 'http://'+ ip_http_1 +':'+ addresses[0].port;
const URL_http_2	= 'http://'+ ip_http_2 +':'+ addresses[1].port;
const URL_LDAP 		= 'ldap://'+ ip_ldap   +':'+ port_ldap;


//Logs
log4js.configure({
	appenders: [ { type: 'console' },
				 { type: 'file', filename: 'logs/logs.txt', category: 'log' }
			   ]});
var logger = log4js.getLogger('log');


//Exports
module.exports.logger 			= logger;
module.exports.ip_proxy 		= ip_proxy;
module.exports.ip_http_1 		= ip_http_1;
module.exports.ip_http_2		= ip_http_2;
module.exports.ip_ldap 			= ip_ldap;
module.exports.ip_w5 			= ip_w5;
module.exports.ip_w6 			= ip_w6;
module.exports.ip_w7 			= ip_w7;
module.exports.ip_w8 			= ip_w8;
module.exports.port_proxy 		= port_proxy;
module.exports.port_http_1 		= port_http_1;
module.exports.port_http_2		= port_http_2;
module.exports.port_ldap 		= port_ldap;
module.exports.port_w5			= port_w5;
module.exports.port_w6			= port_w6;
module.exports.port_w7			= port_w7;
module.exports.port_w8			= port_w8;
module.exports.addresses 		= addresses;
module.exports.URL_proxy 		= URL_proxy;
module.exports.URL_http_1 		= URL_http_1;
module.exports.URL_http_2 		= URL_http_2;
module.exports.URL_LDAP 		= URL_LDAP;
