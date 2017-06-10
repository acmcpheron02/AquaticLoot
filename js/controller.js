// Controllers don't have much actual work to do.
var ID = null, SCREEN = AirConsole.SCREEN;
var currentWin = WName;
var winIDs = {
    WName: "name_screen",
    WProceed: "proceed_screen",
    WBet: "bet_screen",
}

window.onload = function() {
    // Init the AirConsole object
    AC = new AirConsole({
        orientation: AirConsole.ORIENTATION_PORTRAIT
    });
    ID = AC.device_id;

    AC.onReady = () => log("Welcome. You are ID {0}.".format(ID));
    AC.onMessage = handleMsg;

    // Send data to the screen, when clicking on the button.
    onClick("ping_btn", () => AC.message(SCREEN, Ping()));
    onClick("join_divers_btn", submitDiver);
    onClick("join_audience_btn", submitAudience);
};

function submitAudience () {
    var player = Player(AC.device_id, elem("name_input").value);
    AC.message(AirConsole.SCREEN, SubmitPlayer(player));
}

function submitDiver () {
    var player = Diver(AC.device_id, elem("name_input").value);
    AC.message(AirConsole.SCREEN, SubmitPlayer(player));
}

onMsg[ShowWin] = function (value) {
    elem(winIDs[currentWin]).style.display = "none";
    current_win = value;
    elem(winIDs[currentWin]).style.display = "block";
}
