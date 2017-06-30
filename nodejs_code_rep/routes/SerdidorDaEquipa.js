"use strict";

const express = require('express');
const app = express();

var ip = "localhost";	//127.0.0.1
var port = process.argv[2];

app.get('/', function (req, res) {
  res.send('Hello World!');
  console.log('Hello World! From process.pid: ' + process.pid + ' to http://' + ip + ':' + port +'/');
})

process.stdin.resume();

process.stdin.on('data', function (data) {
    console.log('Received data: ' + data);
});

process.on('SIGINT', function () {		//Mesmo este não está a funcionar
//process.on('SIGUSR2', function () {
    console.log("What doesn't kill me makes me stronger.");
});

var server = app.listen(port, ip, function () {
    console.log(`Servidor: Listening on http://${ip}:${port}/`);
});