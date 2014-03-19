var log = require('winston');

var getAuthenticatedParser = function(commands){
  commands['connection'].on('connectToWorld', function(worldName){
    commands['connection'].activeRemote = worldName; 
  });

  commands['connection'].on('listRemoteWorlds', function(){
    // Eventually we may cache this?
    commands['getRemotes'](commands['connection'].user, function(remotes){
      commands['connection'].remotes = remotes;
      // This is formatting a reply.
      var reply = 'Remotes:\n';
      for(var i=0; i<commands['connection'].remotes.length; i++){
        reply += commands['connection'].remotes[i].name;
        reply += '\n';
      }
      commands['connection'].write(reply);
    });
  });

  commands['connection'].on('sendToRemote', function(message, remote) {
    if(commands['connection'].activeRemote){
    // Open question: Do we ever care when a publish complete? i.e. should we provide a callback?
    commands['publish']('comm.' + remote, message);
    } else {
      commands['connection'].write('Not connected to remote! Try: %list-remotes');
    } 
  });

  return function(line) {
    // This gets the first 'word' of the line
    //  It either slices at the first space, or takes the whole line if there is no space.
    var endOfSlice = line.indexOf(' ');
    if(endOfSlice === -1) { endOfSlice = line.length; }
    var firstWord = line.slice(0, endOfSlice);
    
    var verbs = {
	    '%world': 'connectToWorld',
	    '%list-remotes': 'listRemoteWorlds'
    } 
      
    if(commands['connection'].emit(verbs[firstWord], line)) {
      
    } else {
      if(line.charAt(0) === '%') {
        // TODO: Check 2nd char; %% to pass through to system regardless.
        commands['connection'].emit('parseError', line, 'Huh? (Type \'%help\' for help with Mural.)');
      } else {
      // This does not lead with our special character, and is meant for a remote.
      commands['connection'].emit('sendToRemote', line, commands['connection'].activeRemote);
      }
    }  
  };
}
exports.getAuthenticatedParser = getAuthenticatedParser;
