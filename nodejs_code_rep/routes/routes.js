"use strict";

var array_childs_pids = ['1'];
var array_childs_ports = ['1'];
module.exports = array_childs_pids;
module.exports = array_childs_ports;


var appRouter = function(app) {
var SerdidorDaEquipa = "routes/SerdidorDaEquipa.js";
var port = process.env.PORT || 4000;


//http://localhost:3000/localhost:3000/
app.get("/", function(req, res) {
    res.send("API: <br><br> http://localhost:3000/account <br> http://localhost:3000/start_server <br> http://localhost:3000/stop_server");
	console.log("\n Novo acesso -> " + Date());
	//Nota: só quando se muda de browser é que o porto de origem muda.
	console.log(' *** [Client] User remote address and port ' + req.connection.remoteAddress +':'+ req.connection.remotePort);
	console.log(' *** [Server] User local  address and port ' + req.connection.localAddress +':'+ req.connection.localPort);
});

//http://localhost:3000/localhost:3000/account?username=nraboy
//http://localhost:3000/localhost:3000/account?username=test
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

//http://localhost:3000/localhost:3000/start_server
app.get("/start_server", function(req, res) {	
	start_server(port);
	port++;
});

//http://localhost:3000/localhost:3000/stop_server
app.get("/stop_server", function(req, res) {
	stop_server(port);
});

//http://localhost:3000/localhost:3000/account?username=test?password=test?twitter=@test
app.post("/account", function(req, res) {
    if(!req.body.username || !req.body.password || !req.body.twitter) {
        return res.send({"status": "error", "message": "missing a parameter"});
    } else {
        return res.send(req.body);
    }
});

}
module.exports = appRouter;


function start_server(port){
	var spawn = require('child_process').spawn;
	var child = spawn('node', ['routes/SerdidorDaEquipa.js', port]);
	array_childs_pids.push(child.pid);
	array_childs_ports.push(port);
	console.log('\nProcesso PID ' + child.pid + ' do servidor no porto ' + port);
	console.log(array_childs_pids);
	console.log(array_childs_ports);
	
	child.stdin.write('Hello there!');
	
	child.stderr.on('data', function (data) {
		console.log('There was an error: ' + data);
	});
	child.stdout.on('data', function (data) {
		console.log('We received a reply: \n' + data);
	});
	child.stderr.on('data', function (data) {
		console.log('There was an error: ' + data);
	});
}

function stop_server(port){
	
	//Testar primeiro se existe servidores ativos
	
	setTimeout(function () {
		console.log('Attempt to kill child process')
		child.kill('SIGINT');
		//child.kill('SIGUSR2'); //Parece que em windows não funciona
	}, 5000);

	// Actually kill the child process.
	setTimeout(function () {
		child.kill();
	}, 10000);
}
