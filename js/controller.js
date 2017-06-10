// Controllers don't have much actual work to do.
window.onload = function() {
    // Init the AirConsole object
    AC = new AirConsole({
        orientation: AirConsole.ORIENTATION_PORTRAIT
    });

    AC.onReady = function () {
        log("Welcome to the loot-off. You are ID {}.".format(AC.device_id));
    };

    // Overwrite the onMessage method.
    // Whenever we receive a message from the screen we display it on our log-div
    AC.onMessage = function (device_id, data) {
        if (device_id === AirConsole.SCREEN) {
            if (data == SMsg.WhatsGood) {
                log("oh my god screenpai noticed me uguuuuu~");
            }
        }
    };

    // Send data to the screen, when clicking on the button
    var hello_button = document.getElementById('hello_button');
    hello_button.addEventListener('click', function() {
        AC.message(AirConsole.SCREEN, { type: "CWhatsGood" });
    });
};
