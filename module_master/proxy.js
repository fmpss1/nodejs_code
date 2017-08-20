"use strict";

//Dependencies
var express   = require('express');
var router    = express.Router();

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
