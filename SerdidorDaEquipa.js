"use strict";

const express = require('express')
const app = express()
var port = process.argv[2];

app.get('/', function (req, res) {
  res.send('Hello World!')
  console.log('Hello World!');
})

app.listen(port, function () {
  console.log('Example app listening on ' + port + '!');
})