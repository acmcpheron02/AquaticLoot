// Common file for both.
Sugar.extend();
var AC = null;
var onMsg = {};


// Codes. The actual numbers don't matter, but the constants will
// be the same across all devices.
var n = 0;
const MPing = n++, MResult = n++;                             // Common messages
const MShowWin = n++, MSyncPlayer = n++;                      // Screen messages
const MSubmitPlayer = n++, MProceed = n++, MBet = n++, MScrew = n++; // Ctl msgs
const PAudience = n++, PDiver = n++;                             // Player types
const RSuccess = n++, RBadMessage = n++;                        // Failure codes
const RIDExists = n++, RNameTaken = n++, RNotDiver = n++;       // Failure codes
const WName = n++, WWait = n++, WProceed = n++, WBet = n++;       // Ctl windows
const DNone = n++, DProceed = n++, DRetreat = n++;          // Proceed decisions
const SUnable = n++, SAble = n++, SLocked = n++, SUsed = n++;    // Screw states
delete n;


// Get an element by id.
function elem (id) { return document.getElementById(id); }

// Easy click handler adding.
function onClick (id, func) { elem(id).addEventListener("click", func); }

// Dump stuff to console and the debug div.
function log (msg) {
    var el = document.createElement("p");
    el.innerHTML = msg;
    console.log(msg);
    document.getElementById("message_log").appendChild(el);
}


// This just delegates to other functions, and usually sends something back.
// Swaps positions of device_id and data for delegates because sometimes a
// function doesn't care who sent it and JS lets you fudge function params.
function handleMsg (device_id, data) {
    if (!data.type) {
        AC.message(device_id, Result(RBadMessage));
        return
    }
    var res = onMsg[data.type](data.value, device_id);
    if (res.isArray()) {
        res.forEach(msg => AC.message(device_id, msg));
    } else if (res) {
        AC.message(device_id, res);
    }
}

// We might have to react to some failure results, but usually, do nothing.
onMsg[MResult] = function (value) {
    switch (value) {
        case MSuccess: return false; break;
    }
}

// Like the hello message in the scaffolding.
onMsg[MPing] = function (value) {
    log("Ping from {0}".format(device_id));
    if (value == 2) return Success(); else return Ping(value + 1);
}


// We're using dumb objects because I'm not sure what'll happen if we try to
// use actual classes for the screen and controller to talk to each other.

// Create a player object.
function Player (id, name) {
    return {
        type: PAudience,
        id: id,
        name: name,
        betLoot: 0,
        screw: SUnable,
    };
}

// Diver objects are just player objects that can explore and screw.
function Diver (id, name) {
    return Player(id, name).add({
        type: PDiver,
        proceed: DNone,
        screw: SAble,
        suitColor: "blue",
        helmColor: "gold",
        loot: 0,
        stash: 0,
        relics: [],
    }, {deep: true});
}

// Common messages.
function Ping (val)           { return { type: MPing, value: val }; }
function Result (val)         { return { type: MResult, value: val }; }
function Success ()           { return { type: MResult, value: RSuccess }; }

// Screen to Controller messages.
function ShowWin (val)        { return { type: MShowWin, value: val }; }
function SyncPlayer (val)     { return { type: MSyncPlayer, value: val }; }

// Controller to Screen messages.
function SubmitPlayer (val)   { return { type: MSubmitPlayer, value: val }; }
function Proceed (val)        { return { type: MProceed, value: val }; }
function Bet (val)            { return { type: MBet, value: val }; }
