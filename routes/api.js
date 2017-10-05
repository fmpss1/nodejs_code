"use strict";


/** Dependencies */
var express   = require("express");
var router    = express.Router();
var ldap      = require('ldapjs');
var assert    = require('assert');

/** Global configurations */
var config      = require('../config');

var client, dn, change;


var indexJSON = {"Access to the Simulator -> http://localhost:3000/api/" :
                {
                  "Login to access to the simulator" :
                    "http://localhost:3000/api/login",
                  "Create an account to access to the simulator" :
                    "http://localhost:3000/api/account_create",
                  "Documentation about this simulator API" :
                    "http://localhost:3000/api/api_doc"}}

var apiJSON = {"API Documentation  -> http://ip:port/api/api_doc" :
              {
                "ip:port" : config.URL_proxy,
                "/api/" :
                  "Permite o utilizador ligar-se ao simulador via reverse proxy",
                "/api/login" :
                  "Permite o utilizador autenticar-se via LDAP",
                "/api/menu" :
                  "Devolve as fases do jogo em curso terminadas de todas as equipas exceto a equipa da qual o utilizador que faz parte",
                "/api/account_change_pw" :
                  "Modifica a password do utilizador",
                "/api/account_remove" :
                  "O próprio utilizador pode eliminar a sua conta. Esta funcionalidade é específica dos utilizadores normais. O administrador não pode apagar a sua própria conta, devido a ser o gestor de todo o sistema",
                "/api/account_search_user" :
                  "Permite localizar outro jogador",
                "/api/account_search_users" :
                  "O utilizador pode listar todos os utilizadores existentes no simulador, no momento do pedido",
                "/api/account_search_team" :
                  "O utilizador pode listar todos os utilizadores de uma equipa específica existente no simulador, no momento do pedido",
                "/api/account_search_teams" :
                  "O utilizador pode listar todas as equipas existentes no simulador, no momento do pedido",
                "/api/server_add_user" :
                  "Associa a uma equipa o respetivo utilizador",
                "/api/server_remove_user" :
                  "Desassocia o respetivo utilizador da equipa",
                "/api/logout" :
                  "O utilizador pode sair do jogo em qualquer momento e automaticamente perde a sua autenticação"}}

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



router.get('/', function (req, res, next) {
  if(req.headers['user-agent'].includes("curl"))
    res.send(indexJSON);
	else
    res.render('index');
});

router.get('/user_secure', function (req, res, next) {
  res.render('user_secure', { name : req.session.dn, url : config.URL_proxy } );
});

router.get('/admin_secure', function (req, res, next) {
    res.render('admin_secure', { name : req.session.dn, url : config.URL_proxy } );
});

router.get('/api_doc', function (req, res, next) {
  if(req.headers['user-agent'].includes("curl"))
    res.send(apiJSON);
  else
    res.render('api_doc', { url : config.URL_proxy });
});

router.get('/logout', function (req, res, next) {
  client = ldap.createClient({ url: config.URL_LDAP });
  dn = req.session.dn;
  modifyState(dn, ["inactive"]);
  req.session.reset();
  res.redirect('/api/');
  unbind();
});

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

router.get('/menu', function (req, res, next) {
  if(req.session.dn){
    res.render('menu', { json : menuJSON } );
  }
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

router.get('/account_create', function (req, res, next) {
    res.render('account_create');
});

router.post('/account_create', function (req, res, next) {
  if(!(req.body.team && req.body.username && req.body.password))
    res.send(errorMessageJSON);
  else {
    client = ldap.createClient({ url: config.URL_LDAP });
    createAccount(req, res);
  }
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
  if(req.session.dn){
    res.render('account_search_user', { json : "info do user" } );
  }
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
    res.render('');
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
    console.log(req.session.dn);
    client = ldap.createClient({ url: config.URL_LDAP });
    //client.search(req.session.dn, opts, function(err, resp) {
    client.search(req.body.word, opts, function(err, resp) {
      assert.ifError(err);
      resp.on('searchEntry', function(entry) {
        console.log('entry: ' + JSON.stringify(entry.object.cn));
        if(JSON.stringify(entry.object.cn) == '"'+ req.body.word +'"')
          console.log('cn='+req.body.word);
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

router.get('/account_search_users', function (req, res, next) {
    res.render('account_search_users');
});

router.get('/account_search_team', function (req, res, next) {
    res.render('account_search_team');
});

router.get('/account_search_teams', function (req, res, next) {
    res.render('account_search_teams');
});

router.get('/admin_remove_team', function (req, res, next) {
    res.render('admin_remove_team');
});

router.get('/admin_remove_user', function (req, res, next) {
    res.render('admin_remove_user');
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
