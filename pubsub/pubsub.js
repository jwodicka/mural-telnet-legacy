'use strict';
var log = require('winston');
var events = require('eventemitter2');

var pubsub = new events.EventEmitter2();

// use module.exports?
module.exports = pubsub;
