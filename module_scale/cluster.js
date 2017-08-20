"use strict";

//Global configurations
var config  = require('../config');

var client, dn, change;

class Cluster{
    constructor(server_ldap){
        var server_ldap     = server_ldap;
        var logger          = config.logger;
        var app             = config.app;
        var ldap            = config.ldap;
        var os              = config.os;
        var cluster         = config.cluster;
        var http            = config.http;
        var httpProxy       = config.httpProxy;
        var assert          = config.assert;
        var numCPUs         = config.os.cpus().length;

        var proxyServers = app.get('config').addresses.map(function (target) {
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
                server.listen(app.get('config').port_proxy, app.get('config').ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' Reverse proxy: Listening on '+ app.get('config').URL_proxy +'/');
                });
        } else if (cluster.worker.id === 2){
                server_ldap.listen(app.get('config').port_ldap, app.get('config').ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' LDAP server: Listening on '+ app.get('config').URL_LDAP +'/');
                });
        } else if (cluster.worker.id === 3){
                app.listen(app.get('config').port_http_1, app.get('config').ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' HTTP server 1: Listening on '+ app.get('config').URL_http_1 +'/');
                });
        } else if (cluster.worker.id === 4){
                app.listen(app.get('config').port_http_2, app.get('config').ip, function () {
                    logger.info('\nWorker_'+ cluster.worker.id + ' PID_' + process.pid +
                    ' HTTP server 1: Listening on '+ app.get('config').URL_http_2 +'/');
                });
        } else {     
            
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
                res.writeHead(200);
                res.end('hello world ' + process.pid +'\n');
      

                //cluster.on('new_server', function(worker) {

                var spawn = require('child_process').spawn;
                var child = spawn('node', ['SerdidorDaEquipa.js', parseInt(4000+Math.random()*5000) ]);
        

                //var child = spawn('node', ['servers/SerdidorDaEquipa.js', port_routes]);
                //var data = {pid: child.pid, port: port_routes, date: Date()};
                //db_children.insert( data, function(err, data){});
                //logger.info('\nProcesso PID ' + child.pid + ' do servidor no porto ' + port_routes + '\n' + data);

                child.stdin.write('Hello there!');
                child.stderr.on('data', function (data) {
                    console.log('\nThere was an error: ' + data);
                    //logger.error('\nThere was an error: ' + data);
                });
                child.stdout.on('data', function (data) {
                    console.log('\nWe received a reply: \n' + data);
                    //logger.info('\nWe received a reply: \n' + data);
                });
                //});

            });

            server = server.listen(8000, function(err) {
                if (err) throw err;
                //var host = server.address().address;
                //var port = server.address().port;
                var host = 'localhost';
                var port = '8000';

                console.log('Server listening at http://%s:%s/', host, port);
            });
      

            //module.exports = function (inp, callback) {
            //  callback(null, inp + ' BAR (' + worker.process.pid + ')')
            //}

            console.log('Worker_' + cluster.worker.id + ' PID_' + process.pid + ' started');
        }
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


/* ---agora
var lastSocketKey = 0;
var socketMap = {};
*/


/*
server.on('connection', function(socket) {
    // generate a new, unique socket-key
    var socketKey = ++lastSocketKey;
    // add socket when it is connected
    socketMap[socketKey] = socket;
    socket.on('close', function() {
        // remove socket when it is closed
        delete socketMap[socketKey];
    });
});
*/


//Handle SIGTERM and SIGINT (ctrl-c) nicely
//process.once('SIGTERM', end);
//process.once('SIGINT', end);


/*
function end() {
    // loop through all sockets and destroy them
    Object.keys(socketMap).forEach(function(socketKey){
        socketMap[socketKey].destroy();
    });

    //after all the sockets are destroyed, we may close the server!
    server.close(function(err){
        if(err) throw err();

        console.log('Server stopped');
        //exit gracefully
        process.exit(0);
    });
}
*/

/* ---agora
var os = require('os');

setInterval(function () {
//CPU Usage
  var load = os.loadavg();
  var message = "  1 Min: %" + Math.floor(load[0]*100) + 
                "  5 min: %" + Math.floor(load[1]*100) +
                " 15 min: %" + Math.floor(load[2]*100);
  console.log(message);
}, 5000);

setInterval(function () {
//Memory Usage
  var freemem = os.freemem();
  var totalmem = os.totalmem();
  var message =  " Free Mem: " + Math.floor(freemem/1000000000) +
                " Total Mem: " + Math.floor(totalmem/1000000000);
  console.log(message);
}, 5000);

*/
