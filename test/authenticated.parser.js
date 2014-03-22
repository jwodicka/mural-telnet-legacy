var parser = require('../parser/authenticated.parser.js');
var winston = require('winston');
var events = require('events');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
var sinon = require('sinon');
var i18n = require('i18next');

var systemCommands;
var authedParser;
describe('Authenticated Parser', function(){
  before(function(done){
    i18n.init({ lng: 'en', 
      //debug: true, 
      resGetPath: 'locales/__lng__/__ns__.json'},
      function(t){
        systemCommands = new events.EventEmitter();
        authedParser = parser.getAuthenticatedParser(systemCommands);
        done();
      });
  });

  beforeEach(function(){
    systemCommands.removeAllListeners();
  });

  it('lists remote worlds when requested');


  it('requests association to a remote world when requested', 
    function(done){
      systemCommands.on('activateRemote', function(remote){
        remote.should.match('testWorld');
        done();
      });
    authedParser('%world testWorld');
  }); 
	  
  it('displays a helpfile when requested',
    function(done){
      systemCommands.on('messageForUser', function(message){
        message.should.match(i18n.t("frontend.help.help"));
        done();
      });
    authedParser('%help');
  }); 

  it('passes messages not matching the pattern to a remote world');

  it('displays an error on a matching pattern without associated command', 
    function(done){
      systemCommands.on('parseError', function(line, message){
        line.should.match(/%SHPRONGLE!/);
        message.should.match(i18n.t("frontend.error.command not found"));
        done();
      });
    authedParser('%SHPRONGLE!');
  }); 
});
