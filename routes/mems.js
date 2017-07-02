"use strict";

class MEMS{
	constructor(logger, app, port_routes, ServidorDaEquipa, array_children_pids, array_children_ports){


	//http://localhost:3000/localhost:3000/start_server
	app.get("/start_server", function(req, res) {	
		start_server(logger, port_routes, array_children_pids, array_children_ports);
		port_routes++;
	});

	//http://localhost:3000/localhost:3000/stop_server
	app.get("/stop_server", function(req, res) {
		stop_server(logger, port_routes, array_children_pids, array_children_ports);
	});
	}
}
module.exports = MEMS;


function start_server(logger, port_routes, array_children_pids, array_children_ports){
	var spawn = require('child_process').spawn;
	var child = spawn('node', ['servers/SerdidorDaEquipa.js', port_routes]);
	array_children_pids.push(child.pid);
	array_children_ports.push(port_routes);
	logger.info('\nProcesso PID ' + child.pid + ' do servidor no porto ' + port_routes +
		'\n' + array_children_pids + 
		'\n' + array_children_ports);
	
	child.stdin.write('Hello there!');
	
	child.stderr.on('data', function (data) {
		logger.error('\nThere was an error: ' + data);
	});
	child.stdout.on('data', function (data) {
		logger.info('\nWe received a reply: \n' + data);
	});
}

function stop_server(logger, port_routes, array_children_pids, array_children_ports){
	if(array_children_pids.length != 0){
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
