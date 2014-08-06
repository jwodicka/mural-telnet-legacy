var winston = require('winston');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
//require('better-stack-traces').install();
var sinon = require('sinon');

var pubsub = require('../pubsub/pubsub.js');

var logger = require('../logger/logger.js');

describe('Logging', function () {
  before(function (done) {
    logger.start(pubsub, function () {
      done();
    });
  });

  after(function (done) {
    pubsub.removeAllListeners();
    done();
  });

  it('receives logs for a PoP and provides them when requested');

  it('allows querying logs by n most recent', function (done) {
    pubsub.on('nmostrecent', function (message) {
      if(message.from == 'userLog') {
       // winston.info('Got a message back from userlog!');
       // winston.info('1: ' + message.message[0].message.toString());
       // winston.info('2: ' + message.message[1].message.toString());
       // winston.info('3: ' + message.message[2].message.toString());

        message.message[0].message.toString().should.match('second message');
        message.message[2].message.toString().should.match('fourth message');
        done();
      }
    });
    var counter=0;
    pubsub.on('nonexistentPoP', function (message) {
      counter++;
      if(counter == 4) {
        winston.info('In Test, about to send a query');
        pubsub.emit('query', {to: 'userLog', from: 'nmostrecent', message: '', query: {limit: 3, PoP: 'nonexistentPoP'}});
      }
    });
    //winston.info('number of onAny listeners: ' + pubsub.listenersAny().toString());
    pubsub.emit('nonexistentPoP', {message: 'first message', to: 'nonexistentPoP', from: 'nonexistentPoP'});
    pubsub.emit('nonexistentPoP', {message: 'second message', to: 'nonexistentPoP', from: 'nonexistentPoP'});
    pubsub.emit('nonexistentPoP', {message: 'third message', to: 'nonexistentPoP', from: 'nonexistentPoP'});
    pubsub.emit('nonexistentPoP', {message: 'fourth message', to: 'nonexistentPoP', from: 'nonexistentPoP'});
  });

  it('allows querying logs given a time span');

  it('does not return logs from another user');

  it('allows querying logs for multiple PoPs of a user');
});
