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

    onClick("join_divers_btn", submitDiver);
    onClick("join_audience_btn", submitAudience);
    onClick("proceed_btn", submitProceed);
    onClick("retreat_btn", submitRetreat);
    onClick("screw_btn", beginScrew);
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
    elem("playerLoot").innerHTML = player.loot;
    elem("playerStash").innerHTML = player.stash;
}

// Button actions.
function submitAudience () {
    player = Player(AC.device_id, elem("name_input").value);
    AC.message(SCREEN, SubmitPlayer(player));
}

function submitDiver () {
    player = Diver(AC.device_id, elem("name_input").value);
    AC.message(SCREEN, SubmitPlayer(player));
}

function submitProceed ()  { AC.message(SCREEN, Proceed(true)); }
function submitRetreat ()  { AC.message(SCREEN, Proceed(false)); }
function beginScrew ()     { AC.message(SCREEN, Screw(null)); }
