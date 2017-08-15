"use strict";

//Global configurations
var config  = require('../config');
var router  = config.express.Router();
var ldap    = config.ldap;
var assert  = config.assert;

//var user         = 'cn=root';
//var pass         = 'secret';
var client, dn, change;

//http://localhost:3000/api/
router.get('/', function (req, res, next) {
	res.render('index');
});

router.param('name', function(req, res, next, name){
	var modified = name + '-dude';
    req.name = modified;
    next();
});

router.get('/api/users/:name', function (req, res) {
	res.send('What is up ' + req.name + '!' 
    + req.session.isLoggedIn + req.session.userId + req.session.type);
});

router.get('/user_secure', function (req, res, next) {
	res.render('user_secure', { flash: req.flash() } );
});

router.get('/admin_secure', function (req, res, next) {
    res.render('admin_secure', { flash: req.flash() } );
});

router.get('/api_documentation', function (req, res, next) {
	res.render('api_documentation', { flash: req.flash() } );
});

router.get('/logout', function (req, res, next) {
  client = ldap.createClient({ url: config.URL_LDAP });
  dn = req.session.dn;
  change = new ldap.Change({
    operation: 'replace', modification: { state: ["inactive"] }
  });
  client.modify(dn, change, function(err) {
    assert.ifError(err);
  });
  delete req.session.authenticated;
  client.unbind (function(req, res, err) {
    assert.ifError(err);
  });
	res.redirect('/api/');
});

router.get('/login', function (req, res, next) {
	res.render('login', { flash: req.flash() } );
});

router.get('/account_create', function (req, res, next) {
    res.render('account_create', { flash: req.flash() } );
});

router.get('/account_change', function (req, res, next) {
	res.render('account_change', { flash: req.flash() } );
});

router.get('/account_remove', function (req, res, next) {
    res.render('account_remove', { flash: req.flash() } );
});

router.get('/account_search_user', function (req, res, next) {
    res.render('account_search_user', { flash: req.flash() } );
});


/*
  //http://localhost:3000/account_delete_team?team=team_1
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
*/


router.get('/account_search_team', function (req, res, next) {
    res.render('account_search_team', { flash: req.flash() } );
});

router.get('/admin_account_change_team', function (req, res, next) {
    res.render('admin_account_change_team', { flash: req.flash() } );
});

router.get('/admin_account_create_team', function (req, res, next) {
    res.render('admin_account_create_team', { flash: req.flash() } );
});

router.get('/admin_account_remove_team', function (req, res, next) {
    res.render('admin_account_remove_team', { flash: req.flash() } );
});

router.get('/admin_account_search_team', function (req, res, next) {
    res.render('admin_account_search_team', { flash: req.flash() } );
});

router.get('/admin_account_search_user', function (req, res, next) {
    res.render('admin_account_search_user', { flash: req.flash() } );
});





router.post('/login', function (req, res, next) {
	if(!(req.body.team && req.body.username && req.body.password)) {
    return res.send({"status": "error", "message": "missing team|username|password"});
  }
  else {
   	client = ldap.createClient({ url: config.URL_LDAP });
    dn = 'cn='+req.body.username+', ou='+req.body.team+', o=ldap';
		client.bind(dn, req.body.password, function(err) {
      if(err){
  			res.render('error_unauthorised', { status: 403 });
  		}
      else if(req.body.username=='admin' && req.body.password=='admin'){
        req.session.authenticated = true;
        res.redirect('/api/admin_secure');
      }
      else{
        
        /*
        change = new ldap.Change({
        operation: 'replace',
      modification: { userPassword: req.body.new_password }
    });
    client.modify(dn, change, function(err) {
      assert.ifError(err);
    });
        */

        req.session.dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
    		req.session.authenticated = true;
        res.redirect('/api/user_secure');
  		}
		});
	}
});


//ACRESCENTAR AO SESSION E AO USERS.JSON:
// ultimo acesso, quandos acessos, etc

  //Nota: só quando se muda de browser é que o porto de origem muda.

  //  config.logger.info("\n Novo acesso -> " + Date() +
  //  '\n *** [Client] User remote address and port ' + 
  //  req.connection.remoteAddress +':'+ req.connection.remotePort +
  //  '\n *** [Server] User local  address and port ' +
  //  req.connection.localAddress +':'+ req.connection.localPort);



router.post('/account_create', function (req, res, next) {
	if(!(req.body.team && req.body.username && req.body.password)) {
    return res.send({"status": "error", "message": "missing team|username|password"});
  }
  else {
    client = ldap.createClient({ url: config.URL_LDAP });
  		dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
  		var newUser = {
    		cn:           req.body.username,
    		objectClass:  'inetOrgPerson',
    		userPassword: req.body.password,
        state:        'inactive'
  		}
    	client.add(dn, newUser, function(err){
    		if(err){
  				res.render('error_user_exist', { status: 403 });
  			}
  			else if(req.body.username == 'admin'){
          res.redirect('/api/admin_secure');
        }
        else{
          res.redirect('/api/login');
        }
 			});
  }
});

//Melhorar: mais opcoes
router.post('/account_change', function (req, res, next) {
	if(!(req.body.team && req.body.username && req.body.password &&
		req.body.new_team && req.body.new_username && req.body.new_password)) {
    return res.send({"status": "error", "message": "missing team|username|password"});
  }
  else {
    client = ldap.createClient({ url: config.URL_LDAP });
    dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
    change = new ldap.Change({
      operation: 'replace',
      modification: { userPassword: req.body.new_password }
    });
    client.modify(dn, change, function(err) {
      assert.ifError(err);
    });
    if(req.body.username == 'admin'){
      res.redirect('/api/admin_secure');
    }
    else{
      res.redirect('/api/login');
    }
  }
});

router.post('/account_remove', function (req, res, next) {
  if(!(req.body.team && req.body.username && req.body.password)) {
    return res.send({"status": "error", "message": "missing team|username|password"});
  }
  else {
    dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
    client.del(dn, function(err){
      assert.ifError(err);
      if(req.body.username == 'admin'){
        res.render('admin_secure', { status: 403 });
      }
      else{
        res.render('index', { status: 403 });
      }
    });		
  }
});

router.post('/account_search_user', function (req, res, next) {
  if(!(req.body.team && req.body.username && req.body.password)) {
    return res.send({"status": "error", "message": "missing team|username|password"});
  }
  else {
    var opts = {
      //filter: '(&(objectClass=inetOrgPerson)(cn=*ser))',
      //filter: '(&(objectClass=inetOrgPerson))',
      filter: '(&(cn=*))',
      scope: 'sub',
      attributes: ['cn']
      //attributes: []
    };
    //var newDN = 'ou='+req.body.team+', ou=user, o=ldap';
    dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
    client.search(dn, opts, function(err, resp) {
      assert.ifError(err);
      //if(req.body.username == 'admin'){
      //  res.render('admin_secure', { status: 403 });
      //}
      //else{
      //  res.render('index', { status: 403 });
      //}

      resp.on('searchEntry', function(entry) {
        console.log('entry: ' + JSON.stringify(entry.object.cn));

        if(JSON.stringify(entry.object.cn) == '"'+ req.body.username +'"'){
          console.log('cn='+req.body.username);
        }
        else{
          console.log('ERRO');
        }
          res.send(JSON.parse(entry).attributes);
      });
      resp.on('searchReference', function(referral) {
        console.log('referral: ' + referral.uris.join());
      });
      resp.on('error', function(err) {
        console.error('error: ' + err.message);
      });
      resp.on('end', function(result) {
        console.log('status: ' + result.status);
      });
    });
  }
});

module.exports = router;
