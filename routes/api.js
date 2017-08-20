"use strict";

//Global configurations
var config  = require('../config');
var router  = config.express.Router();
var ldap    = config.ldap;
var assert  = config.assert;
var fs      = config.fs;

//var user         = 'cn=root';
//var pass         = 'secret';
var client, dn, change;


router.use (function(req, res, next) {
  console.log('router use -----------------');
  if (req.body.team){
    console.log('router body');
  }
  if (req.query.team){
    console.log('router query');
    
    if (! isGETLogin (req) ) {
        if (! reqHasPermission (req) ){
            res.writeHead(401);  // unauthorized
            res.end();
            return; // don't call next()
        }
    }
  }
  next();
});

function isGETLogin (req) {
    if (req.path != "/login" || req.path != "/logout") { return false; }
    if (req.method != "GET" || req.method == "POST") { return false; }
    return true;
}

function reqHasPermission (req) {
    // decode req.accessToken, extract 
    // supposed fields there:
    console.log(req.headers.accessToken);
    //console.log(req.headers.accessToken.userId);
    //console.log(req.headers.accessToken.roleId);
    //console.log(req.headers.accessToken.expiryTime);
    // and check them

    // for the moment we do a very rigorous check
    //if (req.headers.accessToken != "you-are-welcome" && req.query.team) {
    //      console.log('testees dddddd');
    //    return false;
    //}
    return true;
}







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
  console.log(req.query.token);
  if (req.query.token){
    change = new ldap.Change({
      operation: 'replace', modification: { token: [""] }
    });
    client.modify(dn, change, function(err) {
      assert.ifError(err);
    });
    res.end();
  }
  else {
    change = new ldap.Change({
      operation: 'replace', modification: { state: ["inactive"] }
    });
    client.modify(dn, change, function(err) {
      assert.ifError(err);
    });
    res.redirect('/api/');
  }
  delete req.session.authenticated;
  client.unbind (function(req, res, err) {
    assert.ifError(err);
  });
});

router.get('/login', function (req, res, next) {
  if (!(req.query.team)){
	res.render('login', { flash: req.flash() } );
}
  else {
    client = ldap.createClient({ url: config.URL_LDAP });
    dn = 'cn='+req.query.username+', ou='+req.query.team+', o=ldap';
    client.bind(dn, req.query.password, function(err) {
      if(err){
        res.render('error_unauthorised', { status: 403 });
      }
      else if(req.query.username=='admin' && req.query.password=='admin'){
        req.session.authenticated = true;
        res.redirect('/api/admin_secure');
      }
      else{
        var accessToken = Math.random();
        res.setHeader ('accessToken', accessToken);
        return res.send(accessToken);
        res.writeHead (200);
        req.session.dn = 'cn='+req.query.username+' ,ou='+req.query.team+', o=ldap';
        req.session.authenticated = true;
        change = new ldap.Change({
          operation: 'replace', modification: {
            token: accessToken
          }
        });
        client.modify(dn, change, function(err) {
          assert.ifError(err);
        });
        change = new ldap.Change({
          operation: 'replace', modification: {
            state: ["active"]
          }
        });
        client.modify(dn, change, function(err) {
          assert.ifError(err);
        });
      }
      res.end();
    });
  }
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
//http://localhost:3000/api/user?team=teste&username=teste&password=teste
router.get("/login", function(req, res) {
  if(!(req.query.team && req.query.username && req.query.password)) {
    return res.send({"status": "error", "message": "missing team|username|password"});
  }
  else
    res.redirect('/api/user_secure');
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
  if((req.body.team && req.body.username && req.body.password)) {
        client = ldap.createClient({ url: config.URL_LDAP });
    dn = 'cn='+req.body.username+', ou='+req.body.team+', o=ldap';
    client.bind(dn, req.body.password, function(err) {
      if(err){
        res.render('error_unauthorised', { status: 403 });
      }
      if(req.body.username=='admin' && req.body.password=='admin'){
        req.session.authenticated = true;
        res.redirect('/api/admin_secure');
      }
      else{
        req.session.dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
        req.session.authenticated = true;
        change = new ldap.Change({
          operation: 'replace', modification: { state: ["active"] }
        });
        client.modify(dn, change, function(err) {
          assert.ifError(err);
        });
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
    // sign asynchronously
    //token = jwt.sign({ foo: 'bar' }, 'ola');
    //console.log(token);

  	dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
  	var newUser = {
    	cn:           req.body.username,
    	objectClass:  'inetOrgPerson',
    	userPassword: req.body.password,
      token:        token,
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
