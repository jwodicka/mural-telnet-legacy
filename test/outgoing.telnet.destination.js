var winston = require('winston');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
//require('better-stack-traces').install();
var sinon = require('sinon');
var outgoingTelnet = require('../outgoing.telnet.destination.js');
var pubsub = require('../pubsub/pubsub.js');
var net = require('net');

var testServer;
var testConnection;

describe('Outgoing Telnet', function() {
  before(function (done) {
    outgoingTelnet.start(pubsub, function() {
      testServer = net.createServer(function (connection) { 
        testConnection = connection;
        connection.write('connection established');
        connection.on('data', function (data) {
          if(data == 'ping') {
            connection.write('pong');
          }
        });
        connection.setTimeout(800, function () { connection.end('Bye!'); }); 
      });
      testServer.listen(7357);
      done();
    });
  });

  beforeEach(function (done) {
    pubsub.removeAllListeners();
    done();
  });

  afterEach(function (done) {
    if(testConnection) {
      testConnection.end('Test over!');
    }
    done();
  });

  after(function (done) {
    testServer.close();
    done();
  });

  it('connects to a remote telnet server', function (done) {
    outgoingTelnet.startPoP('TestTelnet', {host: 'localhost', port: 7357}, function () { done (); });
  });

  it('maintains a connection to a remote telnet server when the PoP is reactivated');

  it('transmits text to a remote telnet server', function (done) {
    pubsub.on('TestTelnet', function (message) {
      if(message.message.match(/pong/)) {
        done();
      }
    });
    outgoingTelnet.startPoP('TestTelnet', {host: 'localhost', port: 7357}, function () {
  //    testConnection.on('data', function (data) {
    //    winston.info('Got data! ' + data);
  //      if(data.match(/ping/)){
    //      done();
  //      }
    //  });
      pubsub.emit('TestTelnet', {message: 'ping', from: 'TestUser'});
    });
  });

  it('transmits text from a remote telnet server', function (done) {
    pubsub.on('TestTelnet', function (message) {
      if(message.message.match(/established/)) {
        done();
      }
    });
    outgoingTelnet.startPoP('TestTelnet', {host: 'localhost', port: 7357}, function () { });
  });
  
  it('notifies on remote server closure of connection', function (done) {
    pubsub.on('TestTelnetForTimeouts', function (message) {
      if(message.message.match(/connection closed/)) {
        testConnection = false;
        done();
      }
    });
    outgoingTelnet.startPoP('TestTelnetForTimeouts', {host: 'localhost', port: 7357}, function () { });
  });

  it('closes a connection to a remote telnet server when requested');
});
