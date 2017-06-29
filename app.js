"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = require("./server.js")(app);
var routes = require("./routes/routes.js")(app);
var array_childs_pids = require("./routes/routes.js").array_childs_pids;
var array_childs_ports = require("./routes/routes.js").array_childs_ports;
console.log(array_childs_pids);

//var spawn = require('child_process').spawn;
//var child = spawn('cmd', ['/c', 'dir']);

var process_pid = process.pid;

setInterval(function () {
	var os = require('os');
	var cpuCount = os.cpus().length;
	console.log('\n\nNúmero de CPUs disponíveis: ' + cpuCount + '\nPlataforma: ' + process.platform);
	console.log('\nProcesso PID do app: ' + process_pid + '\nNúmero de child PIDs: ' + array_childs_pids.length);
	array_childs_pids.ForEach(function(i){
		console.log(i);
	});
	
	//Linux
	//var spawn = require('child_process').spawn;
	
	
	//console.log(child.pid);
	
	//Windows
	//var spawn = require('child_process').spawn;
	//var child = spawn('tasklist', ["/pid"]);
	
}, 10000);
