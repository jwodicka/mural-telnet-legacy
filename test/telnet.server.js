var server = require('../telnet.server/server.js');
var winston = require('winston');
winston.remove(winston.transports.Console); // Don't log to the console during tests!
var sinon = require('sinon');
var net = require('net');


var port = 8888;
var authStub;
var subStub;
var pubStub;

describe ('Telnet Server', function(){
  before(function(done){
    // server.start should take an associative array of values (including a port number) and a callback,  and execute the callback once the server is running. 
    authStub = sinon.stub().returns('testUser');
    subStub = sinon.stub().returns();
    pubStub = sinon.stub().returns(1);
    server.start({port: port, authenticate: authStub, subscribe: subStub, publish: pubStub}, function() {
      done();
    })
  }); 

  beforeEach(function(){
    authStub.reset();
    pubStub.reset();
    subStub.reset();
  });

  it('accepts a connection', function(done){
    var client = net.connect({port: port}, function(){
      client.end();
      done();
    });
  });

  it('accepts multiple connections', function(done){
    // This does NOT test whether multiple simultaneous connections are possible; they may be created in series.
    var client1 = net.connect({port: port}, function(){
      var client2 = net.connect({port: port}, function(){
        client1.end();
	client2.end();
	done();
      });
    });
  });

  it('banners on login', function(done){
    var client = net.connect({port: port});
    client.on('data', function(data){
      data.toString().should.match(/Welcome to Mural/);
      client.end();
      done();
    });
  });

  it('passes credentials to the auth service', function(done){
    var client = net.connect({port:port}, function(connect){
      client.on('data', function(data){
	if(data.toString().match(/testUser/)) { 
	  authStub.calledWith({username: 'testUser', password: 'testPassword'}).should.be.okay; 
	  done(); 
	}
      });
      client.write('connect testUser testPassword\n');
      client.end();
    });
  });
  
  it('publishes messages to a remote PoP', function(done){
    var client = net.connect({port:port}, function(connect){
      client.on('close', function(hadError){
        pubStub.calledWith('comm.TestWorld', 'Test Line').should.be.okay;	
        hadError.should.be.false;
	done(); 
      });
      client.write('connect testUser testPassword\n');
      client.write('%world TestWorld\n');
      client.write('Test Line\n');
      client.end();
    });
  });

  it('does not pass credentials twice', function(done){
    var client = net.connect({port: port}, function(connect){
      client.on('data', function(data){
        if(data.toString().match(/testUser/)) {
          authStub.calledOnce.should.be.okay;
	  done();
	}
      });
      client.write('connect testUser testPassword\n');
      client.end();
    });
  });

  it('displays error to user at unknown system command', function(done){
    var client = net.connect({port: port}, function(connect){
      client.on('data', function(data){
        if(data.toString().match(/Huh\?/)) {
          done();
	}
      });
      client.write('connect testUser testPassword\n');
      client.write('%SHPROGLE!\n');
      client.end();
    });
  });
  
  it('does not accept system commands without an authenticated user', function(done){
    var client = net.connect({port: port}, function(connect){
      client.on('data', function(data){
        if(data.toString().match(/Huh\? \"connect/)){      
  	  done();
        }
      });
      client.write('%world TestWorld\n');
      client.end();
    });
  });

  it('displays help when prompted at the base shell', function(done){
    var client = net.connect({port: port}, function(connect){
      client.on('data', function(data){
        if(data.toString().match(/helpfile/)){
          done();
        }
      });
      client.write('help\n');
      client.end();
    });
  });

  it('subscribes to the user channel when authenticated', function(done){
    var client = net.connect({port: port}, function(connect){
      client.on('data', function(data){
        if(data.toString().match(/testUser/)) {
          authStub.calledOnce.should.be.okay;
	  subStub.calledWith('user.testUser').should.be.okay;
	  done();
	}
      });
      client.write('connect testUser testPassword\n');
      client.end();
    });
  });
});
