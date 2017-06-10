// This is going to hold most of our actual logic and do all the work.
window.onload = function () {
    // Init AirConsole instance.
    AC = new AirConsole();

    AC.onReady = function () {
        log("Let's get this party started, fam.");
    };

    // Gets called when a device connects
    AC.onConnect = function (device_id) {
        log("HERE COMES A NEW CHALLENGER: ID {}".format(device_id));
    };

    // Gets called when a device disconnects
    AC.onDisconnect = function (device_id) {
        log("This dude just pussied out: ID {}".format(device_id));
    };

    // Receive a message from a device
    AC.onMessage = function (device_id, data) {
        // Receive "greet" message
        if (data.type === "CWhatsGood") {
            log("What's good, ID {}?".format(device_id));
            AC.message(device_id, {type: "SWhatsGood"});
        }
    };
};
