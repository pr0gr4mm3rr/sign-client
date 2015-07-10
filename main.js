var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

var moniker = require('moniker').generator([
  'adjectives.txt',
  'nouns.txt'
]);

var NetworkManager = require('./NetworkManager');

var config = require('./config');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OSX it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.config = config;

  // TODO auto-update

  // See if we have a name assigned to us
  if (!config.get('name')) {
    // We need to be configured
    // Set a temporary name for identification on server
    var tempname = config.get('tempname');
    if (!tempname) {
      config.set('tempname', tempname = moniker.choose());
      config.save();
    }
    mainWindow.loadUrl('file://' + __dirname + '/html/installed.html');

    // Wait for a job from the server
    NetworkManager.connect(waitForJob);
  } else {

    // Check what we should be displaying from server
    console.log('Contacting server for job');

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/html/index.html');

  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

});

function waitForJob() {
  // Tell the server we are online
  NetworkManager.call('registertemp', {
    name: config.get('tempname')
  });

  NetworkManager.once('initjob', function(data) {
    console.log('We got a job!');
  });
};
