var winston = require('winston');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
//require('better-stack-traces').install();
var sinon = require('sinon');
var outgoingTelnet = require('../outgoing.telnet.destination.js');
var pubsub = require('../pubsub/pubsub.js');
var net = require('net');

var testServer;

describe('Outgoing Telnet', function() {
  before(function (done) {
    outgoingTelnet.start(pubsub, function() {
      testServer = net.createServer(function (connection) { connection.end('Hi, bye!'); });
      testServer.listen(7357);
      done();
    });
  });

  after(function (done) {
    testServer.close();
    done();
  });

  it('connects to a remote telnet server', function (done) {
    outgoingTelnet.startPoP('TestTelnet', {host: 'localhost', port: 7357}, function () { done (); });
  });

  it('maintains a connection to a remote telnet server');

  it('transmits text to a remote telnet server');

  it('transmits text from a remote telnet server');

  it('closes a connection to a remote telnet server when requested');

  it('notifies on remote server closure of connection');
});
