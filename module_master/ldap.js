"use strict";

//Global configurations
var config  = require('../config');
var assert  = config.assert;

var SUFFIX  = 'o=ldap';
var user    = 'cn=root';
var pass    = 'secret';
var db, dn;

class Ldap{
  constructor(ldap, server_ldap){
    var ldap          = ldap;
    var server_ldap   = server_ldap;


  //Load users
  config.fs.readFile(config.path.join(__dirname, 'data.json'), 'utf8', function (err, data) {
    assert.ifError(err);
    db = JSON.parse(data);
  });


  //--- Shared handlers
  function authorize(req, res, next) {
    /* Any user may search after bind, only cn=root has full power */
    var isSearch = (req instanceof ldap.SearchRequest);

    // if (!req.connection.ldap.bindDN.equals('cn=root') && !isSearch)
    //  return next(new ldap.InsufficientAccessRightsError());
    return next();
  }





//----------------------------------------------------------Authentication
  server_ldap.bind('cn=root', function(req, res, next) {
    console.log("BIND root");
    if (req.dn.toString() !== 'cn=root' || req.credentials !== 'secret'){
      return next(new ldap.InvalidCredentialsError());    
    }
    res.end();
    return next();
  });

  server_ldap.bind(SUFFIX, authorize, function(req, res, next) {
    console.log(JSON.stringify(db));
    console.log("BIND SUFFIX");
    dn = req.dn.toString();
    console.log(dn);
      
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));
    if (!db[dn].userpassword)
      return next(new ldap.NoSuchAttributeError('userPassword'));
    if (db[dn].userpassword.indexOf(req.credentials) === -1)
      return next(new ldap.InvalidCredentialsError());
    if (!(db[dn].state == 'inactive'))
      return next(new ldap.NoSuchAttributeError('state'));
    res.end();
    return next();
  });

  server_ldap.unbind(function(req, res, next){
    console.log(JSON.stringify(db, null, 4));
    res.end();
  });
//----------------------------------------------------------Authentication





//------------------------------------------------------------------Update
  server_ldap.add(SUFFIX, authorize, function(req, res, next) {
    console.log("ADD");
    dn = req.dn.toString();
    if (db[dn])
      return next(new ldap.EntryAlreadyExistsError(dn));
    db[dn] = req.toObject().attributes;
    console.log(JSON.stringify(db));
    res.end();
    return next();
  });

  server_ldap.modify(SUFFIX, authorize, function(req, res, next) {
    console.log("MODIFY");
    dn = req.dn.toString();
    if (!req.changes.length)
      return next(new ldap.ProtocolError('changes required'));
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));
    var entry = db[dn];
    for (var i = 0; i < req.changes.length; i++) {
      var mod = req.changes[i].modification;
      switch (req.changes[i].operation) {
        case 'replace':
          if (!entry[mod.type])
            return next(new ldap.NoSuchAttributeError(mod.type));
          if (!mod.vals || !mod.vals.length) {
            delete entry[mod.type];
          } else {
            entry[mod.type] = mod.vals;

                console.log(JSON.stringify(db));
          
        } break;
        case 'add':
          if (!entry[mod.type]) {
            entry[mod.type] = mod.vals;
          } else {
            mod.vals.forEach(function(v) {
              if (entry[mod.type].indexOf(v) === -1)
                entry[mod.type].push(v);
            });
        } break;
        case 'delete':
          if (!entry[mod.type])
            return next(new ldap.NoSuchAttributeError(mod.type));
          delete entry[mod.type];
          break;
      }
    }
    res.end();
    return next();
  });

  server_ldap.del(SUFFIX, authorize, function(req, res, next) {
    console.log("DELETE");
    dn = req.dn.toString();
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));
    delete db[dn];
    console.log(JSON.stringify(db));
    res.end();
    return next();
  });
//------------------------------------------------------------------Update





//-------------------------------------------------------------------Query
  server_ldap.search(SUFFIX, authorize, function(req, res, next) {
    console.log("SEARCH");
    dn = req.dn.toString();
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));
    var scopeCheck;
    switch (req.scope) {
      case 'base':
        if (req.filter.matches(db[dn])) {
          res.send({
            dn: dn,
            attributes: db[dn]
          });
        }
        res.end();
        return next();
      case 'one':
        scopeCheck = function(k) {
          if (req.dn.equals(k))
            return true;
          var parent = ldap.parseDN(k).parent();
          return (parent ? parent.equals(req.dn) : false);
        };
        break;
      case 'sub':
        scopeCheck = function(k) {
          return (req.dn.equals(k) || req.dn.parentOf(k));
        };
        break;
    }
    Object.keys(db).forEach(function(key) {
      if (!scopeCheck(key))
        return;
      if (req.filter.matches(db[key])) {
        res.send({
          dn: key,
          attributes: db[key]
        });
      }
    });
    res.end();
    return next();
  });

  server_ldap.compare(SUFFIX, authorize, function(req, res, next) {
    console.log("COMPARE");
    dn = req.dn.toString();
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));
    if (!db[dn][req.attribute])
      return next(new ldap.NoSuchAttributeError(req.attribute));
    var matches = false;
    var vals = db[dn][req.attribute];
    for (var i = 0; i < vals.length; i++) {
      if (vals[i] === req.value) {
        matches = true;
        break;
      }
    }
    res.end(matches);
    return next();
  });
//-------------------------------------------------------------------Query



  }
}
module.exports = Ldap;
