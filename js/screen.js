/**
  This file will be included by the screen.html
*/
var air_console = null;

var init = function() {
  var message_log_ele = document.getElementById('screen_log');

  // var cube_ele = document.getElementById('cube');

  // var moveCube = function() {
  //   var min = 100;
  //   var max = window.innerWidth - 100;
  //   var rand_pos = Math.floor(Math.random() * (max - min + 1)) + min;
  //   cube_ele.style.left = rand_pos + "px";
  //   return rand_pos;
  // };

  // Init AirConsole instance
  air_console = new AirConsole();

  air_console.onReady = function() {
    appendTextToElement(message_log_ele, "OnReady - You are the Screen!");
  };

  // Gets called when a device connects
  air_console.onConnect = function(device_id) {
    appendTextToElement(message_log_ele, "Connected device id: " + device_id);
  };

  // Gets called when a device disconnects
  air_console.onDisconnect = function(device_id) {
    appendTextToElement(message_log_ele, "Disconnect device id: " + device_id);
  };

  // Receive a message from a device
  air_console.onMessage = function(device_id, data) {
    // Receive "greet" message
    if (data.action === AC.Action.EnterAsPlayer) { // see js/shared.js
      appendTextToElement(message_log_ele, data.playerName + " has joined the game");
      // Lets send something back
      this.message(device_id, { message: "Ahoy thar, " + data.playerName });
    }

  };
};

window.onload = init;
