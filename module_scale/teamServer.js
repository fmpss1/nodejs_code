"use strict";


const express = require('express');
const app = express();

var ip = "localhost";	//127.0.0.1
var port = process.argv[2];

app.get('/', function (req, res) {
  res.send('Hello World!');
  console.log('teamServer: CP with PID_' + process.pid + ' received a request to http://' + ip + ':' + port +'/');
})

process.stdin.resume();

process.stdin.on('data', function (data) {
  console.log('teamServer: ' + data);
});

process.on('SIGINT', function () {		//Mesmo este não está a funcionar
//process.on('SIGUSR2', function () {
  console.log("What doesn't kill me makes me stronger.");
});

var server = app.listen(port, ip, function () {
  console.log(`teamServer: CP started with PID_${process.pid}: Listening on http://${ip}:${port}/`);
});
