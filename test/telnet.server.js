'use strict';
/*global describe: false, it: false, before: false, beforeEach, false */
var server = require('../telnet.server/server.js');
var winston = require('winston');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
require('better-stack-traces').install();
var sinon = require('sinon');
var net = require('net');
var pubsub = require('../pubsub/pubsub.js');


var port = 8888;
var authStub;
// var subStub;
// var pubStub;
var invalidAuthStub;
var sessionStub;
var activatePoPStub;

describe('Telnet Server', function () {
  before(function (done) {
    // server.start should take an associative array of values (including a port number) and a callback,  and execute the callback once the server is running.
    authStub = sinon.stub().callsArgWith(1, 'testUser');
    invalidAuthStub = sinon.stub().returns('false');
    activatePoPStub = sinon.stub().returns('true');;
 //   subStub = sinon.stub().callsArgWith(1, 'Subscribed');
 //   pubStub = sinon.stub().returns(1);
    sessionStub = sinon.stub().callsArgWith(1, [{name: 'Remote0'}, {name: 'Remote1'}, {name: 'Remote2'}]);
    server.start({port: port, authenticate: authStub, pubsub: pubsub, getRemotes: sessionStub, activatePoP: activatePoPStub}, function () {
      done();
    });
  });

  beforeEach(function () {
    invalidAuthStub.reset();
    authStub.reset();
//    pubStub.reset();
//    subStub.reset();
  });

  it('accepts a connection', function (done) {
    var client = net.connect({port: port}, function () {
      client.end();
      done();
    });
  });

  it('accepts multiple connections', function (done) {
    // This does NOT test whether multiple simultaneous connections are possible; they may be created in series.
    var client1 = net.connect({port: port}, function () {
      var client2 = net.connect({port: port}, function () {
        client1.end();
        client2.end();
        done();
      });
    });
  });

  it('banners on login', function (done) {
    var client = net.connect({port: port});
    client.on('data', function (data) {
      data.toString().should.match(/Welcome to Mural/);
      client.end();
      done();
    });
  });

  it('displays help when prompted at the base shell', function (done) {
    var client = net.connect({port: port}, function () {
      client.on('data', function (data) {
        if (data.toString().match(/helpfile/)) {
          done();
        }
      });
      client.write('help\n');
      client.end();
    });
  });

  describe('Authentication', function () {

    it('passes credentials to the auth service', function (done) {
      var client = net.connect({port: port}, function () {
        client.on('close', function () {
          authStub.calledWith({username: 'testUser', password: 'testPassword'}).should.be.ok;
          done();
        });
        client.write('connect testUser testPassword\n');
        client.end();
      });
    });

    it('returns a user for valid credentials');

    it('does not pass credentials ogain once authenticated', function (done) {
      var client = net.connect({port: port}, function () {
        client.on('close', function (hadError) {
          authStub.calledOnce.should.be.ok;
          hadError.should.be.false;
          done();
        });
        client.write('connect testUser testPassword\n');
        client.write('connect testUser testPassword\n');
        client.end();
      });
    });


    it('permits authenticated commands after valid credentials');
    it('does not permit authenticated commands after invalid credentials');

    it('does not authenticate invalid credentials');
    it('displays an error message for invalid credentials');

    it('allows account creation');
  });

  describe('Remote World Passthrough', function () {

    it('publishes messages to a remote PoP', function (done) {
      pubsub.on('TestWorld', function (message) {
        winston.info('In the listener!');
        client.end();
        done();
      });
      var client = net.connect({port: port}, function() {
        client.write('connect testUser testPassword\n');
        client.write('%world TestWorld\n');
        client.write('Test Line\n');
        
        //client.end();
        
        // winston.info('and now we wait for callback' + pubsub.listeners('comm.TestWorld').toString());
      });
    });

    it('receives messages from a remote PoP');
    // This should involve throwing a message that the remote stub expects and will reply to.

  });

  describe('System Commands', function () {
    // These are how a user interacts with our system.
    // They are focused around getting a connection to a remote.
    // They require an authenticated user.

    it('displays error to user at unknown system command', function (done) {
      var client = net.connect({port: port}, function () {
        client.on('data', function (data) {
          if (data.toString().match(/Huh\? \(Type/)) {
            done();
          }
        });
        client.write('connect testUser testPassword\n');
        client.write('%SHPROGLE!\n');
        client.end();
      });
    });

    it('does not accept system commands without an authenticated user', function (done) {
      var client = net.connect({port: port}, function () {
        client.on('data', function (data) {
          if (data.toString().match(/Huh\? \'connect/)) {
            done();
          }
        });
        client.write('%world TestWorld\n');
        client.end();
      });
    });

    it('displays a list of remotes when prompted', function (done) {
      var client = net.connect({port: port}, function () {
        client.on('data', function (data) {
          if (data.toString().match(/Destinations/)) {
            sessionStub.calledWith('testUser').should.be.ok;
            done();
          }
        });
        client.write('connect testUser testPassword\n');
        client.write('%list-destinations\n');
        client.end();
      });

      it('allows the user to add a new remote');
      it('displays the list of all known servers which can be remoted to');
    });

    it('displays the authenticated-user helpfile when prompted');
    it('connects to a remote when prompted');
    it('displays an error when text is sent in remote-mode with no remote active');

  });

  it('subscribes to the user channel when authenticated', function (done) {
    var client = net.connect({port: port}, function () {
      client.on('close', function () {
        authStub.calledOnce.should.be.ok;
        pubsub.listeners('user.testUser').should.be.ok;
        //subStub.calledWith('user.testUser').should.be.ok;
        done();
      });
      client.write('connect testUser testPassword\n');
      client.end();
    });
  });

});
