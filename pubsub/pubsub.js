'use strict';
var log = require('winston');
var events = require('events');

var pubsub = new events.EventEmitter();

// use module.exports?
module.exports = pubsub;
