'use strict';
var log = require('winston');
var events = require('events');
var net = require('net');

var outgoingTelnet = new events.EventEmitter();

outgoingTelnet.port = 23; // Default telnet port
outgoingTelnet.host = 'localhost';

outgoingTelnet.start = function outgoingTelnetStart(pubsub, callback) {
  outgoingTelnet.pubsub = pubsub;
  callback();
};

outgoingTelnet.startPoP = function outgoingTelnetStartPoP(PoPID, options, callback) {
  var port = outgoingTelnet.port;
  var host = outgoingTelnet.host;

  if(options.port) {
    port = options.port;
  }
  if(options.host) {
    host = options.host;
  }

  var connection = net.connect(port, host, function () { 
    // Insert connection listener here
    connection.on('data', function (data) {
      log.info('(OTD): data from connection ' + connection.localPort + ':' + data);
      outgoingTelnet.pubsub.emit(PoPID, {from: PoPID, message: data.toString()});
    });
    outgoingTelnet.pubsub.on(PoPID, function (message) {
      // This should probably be testing if it comes from our UserID
      // We can also have commands.
      if(message.from !== PoPID) {
        log.info('Writing ' + message.message + ' to ' + PoPID);
        connection.write(message.message);
      }
    });
    connection.on('close', function () {
      outgoingTelnet.pubsub.emit(PoPID, {from: PoPID, message: 'connection closed'});
    });
    // And once we've got it set up, that seems like a fabulous time to callback!
    callback();
  });
  
};

module.exports = outgoingTelnet;
