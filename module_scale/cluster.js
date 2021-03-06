"use strict";


/** Dependencies */
var cluster     = require('cluster');
var os          = require('os');
var ldap        = require('ldapjs');
var http        = require('http');
var httpProxy   = require('http-proxy');
var assert      = require('assert');
var mod_events  = require('events');
var mod_child_process = require('child_process');

/** Global configurations */
var config  = require('../config');

var client, dn;

class Cluster{
    constructor(app, server_ldap){
        var app             = app;
        var server_ldap     = server_ldap;
        var logger          = config.logger;
        var numCPUs         = os.cpus().length;

        var proxyServers = config.addresses.map(function (target) {
            return new httpProxy.createProxyServer({
                target: target
            });
        });

        var server = http.createServer(function (req, res) {
            var proxy = proxyServers.shift();
            proxy.web(req, res);
            proxyServers.push(proxy);
        });

        if (cluster.isMaster) {
            console.log(`Master ${process.pid} is running, número de CPUs: ${numCPUs}`);

            for ( var i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('online', function(worker) {
                console.log('Worker_' + worker.id + ' PID_' + process.pid + ' is online');
            });

            cluster.on('exit', (worker, code, signal) => {
                console.log('Worker_'+ worker.id + ' PID_' + process.pid + ' died with code: ' + code + ', and signal: ' + signal);
                console.log('Starting a new worker');
                cluster.fork();
            });
        } else if (cluster.worker.id === 1){
                server.listen(config.port_proxy, config.ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' Reverse proxy: Listening on '+ config.URL_proxy +'/');
                });
        } else if (cluster.worker.id === 2){
                server_ldap.listen(config.port_ldap, config.ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' LDAP server: Listening on '+ config.URL_LDAP +'/');
                });
        } else if (cluster.worker.id === 3){
                app.listen(config.port_http_1, config.ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' HTTP server 1: Listening on '+ config.URL_http_1 +'/');
                });
        } else if (cluster.worker.id === 4){
                app.listen(config.port_http_2, config.ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' HTTP server 2: Listening on '+ config.URL_http_2 +'/');
                });
        } else if (cluster.worker.id === 5){
                newWorker(config.ip_w5, config.port_w5);
        } else if (cluster.worker.id === 6){
                newWorker(config.ip_w6, config.port_w6);
        } else if (cluster.worker.id === 7){
                newWorker(config.ip_w7, config.port_w7);
        } else if (cluster.worker.id === 8){
                newWorker(config.ip_w8, config.port_w8);
        } else {     
            console.log("ERRO: No workers to start!");
        }

//Trocar por switch, fica mais elegante



        function newWorker(ip, port){

            //Descobrir como listar os CP por worker
            //console.log(cluster.worker.process);
/*
//Usar isto para os servidores de equipa
                client = ldap.createClient({ url: config.URL_LDAP });
                dn = 'cn=Worker_'+worker.id+' ,ou=PID_'+process.pid+', o=ldap';
                var newUser = {
                    cn:           'Worker_'+worker.id,
                    objectClass:  'Cluster_worker',
                    userPassword: '',
                    token:        '',
                    state:        'active'
                }
                client.bind(dn, '', function(err) {
                    client.add(dn, newUser, function(err){
                        if(err){
                            console.log('Worker online erro');
                        }
                    });
                });
*/  

            var server = http.createServer((req, res) => {
      
                //cluster.on('new_server', function(worker) {

                var spawn = require('child_process').spawn;
                //Atribuição aleatória dos portos dos CPs
                //var child = spawn('node', ['module_scale/teamServer.js', parseInt(4000+Math.random()*5000) ]);
                //Atribuição específica dos portos dos CPs
                var child = spawn('node', ['module_scale/teamServer.js', 8050 ], {detached: true});


                res.writeHead(200);
                //Resposta ao localhost:8000
                res.end('Worker_'+cluster.worker.id+' PID_'+process.pid+
                    ' started a CP with PID_' + child.pid);

                //var child = spawn('node', ['servers/SerdidorDaEquipa.js', port_routes]);
                //var data = {pid: child.pid, port: port_routes, date: Date()};
                //db_children.insert( data, function(err, data){});
                //logger.info('\nProcesso PID ' + child.pid + ' do servidor no porto ' + port_routes + '\n' + data);

                child.stdin.write('Worker_'+cluster.worker.id+' PID_'+process.pid+
                    ' started a CP with PID_' + child.pid +' Hello there!');

                child.stderr.on('data', function (data) {
                    console.log('There was an error: ' + data);
                    //logger.error('\nThere was an error: ' + data);
                });
                child.stdout.on('data', function (data) {
                    console.log('' + data);
                    //logger.info('\nWe received a reply: \n' + data);
                });
                child.on('close', function(code) {
                    console.log('closing code: ' + code);
                });

                child.on('exit', function(code) {
                    console.log('exit code: ' + code);
                    process.kill(-child.pid);
                    
                });
                //});
                //});

                //Deteta o CRTL+C e termina os child processes ativos desbloqueando o porto utilizado
                process.on('SIGINT', function() {
                    process.kill(-child.pid);
                });
            });

            server = server.listen(port, function(err) {
                if (err) throw err;
                //var host = server.address().address;
                //var port = server.address().port;
                console.log('Worker_' + cluster.worker.id + ' PID_' + process.pid +' listening at http://%s:%s/', ip, port);
            });
      
            console.log('Worker_' + cluster.worker.id + ' PID_' + process.pid + ' started');
        }












/*
        setInterval(function () {
            //CPU Usage
            var load = os.loadavg();
            var message =   "  1 Min: %" + Math.floor(load[0]*100) + 
                            "  5 min: %" + Math.floor(load[1]*100) +
                            " 15 min: %" + Math.floor(load[2]*100);
            console.log(message);
        }, 5000);

        setInterval(function () {
            //Memory Usage
            var freemem = os.freemem();
            var totalmem = os.totalmem();
            var message =   " Free Mem: " + Math.floor(freemem/1000000000) +
                            " Total Mem: " + Math.floor(totalmem/1000000000);
            console.log(message);
        }, 5000);
*/        
   }
}

module.exports = Cluster;


/* ---agora
setInterval(function() {}, 1e6);
process.on('SIGINT', function() {
  console.log('SIGINT signal received');
  process.exit(1);
})




/*
//process.on('SIGKILL', function() {
process.on('SIGTERM', function() {
  server.close(function() {
    process.exit(0);
  });
});
*/
