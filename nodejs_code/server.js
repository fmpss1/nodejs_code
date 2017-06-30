"use strict";

class Server{
	
	constructor(app, ip, port){
		app.listen(port, ip, function () {
    		console.log(`Servidor: Listening on http://${ip}:${port}/`);
		});
	}
}

module.exports = Server;
