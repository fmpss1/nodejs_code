"use strict";

class Proxy{
	constructor(db, logger, app, port_routes, ServidorDaEquipa, array_children_pids, array_children_ports){

	//http://localhost:3000/
	app.get("/", function(req, res) {
		api_apresentation(req, res, logger);
	});

	//http://localhost:3000/account_get?username=teste2
	app.get("/account_get", function(req, res) {
		if(!req.query.username) {
        	return res.send({"status": "error", "message": "missing username"});
    	}
		db.find({username: req.query.username}, function(err, data){
			if(data.length === 0) {
        		return res.send({"status": "error", "message": "wrong username"});
    		}
			var data_db_delay = data;
			// A função anterior leva algum tempo a processar o find, tem que se forçar um atraso,
			//para a variável data_db_delay possa assumir o valor do find.
			// Se isto não for feito fica durante uns instantes undefined.
			setTimeout(function () {
				if(req.query.username == data_db_delay[0].username){
        			return res.send(data_db_delay);
				}
			}, 1000);
		});
	});

	//http://localhost:3000/account_post?team=team_1&username=teste1&password=teste1
	app.get("/account_post", function(req, res) {
		if(!(req.query.team && req.query.username && req.query.password)) {
        	return res.send({"status": "error", "message": "missing team|username|password"});
    	}
    	db.find({username: req.query.username}, function(err, data){
    		// Só permitir um único username, mesmo em equipas diferentes. 
			if(data.length === 0) {
				var data = {team: req.query.team, username: req.query.username, password: req.query.password }; 
				db.insert( data, function(err, data){
					return res.send({"status": "info", "message": "username created"});
				});
    		} else {
    			return res.send({"status": "error", "message": "username already exist"});
    		}
		});
	});

	//http://localhost:3000/account_delete_team?team=team_1
	app.get("/account_delete_team", function(req, res) {
		if(!req.query.team) {
        	return res.send({"status": "error", "message": "missing team"});
    	}
    	db.find({team: req.query.team}, function(err, data){ 
			if(data.length != 0) {
				db.remove( {team: req.query.team}, {multi: true},  function(err, data){
					return res.send({"status": "info", "message": "team removed"});
				});
    		} else {
    			return res.send({"status": "error", "message": "team not exist"});
    		}
		});
	});

	//http://localhost:3000/account_delete_username?username=teste1
	app.get("/account_delete_username", function(req, res) {
		if(!req.query.username) {
        	return res.send({"status": "error", "message": "missing username"});
    	}
    	db.find({username: req.query.username}, function(err, data){ 
			if(data.length != 0) {
				db.remove( {username: req.query.username}, {}, function(err, data){
					return res.send({"status": "info", "message": "username removed"});
				});
    		} else {
    			return res.send({"status": "error", "message": "username not exist"});
    		}
		});
	});

	//http://localhost:3000/account (post -> Precisa de um form do lado do cliente)
	app.post("/account", function(req, res) {
    	if(!req.body.team || !req.body.username || !req.body.password) {
        	return res.send({"status": "error", "message": "missing a parameter"});
    	} else {
        	return res.send(req.body);
    	}
	});
	}
}
module.exports = Proxy;


function api_apresentation(req, res, logger){
	res.send("<br> RESTful API:" +
    	"<br> <br> <br>--- Proxy <br>"+
    	"<br> http://localhost:3000/account_get" +
    	"<br> http://localhost:3000/account_get?username=teste2" +
    	"<br> " +
    	"<br> http://localhost:3000/account_post (simula o post)" +
    	"<br> http://localhost:3000/account_post?team=team_8&username=teste9&password=teste4" +
    	"<br> " +
    	"<br> http://localhost:3000/account (post -> Precisa de um form do lado do cliente)" +
    	"<br> " +
    	"<br> http://localhost:3000/account_delete_team?team=team_1" +
    	"<br> http://localhost:3000/account_delete_username?username=teste1" +
    	"<br> <br> <br> --- MEMS <br>" +
    	"<br> http://localhost:3000/start_server" +
    	"<br> http://localhost:3000/stop_server");
	//Nota: só quando se muda de browser é que o porto de origem muda.
	logger.info("\n Novo acesso -> " + Date() +
		'\n *** [Client] User remote address and port ' +
		req.connection.remoteAddress +':'+ req.connection.remotePort +
		'\n *** [Server] User local  address and port ' +
		req.connection.localAddress +':'+ req.connection.localPort);
}