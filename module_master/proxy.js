"use strict";

class Proxy{

	constructor(logger, app, ldap, URL_LDAP, assert){
		var logger			   = logger;
		var app 			     = app;
		var URL_LDAP 		   = URL_LDAP;
		var assert			   = assert;
		var client;
		var user 			     = 'cn=root';
  	var pass 			     = 'secret';
  	var count_access	 = 0;

	//http://localhost:3000/
	app.get('/', function (req, res, next) {
		res.render('index');
		//Nota: só quando se muda de browser é que o porto de origem muda.
		logger.info("\n Novo acesso -> " + Date() +
		'\n *** [Client] User remote address and port ' + 
		req.connection.remoteAddress +':'+ req.connection.remotePort +
		'\n *** [Server] User local  address and port ' +
		req.connection.localAddress +':'+ req.connection.localPort);

  		if (count_access == 0){ 





//----- Criar users automáticos
  			client = ldap.createClient({ url: URL_LDAP });
  				// Só o root pode adicionar users
  			var newDNa = 'cn=user , ou=user, o=ldap';
  			var newUsera = {
    			cn: 'user',
    			objectClass: 'inetOrgPerson',
    			userPassword: 'user'
  			}

        var newDNb = 'cn=teste , ou=teste, o=ldap';
        var newUserb = {
          cn: 'teste',
          objectClass: 'inetOrgPerson',
          userPassword: 'teste'
        }

  			var newDNc = 'cn=admin , ou=admin, o=ldap';
  			var newUserc = {
    			cn: 'admin',
    			objectClass: 'inetOrgPerson',
    			userPassword: 'admin'
  			}

  			client.bind(user, pass, function(err){
    			client.add(newDNa, newUsera, function(err){
					assert.ifError(err);
 				});
  				assert.ifError(err);
  			});

  			client.bind(user, pass, function(err){
    			client.add(newDNb, newUserb, function(err){
					assert.ifError(err);
 				});
  				assert.ifError(err);
  			});

        client.bind(user, pass, function(err){
          client.add(newDNc, newUserc, function(err){
          assert.ifError(err);
        });
          assert.ifError(err);
        });

        //client.unbind(function(err) {
        //  assert.ifError(err);
        //});

  			count_access++;
  		}
//-----
	});





	app.get('/user_secure', function (req, res, next) {
		res.render('user_secure', { flash: req.flash() } );
	});

  app.get('/admin_secure', function (req, res, next) {
    res.render('admin_secure', { flash: req.flash() } );
  });






	app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		client.unbind (function(err) {
			assert.ifError(err);
		});
		res.redirect('/');
	});

	app.get('/login', function (req, res, next) {
		res.render('login', { flash: req.flash() } );
	});





  app.get('/account_create', function (req, res, next) {
    res.render('account_create', { flash: req.flash() } );
  });

	app.get('/account_change', function (req, res, next) {
		res.render('account_change', { flash: req.flash() } );
	});

  app.get('/account_remove', function (req, res, next) {
    res.render('account_remove', { flash: req.flash() } );
  });

  app.get('/account_search', function (req, res, next) {
    res.render('account_search', { flash: req.flash() } );
  });





  app.get('/user_account_search_team', function (req, res, next) {
    res.render('user_account_search_team', { flash: req.flash() } );
  });

  app.get('/admin_account_change_team', function (req, res, next) {
    res.render('admin_account_change_team', { flash: req.flash() } );
  });

  app.get('/admin_account_create_team', function (req, res, next) {
    res.render('admin_account_create_team', { flash: req.flash() } );
  });

  app.get('/admin_account_remove_team', function (req, res, next) {
    res.render('admin_account_remove_team', { flash: req.flash() } );
  });

  app.get('/admin_account_search_team', function (req, res, next) {
    res.render('admin_account_search_team', { flash: req.flash() } );
  });

  app.get('/admin_account_search_user', function (req, res, next) {
    res.render('admin_account_search_user', { flash: req.flash() } );
  });





	app.post('/login', function (req, res, next) {
		if(!(req.body.team && req.body.username && req.body.password)) {
        	return res.send({"status": "error", "message": "missing username team|username|password"});
    	}
    	else if(req.body.username=='root' && req.body.password=='secret'){
    		client = ldap.createClient({ url: URL_LDAP });
        client.bind('cn='+req.body.username, req.body.password, function(err) {	
  				if(err){
  					res.render('unauthorised', { status: 403 });
  				}
  				else{
  					req.session.authenticated = true;
        		res.redirect('/user_secure');
        		}
			});
    	}
    	else {
    		  client = ldap.createClient({ url: URL_LDAP });
			    client.bind('cn='+req.body.username+' ,ou='+req.body.team+', o=ldap', req.body.password, function(err) {	
  				if(err){
  					res.render('unauthorised', { status: 403 });
  				}
          else if(req.body.username=='admin' && req.body.password=='admin'){
            req.session.authenticated = true;
            res.redirect('/admin_secure');
          }
  				else{
  					req.session.authenticated = true;
        			res.redirect('/user_secure');
        		}
			});
		}
	});

	app.post('/account_create', function (req, res, next) {
		if(!(req.body.team && req.body.username && req.body.password)) {
        	return res.send({"status": "error", "message": "missing username team|username|password"});
    	}
    	else {
  			client = ldap.createClient({ url: URL_LDAP });
  			// Só o root pode adicionar users
  			var newDN = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
  			var newUser = {
    			cn: req.body.username,
    			objectClass: 'inetOrgPerson',
    			userPassword: req.body.password
  			}
  			client.bind(user, pass, function(err){
    			client.add(newDN, newUser, function(err){
					   assert.ifError(err);
 				   });
  				assert.ifError(err);
        	if(req.body.username == 'admin'){
            res.redirect('/admin_secure');
          }
          else{
            res.redirect('/login');
          }
  			});
  		}
	});

  app.post('/account_change', function (req, res, next) {
    if(!(req.body.team && req.body.username && req.body.password &&
         req.body.new_team && req.body.new_username && req.body.new_password)) {
        return res.send({"status": "error", "message": "missing username team|username|password"});
    }
    else {
        client = ldap.createClient({ url: URL_LDAP });
        var newDN = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
        var change = new ldap.Change({
              operation: 'replace',
              modification: { userPassword: req.body.new_password }
            })
        client.bind(user, pass, function(err){
          client.modify(newDN, change, function(err) {
              assert.ifError(err);
          });
          assert.ifError(err);
          if(req.body.username == 'admin'){
            res.redirect('/admin_secure');
          }
          else{
            res.redirect('/login');
          }
        });
    }
  });

	app.post('/account_remove', function (req, res, next) {
		if(!(req.body.team && req.body.username && req.body.password)) {
        return res.send({"status": "error", "message": "missing username team|username|password"});
    }
    else {
        client.bind(user, pass, function(err){
            var newDN = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
            client.del(newDN, function(err){
                assert.ifError(err);
                if(req.body.username == 'admin'){
                  res.render('index', { status: 403 });
                }
                else{
                  res.render('admin_secure', { status: 403 });
                }
            });
            assert.ifError(err);

        }); 		
  	}
	});

  app.post('/account_search', function (req, res, next) {
    if(!(req.body.team && req.body.username && req.body.password)) {
        return res.send({"status": "error", "message": "missing username team|username|password"});
    }
    else {

      var opts = {
        filter: '(&(objectClass=inetOrgPerson)(cn=*este))',
        scope: 'sub',
        attributes: ['cn']
      };

        client.bind(user, pass, function(err){
          var newDN = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
          client.search(newDN, opts, function(err, res) {
            assert.ifError(err);

          res.on('searchEntry', function(entry) {
            console.log('entry: ' + JSON.stringify(entry.object));
            //return res.send(JSON.stringify(entry.object));
          });
          res.on('searchReference', function(referral) {
            console.log('referral: ' + referral.uris.join());
          });
          res.on('error', function(err) {
            console.error('error: ' + err.message);
          });
          res.on('end', function(result) {
            console.log('status: ' + result.status);
            //return res.send(result.status);
          });
        });
      });
    }
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
