var log = require('winston');

var getUnauthenticatedParser = function(commands){
  return function(line) {
    
    var words = line.split(' ');
    if(words[0] == 'connect') {
      log.info('Authentication request');
	// Our standard means to auth is a username and password.
	// We use 'connect username password' because it's standard on MUCK/MUSH.
	// Other formats and means may exist in vNext.
      commands['authenticate']({username: words[1], password: words[2]}, function(user){
        commands['connection'].user = user;
        // TODO: standard subscription handler
        commands['subscribe']('user.' + commands['connection'].user, function(message){
          commands['connection'].write(message.toString() + '\n');
        });
      });
    } else if(words[0] == 'help' || words[0] == '%help') {
      // TODO: Actual helpfile. Should be a separate file loaded by system.
      commands['connection'].write('Have some helpfile. Only don\'t.\n');
    } else {
      // We don't recognize the command. Push the user toward authentication.
      commands['connection'].write('Huh? \"connect <username> <password>\" or type \"help\"\n');
    }
  }
}
exports.getUnauthenticatedParser = getUnauthenticatedParser;
