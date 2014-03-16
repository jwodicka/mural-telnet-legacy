var server = require('../telnet.server/server.js');
var winston = require('winston');
winston.remove(winston.transports.Console); // Don't log to the console during tests!
var sinon = require('sinon');
var net = require('net');


var port = 8888;
var authStub;

describe ('Telnet Server', function(){
  before(function(done){
    // server.start should take an associative array of values (including a port number) and a callback,  and execute the callback once the server is running. 
    authStub = sinon.stub().returns('testUser');
    server.start({port: port, authServer: authStub}, function() {
      done();
    })
  }); 

  it('should accept a connection', function(done){
    var client = net.connect({port: port}, function(){
      done();
    });
  });

  it('should accept multiple connections', function(done){
    // This does NOT test whether multiple simultaneous connections are possible; they may be created in series.
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

  it('should pass credentials to the auth service', function(done){
    authStub.reset();
    var client = net.connect({port:port}, function(connect){
      client.on('data', function(data){
	if(data.toString().match(/Welcome to Mural/)) {} 
	else { 
	  authStub.calledWith({username: 'testUser', password: 'testPassword'}).should.be.okay; 
	  done(); 
	}
      });
      client.write('connect testUser testPassword');
    });
  });
});
