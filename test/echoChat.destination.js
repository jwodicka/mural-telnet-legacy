/*global describe: false, it: false, before: false, beforeEach, false */
var winston = require('winston');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
//require('better-stack-traces').install();
var sinon = require('sinon');
var echoChat = require('../echoChat.destination/echoChat.destination.js');
var pubsub = require('../pubsub/pubsub.js');

var testMessage =
  {
    'from': 'TestUser',
    'id': '12345',
    'message': 'test message'
  };

describe('Echo Chat', function () {
  before(function (done) {
    echoChat.start(pubsub, function () {
      done();
    }); 
  });

  beforeEach(function (done) {
    pubsub.removeAllListeners();
    echoChat.activate('TestUser', function () { done(); });
  });
/*  
  it('activates a PoP', function (done) {
    // A PoP is tied to a destination, but is the intersection of it and a user.
    // EchoChat is a destination.
 
    echoChat.activate('TestUser', function () {
      done();
    });
  });
*/
  it('echoes a message it receives', function (done) {
 //   echoChat.activate('TestUser', function () {
      pubsub.on('comm.echoChat.TestUser', function (message) {
        winston.info('in the test callback with message from ' + message.from);
        if(message.from === 'EchoChat') {
          message.message.should.match(testMessage.message);
          done();
        }
      });
     winston.info('About to send a message from the test'); 
     pubsub.emit('comm.echoChat.TestUser', testMessage);
 //   });
  });

  it('echoes a message it recieved to another user', function (done) {
 //   echoChat.activate('TestUser', function () {
      echoChat.activate('User2', function () {
        pubsub.on('comm.echoChat.User2', function (message) {
          message.message.should.match(testMessage.message);
          done();
        });
        pubsub.emit('comm.echoChat.TestUser', testMessage);
      });
   // });
  });
});
