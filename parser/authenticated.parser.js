'use strict';
var log = require('winston');
var events = require('events');
var tex = require('i18next');

var getAuthenticatedParser = function (systemCommands) {
  var localCommands = new events.EventEmitter();

  localCommands.on('connectToDestination', function (worldName) {
    systemCommands.emit('activateDestination', worldName.slice(worldName.indexOf(' ') + 1, worldName.length));
  });

  localCommands.on('listDestinations', function () {
    // Eventually we may cache this?
    systemCommands.emit('queryState', 'destinations', function (destinations) {
      // This is formatting a reply.
      systemCommands.emit('messageForUser', tex.t(
        "destinations.list",
        {worlds: destinations.reduce(
          function (a, b) {
            return a.toString() + b.toString() + '\n';
          }
        )}
      ));
    });
  });

  localCommands.on('help', function () {
    systemCommands.emit('messageForUser', tex.t("frontend.help.help"));
  });

  return function (line) {
    // log.info('In authed parser with line: ' + line);
    // This gets the first 'word' of the line
    //  It either slices at the first space, or takes the whole line if there is no space.
    var endOfSlice = line.indexOf(' ');
    if (endOfSlice === -1) { endOfSlice = line.length; }
    var firstWord = line.slice(0, endOfSlice);

    var verbs = {
      '%world': 'connectToDestination',
      '%list-destinations': 'listDestinations',
      '%help': 'help'
    };

    if (localCommands.emit(verbs[firstWord], line)) {
    //  log.info('Emitted event: ' + verbs[firstWord]);
    } else {
      if (systemCommands.emit(verbs[firstWord], line)) {
      } else {
        if (line.charAt(0) === '%') {
          // TODO: Check 2nd char; %% to pass through to system regardless.
          systemCommands.emit('parseError', line, tex.t("frontend.error.command not found"));
        } else {
          // This does not lead with our special character, and is meant for a remote.
          systemCommands.emit('messageForDestination', '', line);
        }
      }
    }
  };
};
exports.getAuthenticatedParser = getAuthenticatedParser;
