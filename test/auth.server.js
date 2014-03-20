var auth = require('../auth.server/auth.js');
var winston = require('winston');
// winston.remove(winston.transports.Console); // Don't log to the console during tests!
var sinon = require('sinon');

describe ('Auth Server', function(){
  before(function(done){
    auth.start('', function(){ 
	    done();
    });
  });

  it('provides a user when given a valid username and password', function(done){
    auth.authenticate({username: 'testUser', password: 'testPassword'}, 
	    function(user) {
		    user.should.equal('testUser');
		    done();
	    });
  });

  it('does not provide a user from an invalid username and password', function(done){
    auth.authenticate({username: 'testUser', password: 'wrongPassword'},
	    function(user) {
		    user.should.be.false;
		    done();
	    });
  });
});
