// This is going to hold most of our actual logic and do all the work.
var players = new Map();
var currentDivers = [];

function divers () { return players.filter(x => x.type == PDiver); }

window.onload = function () {
    // Init AirConsole instance.
    AC = new AirConsole();

    AC.onReady = () => log("Let's get this party started, fam.");
    AC.onConnect = id => log("Player arrived: ID {0}".format(id));
    AC.onDisconnect = id => log("Player left: ID {0}".format(id));
    
    // This just delegates to other functions, and usually sends something back.
    AC.onMessage = handleMsg;
};

// See shared.js for MPing and MResult.

// Receive a player object from a controller.
onMsg[MSubmitPlayer] = function (value, device_id) {
    if (divers.has(device_id)) return Result(RIDExists);
    else if (divers.any(x => x.name) == value.name) return Result(RNameTaken);
    else divers.set(device_id, new Diver(device_id, value.name));
    return [Success(), SyncPlayer(value), ShowWin(WProceed)];
}
