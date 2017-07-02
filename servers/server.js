"use strict";

class Server{
	
	constructor(logger, app, ip, port){
		app.listen(port, ip, function () {
    		logger.info('\nServidor: Listening on http://'+ ip +':'+ port +'/');
		});
	}
}

module.exports = Server;
