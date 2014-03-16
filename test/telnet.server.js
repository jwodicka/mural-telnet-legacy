var server = require('../telnet.server/server.js');
var winston = require('winston');
winston.remove(winston.transports.Console); // Don't log to the console during tests!
var net = require('net');
var port = 8888;

describe ('Telnet Server', function(){
  before(function(done){
    // server.start should take a port number and a callback, and execute the callback once the server is running.
    server.start(port, function() {
      done();
    })
  }); 

  it('should accept a connection', function(done){
    var client = net.connect({port: port}, function(){
      done();
    });
  });

  it('should accept multiple connections', function(done){
    // This does NOT test whether multiple simultaneous connections are possible; it is possible for them to be created in series.
    var client1 = net.connect({port: port}, function(){
      var client2 = net.connect({port: port}, function(){
        done();
      });
    });
  });

  it('should banner on login', function(done){
    var client = net.connect({port: port});
    client.on('data', function(data){
      data.toString().should.match(/Welcome to Mural/);
      done();
    });
  });
  
});
