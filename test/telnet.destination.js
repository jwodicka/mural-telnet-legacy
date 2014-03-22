var telnetDestination = require('../telnet.destination/telnet.destination.js');
var destination = require('./destination.js');
var winston = require('winston');

describe('Telnet Destination', function(){
/*  before(function(done){
    telnetDestination.start('', function(){
      done();
    });
  });
*/
  destination.shouldBehaveLikeADestination();
});
