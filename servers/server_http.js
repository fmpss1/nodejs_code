"use strict";

class Server{

	constructor(logger, app, ip, port_server){
		//var = clients = [];
		//sys.puts(sys.inspect(req));

		var server = app.listen(port_server, ip, function () {
    		logger.info('\nServidor: Listening on http://'+ ip +':'+ port +'/');
		});


/*
		setTimeout(function () {
			console.log('teste close__________________');
			
			//Termina o servidor, mas a aplicação continua a funcionar
			server.close();

			//Termina com tudo
			//process.exit();
		}, 5000);

		
		server.close( function() {
		//clients.push(socket);
		console.log('Termina conexões');
		});
	}

*/


/*
	server.on('connection', function(socket)){
		//clients.push(socket);
		console.log('client connect, count: ');
		//console.log('client connect, count: ', clients.length);
*/
	}
}
module.exports = Server;
