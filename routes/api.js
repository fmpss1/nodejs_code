"use strict";


/** Dependencies */
var express   = require("express");
var router    = express.Router();
var ldap      = require('ldapjs');
var assert    = require('assert');

var client, dn, change;

/** Global configurations */
var config      = require('../config');

var indexJSON = {"Access to the Simulator -> http://localhost:3000/api/" :
                {
                  "Login to access to the simulator" :
                    "http://localhost:3000/api/login",
                  "Create an account to access to the simulator" :
                    "http://localhost:3000/api/account_create",
                  "Documentation about this simulator API" :
                    "http://localhost:3000/api/api_doc"}}

var menuJSON = {"id" : "id",
                    "team_name" : "team_name",
                    "game_fase_number" : "number",
                    "room_1"  : "iframe_url",
                    "room_2"  : "iframe_url",
                    "room_4"  : "iframe_url",
                    "room_5"  : "iframe_url"}

var errorMessageJSON = {"status": "error",
                        "message": "Missing team|username|password|namespace"}


var errorUserActivoJSON = {"status": "error",
                           "message": "User already active"}

var errorPasswordJSON = {"status": "error",
                         "message": "Missing password"}






//ACRESCENTAR AO SESSION E AO USERS.JSON:
// ultimo acesso, quandos acessos, etc

  //Nota: só quando se muda de browser é que o porto de origem muda.

  //  config.logger.info("\n Novo acesso -> " + Date() +
  //  '\n *** [Client] User remote address and port ' + 
  //  req.connection.remoteAddress +':'+ req.connection.remotePort +
  //  '\n *** [Server] User local  address and port ' +
  //  req.connection.localAddress +':'+ req.connection.localPort);







//var user         = 'cn=root';
//var pass         = 'secret';


/*
const ldapOptions {
  url: config.URL_LDAP,
  connectTimeout: 30000,
  reconnect: true
}
*/

/*
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
  else console.log('falta tratar');
  next();
});

function isGETLogin (req) {
//  if (req.path != "/login" || req.path != "/logout") { return false; }
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
*/




router.get('/', function (req, res, next) {
  if(req.headers['user-agent'].includes("curl"))
    res.send(indexJSON);
	else
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
  res.render('user_secure', { name : req.session.dn, url : config.URL_proxy } );
});

router.get('/admin_secure', function (req, res, next) {
    res.render('admin_secure', { name : req.session.dn, url : config.URL_proxy } );
});

router.get('/api_doc', function (req, res, next) {
	res.render('api_doc');
});

router.get('/logout', function (req, res, next) {
  client = ldap.createClient({ url: config.URL_LDAP });
  dn = req.session.dn;
  console.log(dn);
  if (req.query.token){
    modifyToken(dn, [""]);
    res.end();
  }
  else {
    modifyState(dn, ["inactive"]);
    req.session.reset();
    res.redirect('/api/');
  }
  unbind();
});


//http://localhost:3000/api/user?team=teste&username=teste&password=teste
router.get('/login', function (req, res, next) {
  if(!req.query.team)
    res.render('login');
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
        req.session.dn = dn;
        modifyState(dn, ["active"]);
      }
      res.end();
    });
  }
});

router.post('/login', function (req, res, next) {
  if(!(req.body.team && req.body.username && req.body.password))
    res.send(errorMessageJSON);
  else if(req.body.team && req.body.username && req.body.password) {
    client = ldap.createClient({ url: config.URL_LDAP });
    dn = 'cn='+req.body.username+', ou='+req.body.team+', o=ldap';
    client.bind(dn, req.body.password, function(err) {
      if(err)
        res.render('error_unauthorised', { status: 403 });
      else if(req.body.username=='admin' && req.body.password=='admin'){
        req.session.dn = dn;
        res.redirect('/api/admin_secure');
        modifyState(dn, ["active"]);
      }
      else{
        req.session.dn = dn;
        req.session.pw = req.body.password;
        res.redirect('/api/user_secure');
        modifyState(dn, ["active"]);
      }
    });
  }
});

//curl "http://localhost:3000/api/menu?team=teste&username=teste&password=teste&namespace=teste" | jq
//http://localhost:3000/api/menu
router.get('/menu', function (req, res, next) {
  if(req.session.dn)
    res.send(menuJSON);
  else if(!(req.query.team && req.query.username && req.query.password))
    res.send(errorMessageJSON);
  else {
    client = ldap.createClient({ url: config.URL_LDAP });
    dn = 'cn='+req.query.username+', ou='+req.query.team+', o=ldap';
    client.bind(dn, req.query.password, function(err) {
      if(err)
        res.send(errorUserActivoJSON);
      else
        res.send(menuJSON);
    });
  }
});




