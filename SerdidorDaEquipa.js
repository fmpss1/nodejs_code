"use strict";

const express = require('express')
const app = express()

var ip = "localhost";	//127.0.0.1
var port = process.argv[2];

app.get('/', function (req, res) {
  res.send('Hello World!')
  console.log('Hello World!');
})

var server = app.listen(port, ip, function () {
    console.log(`Servidor: Listening on http://${ip}:${port}/`);
});