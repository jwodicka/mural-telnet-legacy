var winston = require('winston');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
//require('better-stack-traces').install();
var sinon = require('sinon');
var destinationServer = require('../destination.server/destination.server.js');
var telnetServer = require('../telnet.server/server.js');

var outgoingTelnet = require('../outgoing.telnet.destination.js');

var pubsub = require('../pubsub/pubsub.js');
var net = require('net');
var uuid = require('node-uuid');

var authStub;
var testServer;
var destinationID;
var PoPID;
var userID = 'testUser';

describe('Outgoing Telnet', function() {
  before(function (done) {
    authStub = sinon.stub().callsArgWith(1, 'testUser');
    destinationServer.start(pubsub, function () {
      testServer = net.createServer(function (connection) { 
        connection.uuid = uuid.v1();
        connection.write('connection established');
        connection.on('data', function (data) {
          winston.info('(TT): data received: ' + data.toString());
          if(data == 'ping') {
            connection.write('pong');
          }
          if(data == 'uuid') {
            winston.info('Test Server has request for uuid');
            connection.write(connection.uuid);
          }
        });
        connection.on('close', function () {
          winston.info('Test Telnet Connection closed!');
        });
        connection.setTimeout(1000, function () { connection.end('Bye!'); }); 
      });
      testServer.listen(7357);
      destinationServer.createDestination({name: 'outgoingTelnet', start: outgoingTelnet.start, startPoP: outgoingTelnet.startPoP}, function (destID) {
        destinationID = destID;
        destinationServer.createPoP(userID, 
          {destinationID: destinationID, options: {host: 'localhost', port: '7357'}}, 
          function (newPoPID) { 
            PoPID = newPoPID;
            telnetServer.start({port: 5321, authenticate: authStub, pubsub: pubsub, getRemotes: destinationServer.listPoPs, activatePoP: destinationServer.activatePoP}, function () { done (); });
        });
      });
    });
  });

  after(function (done) {
    testServer.close();
    done();
  });

  it('requests a PoP from the destination server and receives confirmation');

  it('sends and receives data from a remote PoP', function (done) {
     var client = net.connect({port: 5321}, function () {
      client.on('data', function (data) {
        winston.info('Data received: ' + data);
        if(data.toString().match(/connection established/)) {
          client.write('ping\n');
        }
        if(data.toString().match(/pong/)) {
          client.end();
          done();
        }
      });
      client.write('connect testUser testPassword\n');
      client.write('%world ' + PoPID + '\n');
     });
  });

  it('receives the same PoP when requesting again', function (done) {
    var client1 = net.connect({port: 5321}, function () {
      client1.write('connect testUser testPassword\n');
      client1.write('%world ' + PoPID + '\n');
      var uuid = false;
      client1.on('data', function (data) {
        winston.info('client1 recieved data: ' + data.toString());
        if(data.toString().match(/is active/)) {
          client1.write('uuid\n');
        //  client1.write('ping\n');
        }
        if(data.toString().match(/-/)) {
          uuid = data.toString();
          client1.end();
          var client2 = net.connect({port: 5321}, function () {
            client2.write('connect testUser testPassword\n');
            client2.write('%world ' + PoPID + '\n');
            client2.on('data', function (data) {
              winston.info('client2 recieved data: ' + data.toString());
              if(data.toString()==uuid) {
                client2.end();
                done();
              }
              if(data.toString().match(/is active/)) {
                client2.write('uuid\n');
              }
            });
          });
        }
      });
    });
  });

});
