// Common file for both.
Sugar.extend();

var AC = null;

// Controller messages.
var CMsg = {
    WhatsGood: "CWhatsGood";
    SubmitName: "CSubmitName";
    Proceed: "CProceed";
    Retreat: "CRetreat";
}

// Screen messages.
var SMsg = {
    WhatsGood: "SWhatsGood";
    NameAccepted: "SNameAccepted";
    NameRejected: "SNameRejected";
}

// Dump stuff to console and the debug div if it exists.
function log (msg) {
    var el = document.createElement("p");
    el.innerHTML = msg;
    console.log(msg);
    document.getElementById("message_log").appendChild(el);
}

// Both the controller and screen need to know about this class.
class Player {
    constructor (name) {
        this.name = name;
        this.loot = 0;
        this.relics = [];
    }
}
