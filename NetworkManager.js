var ws = require('ws');

var config = require('./config');

var NetworkManager = module.exports = {};

var conn = null;

NetworkManager.connect = function(cb) {
  if (conn !== null)
    return cb(new Error('NetworkManager already has a connection'));

  var host = config.get('net.host');
  var port = config.get('net.port');

  conn = new ws('ws://' + host + ':' + port);

  conn.on('open', cb);
  conn.on('error', errorHandler);
  conn.on('message', messageHandler);
};

var callbacks = {};

NetworkManager.on = function(cmd, cb) {
  if (callbacks.hasOwnProperty(cmd))
    callbacks[cmd].push(cb);
  else
    callbacks[cmd] = [cb];
};

NetworkManager.off = function(cmd, cb) {
  if (!callbacks.hasOwnProperty(cmd))
    return false;
  else if (callbacks[cmd].indexOf(cb) === -1)
    return false;
  else {
    var i = callbacks[cmd].indexOf(cb);
    callbacks[cmd].splice(i, 1);
    return true;
  }

};

NetworkManager.once = function(cmd, cb) {
  NetworkManager.on(cmd, function cbWrap(data) {
    cb(data);
    NetworkManager.off(cmd, cbWrap);
  });
}

function errorHandler(err) {
  console.log('NetworkManager Received an error: ', err);
}

function messageHandler(msg) {
  // Parse JSON message
  var data;
  try {
    data = JSON.parse(msg);
  } catch (e) {
    console.log('Invalid WS message');
    return;
  }

  // Check for cmd
  if (!data.hasOwnProperty('cmd'))
    return console.log('WS message did not have a cmd');

  if (!data.hasOwnProperty(data.cmd))
    return console.log('WS message cmd doesn\'nt have a handler: ' + data.cmd);

  // Get the command callback set
  var cbs = callbacks[msg.cmd];
  // And call them all
  cbs.forEach(function(cb) {
    cb(data);
  });
};
