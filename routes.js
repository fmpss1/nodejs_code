"use strict";

var appRouter = function(app) {
//var SerdidorDaEquipa = require('./SerdidorDaEquipa.js');
var port = process.env.PORT || 4000;

//localhost:3000/
app.get("/", function(req, res) {
    res.send("API: <br><br> http://localhost:3000/account <br> http://localhost:3000/new_server <br> http://localhost:3000/stop_server");
	console.log("\n Novo acesso -> " + Date());
	//Nota: só quando se muda de browser é que o porto de origem muda.
	console.log(' *** [Client] User remote address and port ' + req.connection.remoteAddress +':'+ req.connection.remotePort);
	console.log(' *** [Server] User local  address and port ' + req.connection.localAddress +':'+ req.connection.localPort);
});

//localhost:3000/account?username=nraboy
//localhost:3000/account?username=test
app.get("/account", function(req, res) {
    var accountMock = {
        "username": "nraboy",
        "password": "1234",
        "twitter": "@nraboy"
    }
	var accountTest = {
        "username": "test",
        "password": "test",
        "twitter": "@test"
    }
    if(!req.query.username) {
        return res.send({"status": "error", "message": "missing username"});
    } else if(req.query.username == accountMock.username){
        return res.send(accountMock);
	} else if(req.query.username == accountTest.username){
        return res.send(accountTest);
    } else {
		return res.send({"status": "error", "message": "wrong username"});
	}
});

//localhost:3000/new_server
app.get("/new_server", function(req, res) {	
	//res.send("Teste novo servidor");
	var cp = require('child_process');
	var start_new_server_cmd = "node routes/SerdidorDaEquipa.js " + port + "";
	//localhost:4000/ exemplo
	cp.execSync('start cmd.exe /k "'+ start_new_server_cmd +'"');
	port++;
});

app.get("/stop_server", function(req, res) {	
	let object = new SerdidorDaEquipa ('Teste desliga servidor');
	console.log(object);
	res.send("Teste desliga servidor");
});

//localhost:3000/account?username=test?password=test?twitter=@test
app.post("/account", function(req, res) {
    if(!req.body.username || !req.body.password || !req.body.twitter) {
        return res.send({"status": "error", "message": "missing a parameter"});
    } else {
        return res.send(req.body);
    }
});

}
module.exports = appRouter;