"use strict";

class Proxy{
	constructor(logger, app, db){

	//http://localhost:3000/
	app.get('/', function (req, res, next) {
		res.render('index');
		//Nota: só quando se muda de browser é que o porto de origem muda.
		logger.info("\n Novo acesso -> " + Date() +
		'\n *** [Client] User remote address and port ' + 
		req.connection.remoteAddress +':'+ req.connection.remotePort +
		'\n *** [Server] User local  address and port ' +
		req.connection.localAddress +':'+ req.connection.localPort);
	});

	app.get('/login', function (req, res, next) {
		res.render('login', { flash: req.flash() } );
	});

	app.get('/create_account', function (req, res, next) {
		res.render('create_account', { flash: req.flash() } );
	});

	app.get('/secure', function (req, res, next) {
		res.render('secure', { flash: req.flash() } );
	});

	app.post('/login', function (req, res, next) {
		if(!(req.body.password && req.body.username && req.body.password)) {
        	return res.send({"status": "error", "message": "missing username team|username|password"});
    	}
		db.find({username: req.body.username}, function(err, data){
			if(data.length === 0) {
        		return res.send({"status": "error", "message": "wrong username"});
    		}
			var data_db_delay = data;
			// A função anterior leva algum tempo a processar o find, tem que se forçar um atraso,
			//para a variável data_db_delay possa assumir o valor do find.
			// Se isto não for feito fica durante uns instantes undefined.
			setTimeout(function () {
				if(	req.body.team == data_db_delay[0].team &&
					req.body.username == data_db_delay[0].username && 
					req.body.password == data_db_delay[0].password ){
					req.session.authenticated = true;
        			res.redirect('/secure');
				} else {
					//Parece que o flash não está a funcionar, pode ser do firefox
					req.flash('error', 'Username and password are incorrect');
					res.redirect('/login');
				}
			}, 1000);
		});
	});

	app.post('/create_account', function (req, res, next) {
		if(!(req.body.password && req.body.username && req.body.password)) {
        	return res.send({"status": "error", "message": "missing username team|username|password"});
    	}
		db.find({username: req.body.username}, function(err, data){
			// Só permitir um único username, mesmo em equipas diferentes. 
			if(data.length === 0) {
				var data = {team: req.body.team, username: req.body.username, password: req.body.password}; 
				db.insert( data, function(err, data){
					return res.send({"status": "info", "message": "Account created"});
				});
			} else {
				//Parece que o flash não está a funcionar, pode ser do firefox
				req.flash('error', 'username already exist');
				res.redirect('/create_account');
			}
		});
	});

	app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		res.redirect('/');
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

	}
}
module.exports = Proxy;
