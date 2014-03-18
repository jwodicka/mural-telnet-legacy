var log = require('winston');

var getAuthenticatedParser = function(commands){
  return function(line) {
    // TODO: Move the '%' into a configurable variable.
    if(line.charAt(0) === '%') {
      // This is our special char! We care about this line, yay!
	  
      // This gets the first 'word' of the line
      //  It either slices at the first space, or takes the whole line if there is no space.
      var endOfSlice = line.indexOf(' ');
      if(endOfSlice === -1) { endOfSlice = line.length; }
      var firstWord = line.slice(0, endOfSlice);

      // This is the core of our command parser. It checks for known commands and errors to user if none match.
      if(firstWord === '%world') {
         // This should check connection.remotes to see if it knows about this world. If not, it should error.
        // Eventually, this should support partials.
        commands['connection'].activeRemote = line.slice(line.indexOf(' ') + 1);
      } else if(firstWord === '%list-remotes') {
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
        } else {
       // If we're here, it means we don't recognize this command. This is usually fine and means the user typoed.
         commands['connection'].write('Huh? (Type \'%help\' for help with Mural.)\n');
        }
      } else {
        // This does not lead with our special character, and is meant for a remote.
        if(commands['connection'].activeRemote){
        // Open question: Do we ever care when a publish complete? i.e. should we provide a callback?
        commands['publish']('comm.' + commands['connection'].activeRemote, line);
      } else {
         commands['connection'].write('Not connected to remote! Try: %list-remotes');
      }
    }
  };
}
exports.getAuthenticatedParser = getAuthenticatedParser;
