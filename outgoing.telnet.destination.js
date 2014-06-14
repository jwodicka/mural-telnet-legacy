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
    // And once we've got it set up, that seems like a fabulous time to callback!
    callback();
  });
  
};

module.exports = outgoingTelnet;