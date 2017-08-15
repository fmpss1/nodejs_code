"use strict";

//Dependencies
var express = require('express');
var router = express.Router();

//Routes
router.use('/api', require('../routes/api'));

/*
function checkAuth (req, res, next) {
  console.log('checkAuth ' + req.url);
  // don't serve /secure to those not logged in
  // you should add to this list, for each and every secure url
  if (req.url === '/secure' && (!req.session || !req.session.authenticated)) {
    res.render('unauthorised', { status: 403 });
    return;
  }
  next();
}

*/

module.exports = router;



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
