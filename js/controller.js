// Controllers don't have much actual work to do.
var ID = null, SCREEN = AirConsole.SCREEN;
var currentWin = WName;
var winIDs = {
    WName: "name_screen",
    WProceed: "proceed_screen",
    WBet: "bet_screen",
}
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

// Shows the player panel, and switches between multiple button panels.
onMsg[MShowWin] = function (value) {
    elem("player_panel").style.display = value == WName ? "none" : "block";
    elem(winIDs[currentWin]).style.display = "none";
    current_win = value;
    elem(winIDs[currentWin]).style.display = "block";
    updateDisplays();
}

function updateDisplays () {
    elem("player_name").innerHTML = player.name;
    elem("player_loot").innerHTML = player.loot;
    elem("player_stash").innerHTML = player.stash;
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