router.get('/account_search_team', function (req, res, next) {
    res.render('account_search_team');
});
router.get('/admin_remove_team', function (req, res, next) {
    res.render('admin_remove_team');
});
router.get('/admin_remove_user', function (req, res, next) {
    res.render('admin_remove_user');
});


router.get('/account_change_pw', function (req, res, next) {
  res.render('account_change_pw');
});
router.post('/account_change_pw', function (req, res, next) {
  if(!(req.body.password && req.body.new_password))
    res.send(errorPasswordJSON);
  else {
    dn = req.session.dn;
    client = ldap.createClient({ url: config.URL_LDAP });
    modifyPassword(dn, req);
    res.redirect('/api/login');
    modifyState(dn, ["inactive"]);
  }
});

router.get('/account_create', function (req, res, next) {
    res.render('account_create');
});
router.post('/account_create', function (req, res, next) {
	if(!(req.body.team && req.body.username && req.body.password)) {
    res.send(errorMessageJSON);
  }
  else {
    client = ldap.createClient({ url: config.URL_LDAP });
    createAccount(req, res);
  }
});

router.get('/account_remove', function (req, res, next) {
    res.render('account_remove');
});
router.post('/account_remove', function (req, res, next) {
  if(!(req.body.team && req.body.username && req.body.password))
    res.send(errorMessageJSON);
  else
    deleteAccount(req);
});

router.get('/account_search_user', function (req, res, next) {
    res.render('account_search_user');
});
router.post('/account_search_user', function (req, res, next) {
  if(!req.body.word) {
    res.send({"status": "error", "message": "missing username to search"});
  }
  else {
    var opts = {
      filter:       '(objectclass=Person)',
      scope:        'sub',
      attributes:   ['cn']
    };
    //var newDN = 'ou='+req.body.team+', ou=user, o=ldap';
    //dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
    //dn = 'o=ldap';
    
    console.log(req.session.dn);
    client = ldap.createClient({ url: config.URL_LDAP });
    client.search(req.session.dn, opts, function(err, resp) {
      assert.ifError(err);
/*
      if(req.body.username == 'admin'){
        res.render('admin_secure', { status: 403 });
      }
      else{
        res.render('index', { status: 403 });
      }
*/
      resp.on('searchEntry', function(entry) {
        console.log('entry: ' + JSON.stringify(entry.object.cn));

        if(JSON.stringify(entry.object.cn) == '"'+ req.body.word +'"'){
          console.log('cn='+req.body.word);
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

function modifyPassword(dn, req) {
  change = new ldap.Change({
    operation: 'replace', modification: { userpassword: req.body.new_password }
  });
  clientModify(dn, change);
}

function modifyState(dn, toChange) {
  change = new ldap.Change({
    operation: 'replace', modification: { state: toChange }
  });
  clientModify(dn, change);
}

function modifyToken(dn, toChange) {
  change = new ldap.Change({
    operation: 'replace', modification: { token: toChange }
  });
  clientModify(dn, change);
}

function clientModify(dn, change){
  client.modify(dn, change, function(err) {
    assert.ifError(err);
  });
}

function createAccount(req, res){
  dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
  var newUser = {
    cn:                     req.body.username,
    objectClass:            'Person',
    userPassword:           req.body.password,
    token:                  '',
    state:                  'inactive',
    pid:                    '',
    clientproxyipsource:    '',
    clientproxyportsource:  '',
    proxyipdest:            '',
    proxyportdest:          '',
    clientserveripsource:   '',
    clientserverportsource: '',
    serveripdest:           '',
    serverportdest:         '',
    lastaccess:             '',
    numberofaccesses:       ''
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

function deleteAccount(req){
  dn = 'cn='+req.body.username+' ,ou='+req.body.team+', o=ldap';
  if(req.body.username != 'admin'){
    client.del(dn, function(err){
      assert.ifError(err);
      res.render('index', { status: 403 });
    });
  }
}

function unbind(){
  client.unbind (function(req, res, err) {
    assert.ifError(err);
  }); 
}


module.exports = router;
