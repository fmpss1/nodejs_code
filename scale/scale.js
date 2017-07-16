"use strict";

class Scale{
	constructor(logger, app, ip, port_server, os, cluster, http, port_routes, ServidorDaEquipa){

		var Cluster = require("../cluster/cluster.js");
		var cluster = new Cluster(logger, app, ip, port_server, os, cluster, http);


		//http://localhost:3000/localhost:3000/start_server
		//app.get("/server_start", function(req, res) {
			//server_start(logger, db_children, port_routes);
			//port_routes++;
//			cluster.on('new_server', function(worker) {
//				port_routes++;
//				console.log('new_server --------------')
//			});
		//});

		//http://localhost:3000/localhost:3000/stop_server
		//	app.get("/server_stop", function(req, res) {
			//server_stop(logger, db_children, port_routes);
		//});
		}
	}
module.exports = Scale;

/*
function server_start(logger, db_children, port_routes) {
	var spawn = require('child_process').spawn;
	var child = spawn('node', ['servers/SerdidorDaEquipa.js', port_routes]);
	var data = {pid: child.pid, port: port_routes, date: Date()};
	db_children.insert( data, function(err, data){});
	logger.info('\nProcesso PID ' + child.pid + ' do servidor no porto ' + port_routes + '\n' + data);

	child.stdin.write('Hello there!');
	
	child.stderr.on('data', function (data) {
		logger.error('\nThere was an error: ' + data);
	});
	child.stdout.on('data', function (data) {
		logger.info('\nWe received a reply: \n' + data);
	});
}

function server_stop(logger, db_children, port_routes){
	if(db_children.length != 0){
		setTimeout(function () {
			logger.warn('Attempt to kill child process')
			//child.kill('SIGINT');
			child.kill('SIGUSR2'); //Parece que em windows não funciona
		}, 5000);

		// Actually kill the child process.
		setTimeout(function () {
			child.kill();
		}, 10000);
	}
}
*/
