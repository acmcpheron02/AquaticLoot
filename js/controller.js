// Controllers don't have much actual work to do.
var ID = null, SCREEN = AirConsole.SCREEN;
var player = null;

window.onload = function() {
    // Init the AirConsole object
    AC = new AirConsole({
        orientation: AirConsole.ORIENTATION_PORTRAIT
    });
    ID = AC.device_id;

    AC.onReady = () => log("Welcome. You are ID {0}.".format(ID));
    AC.onMessage = handleMsg;

    onClick("buttonPlayGame", submitDiver);
    onClick("buttonWatchGame", submitAudience);
    onClick("buttonDeeper", submitProceed);
    onClick("buttonReturn", submitRetreat);
    //onClick("buttonScrew", beginScrew);  // This ain't exist yet lol
};

// Just update player values on the controller screen.
onMsg[MSyncPlayer] = function (value) {
    player = value;
    updateDisplays();
}


onMsg[MShowWin] = showWin;

function showWinDev (win) {
    elem("playerPanel").style.display = win == WName ? "none" : "block";
}

function updateDisplays () {
    elem("playerName").innerHTML = player.name;
    elem("playerActivity").innerHTML = player.type == PDiver ?
     "Diver" : "Audience";
    elem("playerGoldRound").innerHTML = "Loot: {0}".format(player.loot);
    elem("playerGoldTotal").innerHTML = "Stash: {0}".format(player.stash);
}

// Button actions.
function submitAudience () {
    player = Player(AC.device_id, elem("nameInput").value);
    AC.message(SCREEN, SubmitPlayer(player));
}

function submitDiver () {
    player = Diver(AC.device_id, elem("nameInput").value);
    AC.message(SCREEN, SubmitPlayer(player));
}

function submitProceed ()  { AC.message(SCREEN, Proceed(true)); }
function submitRetreat ()  { AC.message(SCREEN, Proceed(false)); }
function beginScrew ()     { AC.message(SCREEN, Screw(null)); }
