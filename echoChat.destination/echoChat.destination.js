'use strict';
var log = require('winston');
var events = require('events');

var echoChat = new events.EventEmitter();

echoChat.start = function echoChatStart(pubsub, callback) {
  echoChat.pubsub = pubsub;
  callback();
};

echoChat.activate = function echoChatActivate(PoP, callback) {
  log.info('in activate');
  echoChat.pubsub.on('comm.echoChat.' + PoP, function (message) {
    log.info('in echochat pubsub with message from: ' + message.from);
    if(message.from !== 'EchoChat') {
      log.info('about to emit internal message from ' + message.from);
      log.info('there are ' + events.EventEmitter.listenerCount(echoChat, 'echochat internal message') + ' listeners');
      echoChat.emit('echochat internal message', message);
    }
  });
  echoChat.on('echochat internal message', function (message) {
    log.info(message.message + ' from ' + message.from);
    if(message.from !== 'EchoChat') {
      var newMessage = {from: 'EchoChat', message: message.message};
      log.info('Sending message to: comm.echoChat.' + PoP);
      log.info('there are ' + events.EventEmitter.listenerCount(echoChat.pubsub, 'comm.echoChat.' + PoP) + ' listeners');
      echoChat.pubsub.emit('comm.echoChat.' + PoP, newMessage);
    }
  });
  callback();
};

module.exports = echoChat;
