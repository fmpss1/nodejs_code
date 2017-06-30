"use strict";

var appServer = function(app) {
	
var ip = "localhost";	//127.0.0.1
var port = process.env.PORT || 3000;

var server = app.listen(port, ip, function () {
    console.log(`Servidor: Listening on http://${ip}:${port}/`);
});

}
module.exports = appServer;
