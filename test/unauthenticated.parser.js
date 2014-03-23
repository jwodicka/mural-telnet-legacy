'use strict';
/*global describe: false, it: false, before: false, beforeEach, false */
var parser = require('../parser/unauthenticated.parser.js');
var winston = require('winston');
var events = require('events');
//winston.remove(winston.transports.Console); // Don't log to the console during tests!
var sinon = require('sinon');
var i18n = require('i18next');

var systemCommands;
var unauthedParser;
describe('Unauthenticated Parser', function() {
  before(function (done) {
    i18n.init({ lng: 'en',
      resGetPath: 'locales/__lng__/__ns__.json'},
      function () {
        systemCommands = new events.EventEmitter();
        unauthedParser = parser.getUnauthenticatedParser(systemCommands);
        done();
      });
  });

  beforeEach(function () {
    systemCommands.removeAllListeners();
  });

  it('displays a helpfile when requested',
    function (done) {
      systemCommands.on('messageForUser', function (message) {
        message.should.match(i18n.t("authentication.help.help"));
        done();
      });
      unauthedParser('help');
    });

  it('displays a parse error on an unknown command',
    function (done) {
      systemCommands.on('parseError', function (line, message) {
        line.should.match('shprongle');
        message.should.match(i18n.t("authentication.error.command not found"));
        done();
      });
      unauthedParser('shprongle');
    });

  it('raises an authenticate event when requested',
    function (done) {
      systemCommands.on('authenticate', function (words) {
        words[0].should.match('connect');
        words[1].should.match('testUser');
        words[2].should.match('testPassword');
        done();
      });
      unauthedParser('connect testUser testPassword');
    });
});
