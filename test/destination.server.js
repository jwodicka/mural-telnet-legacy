var destServer = require('../destination.server/destination.server.js');
var winston = require('winston');
var sinon = require('sinon');

describe('Destination Server', function(){
/*  before(function(done){
    destServer.start('', function(){
      done();
    });
  });
*/
  it('provides a list of all destinations visible to a user');

  it('allows an authorized user to add a destination');

  it('allows an authorized user to remove a destination');

  it('provides a list of all destinations at which a user has at least one PoP');

  it('allows a user to add a PoP at a destination');

  it('allows a user to remove a PoP from a destination');

  it('requests activation of a PoP when requested by the user');

  it('provides details about a destination when requested');

  it('includes PoPs for a user in destination information for that user');

  it('provides details about a PoP when requested');

});
