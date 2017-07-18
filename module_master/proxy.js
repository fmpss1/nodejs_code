"use strict";

//Adaptar
//http://ldapjs.org/

//Quanto detectar uma certa latência, procura outra máquina com recursos
//https://github.com/nodejitsu/node-http-proxy
//https://stackoverflow.com/questions/42156282/how-to-cluster-node-app-in-multiple-machines


class Proxy{
	constructor(logger, app, ldap, assert){

	//http://localhost:3000/
	app.get('/', function (req, res, next) {
		if(!req.session.userName && !req.session.visitCount){
			req.session.userName = "theo";
			req.session.visitCount = 1;
	//		res.status(201).send(req.session);
		} else {
			req.session.visitCount += 1;
	//		res.status(200).send(req.session);
		}

/*
//Forma de contar os acessos dos utilizadores. Desenvolver.
cookie	
originalMaxAge	
expires	
httpOnly	true
path	"/"
flash	
userName	"theo"
visitCount	6
*/

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

	app.get('/account_create', function (req, res, next) {
		res.render('create_account', { flash: req.flash() } );
	});

	app.get('/secure', function (req, res, next) {
		res.render('secure', { flash: req.flash() } );
	});

	app.post('/login', function (req, res, next) {
		if(!(req.body.password && req.body.username && req.body.password)) {
        	return res.send({"status": "error", "message": "missing username team|username|password"});
    	}

		var client = ldap.createClient({
  			url: 'ldap://127.0.0.1:1389'
		});

		client.bind('cn='+req.body.username+'', req.body.password, function(err) {	// Só o root pode adicionar users
		//client.bind('cn=root', 'secret', function(err) {	// Só o root pode adicionar users
  			assert.ifError(err);

  			req.session.authenticated = true;
        	res.redirect('/secure');

  			console.log("teste xxx");
		});


//add user
/*
var entry = {
  cn: 'root',	//nome
  sn: 'test',	//apelido
  email: ['foo@bar.com', 'foo1@bar.com'],
  objectclass: 'fooPerson'		//Tipo de objeto: Exemplo pessoa
};

client.add('cn=teste, o=joyent', entry, function(err) {		//o - raiz
  assert.ifError(err);
});
*/



    	/*
		db_teams.find({username: req.body.username}, function(err, data){
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
		*/
	});

	app.post('/account_create', function (req, res, next) {
		if(!(req.body.password && req.body.username && req.body.password)) {
        	return res.send({"status": "error", "message": "missing username team|username|password"});
    	}
    	/*
		db_teams.find({username: req.body.username}, function(err, data){
			// Só permitir um único username, mesmo em equipas diferentes. 
			if(data.length === 0) {
				var data = {team: req.body.team, username: req.body.username, password: req.body.password}; 
				db_teams.insert( data, function(err, data){
					return res.send({"status": "info", "message": "Account created"});
				});
			} else {
				//Parece que o flash não está a funcionar, pode ser do firefox
				req.flash('error', 'username already exist');
				res.redirect('/account_create');
			}
		});
		*/
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



/*
var http = require('http'),
httpProxy = require('http-proxy');

var addresses = [
  {
    host: "localhost",
    port: 8081
  },
  {
    host: "localhost",
    port: 8082
  },
  {
    host: "localhost",
    port: 8083
  }
];

//Create a set of proxy servers
var proxyServers = addresses.map(function (target) {
  return new httpProxy.createProxyServer({
    target: target
  });
});

var server = http.createServer(function (req, res) {
  var proxy = proxyServers.shift();

  proxy.web(req, res);

  proxyServers.push(proxy);
});

server.listen(8080);
*/