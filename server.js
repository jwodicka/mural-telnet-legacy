'use strict';
var telnetServer = require('./telnet.server/server.js');

telnetServer.start({'port': 8888}, function () {
  console.log("Telnet Server started");
});
