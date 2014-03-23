'use strict';
var log = require('winston');
var byline = require('byline');
var unauthenticatedParser = require('../parser/unauthenticated.parser.js');
var authenticatedParser = require('../parser/authenticated.parser.js');
var events = require('events');
var tex = require('i18next');

var getConnectionHandler = function getConnectionHandler(args) {
  return function (connection) {
    // The server has just had a client connect.

    // We do some setup, including giving it a random ID and a stream so we can work with lines instead of raw data.
    connection.randomNumber = Math.random();
    log.info('Connection established: ' + connection.randomNumber);
    var stream = byline.createStream(connection);
    var systemCommands = new events.EventEmitter();
    connection.user = null;
    connection.activeRemote = null;
    args.connection = connection;
    tex.init({ lng: 'en', getAsynch: false,
          resGetPath: 'locales/__lng__/__ns___.json' });
    var getStringFor = function (key) { return tex.t(key); };

    connection.parser = unauthenticatedParser.getUnauthenticatedParser(systemCommands);

    // We have a connection object. It is a socket.
    // At some point it will end. All good things must.
    connection.on('end', function () {
      // We might eventually do fancy cleanup. We don't right now.
      log.info('Connection ended' + connection.randomNumber);
    });

    // Authenticate handles requests from users.
    systemCommands.on('authenticate', function (words) {
      log.info('Authentication request');
      // Our standard means to auth is a username and password.
      // We use 'connect username password' because it's standard on MUCK/MUSH.
      // Other formats and means may exist in vNext.
      // We may want to have this take an associate array at this level.
      args.authenticate({username: words[1], password: words[2]}, function (user) {
        //log.info('Callback from authenticate' + commands['connection'].randomNumber);
        connection.emit('authentication', user);
      });
    });
    // Authentication handles our setup after a successful auth.
    connection.on('authentication', function (user) {
      connection.user = user;
      // TODO: standard subscription handler
      args.subscribe('user.' + args.connection.user, function (message) {
        connection.write(message.toString() + '\n');
      });
      // Changes out the parser this connection uses to an authenticated one.
      // In the future, this might be customized by user.
      connection.parser =
        authenticatedParser.getAuthenticatedParser(
          systemCommands,
          getStringFor
          //    function (t) { return 'ping?'; }
        );
    });

    systemCommands.on('messageForUser', function (message) {
      connection.write(message);
    });

    systemCommands.on('messageForRemote', function (target, message) {
      if (!target) {
        target = connection.activeRemote;
      }
      // TODO: Check if target is a valid one.
      log.info('Target world: ' + target);
      if (target) {
        args.publish('comm.' + target, message);
      } else {
        systemCommands.emit('parseError', message, tex.t("remotes.not connected"));
      }
    });

    systemCommands.on('queryState', function (request, callback) {
      // This is currently a lookup. Eventually this will be an actual DB wrapper.
      // Right now it isn't.
      // Also it should handle its caching and such.
      // Also it should implement security.
      var lookup = {
        'user': function () {callback(connection.user); },
        'remoteWorlds':
          args.getRemotes(connection.user,
            function (remotes) { callback(remotes); })
      };
      lookup[request];
    });

    systemCommands.on('updateState', function (key, value) {
      // does this have a callback? Is it a sprode? Does it shprongle?
    });

    systemCommands.on('activateRemote', function (remote) {
      // This actually wants to establish the connection. We're ignoring that step.
      connection.activeRemote = remote;
    });

    systemCommands.on('parseError', function (line, message) {
      connection.write(message);
    });

    stream.on('data', function (line) {
      // Our line-based stream has a line for us!  This is a command of some sort from the user.
      // We explicitly make it a string and trim leading and trailing whitespace.
      log.info('Data Received: ' + line.toString());
      var lineAsString = line.toString().trim();

      // This parser could be authed or unauthed.
      connection.parser(lineAsString);
    });
    // This is sent immediately to the new client on connection.
    connection.write(tex.t("frontend.welcome banner"));
  };
};

exports.getConnectionHandler = getConnectionHandler;
