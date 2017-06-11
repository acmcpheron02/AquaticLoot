// This is going to hold most of our actual logic and do all the work.
var players = new Map();
var divers = [], audience = [];
var deck = [];
var relicValues = [5, 5, 5, 10, 10];
var relicsFound = 0;
var events = [];
var inGame = false;
var roundNum = 0;

function divers () { return players.filter({type: PDiver}); }
function audience () { return players.exclude({type: PDiver}); }

window.onload = function () {
    // Init AirConsole instance.
    AC = new AirConsole();

    AC.onReady = () => log("Let's get this party started, fam.");
    AC.onConnect = id => log("Player arrived: ID {0}".format(id));
    AC.onDisconnect = id => log("Player left: ID {0}".format(id));
    
    // This just delegates to other functions, and usually sends something back.
    AC.onMessage = handleMsg;
    
    createDeck();
};

// See shared.js for MPing and MResult.

// Receive a player object from a controller.
onMsg[MSubmitPlayer] = function (value, device_id) {
    if (divers.has(device_id)) return Result(RIDExists);
    else if (divers.any(x => x.name) == value.name) return Result(RNameTaken);
    else divers.set(device_id, new Diver(device_id, value.name));
    return [Success(), SyncPlayer(value), ShowWin(WWait)];
}

// A controller has submitted its proceed decision. Maybe advance.
onMsg[MProceed] = function (value, device_id) {
    if (divers.none({id: device_id})) return Result(RNotDiver);
    players.get(device_id).proceed = value;
    AC.message(device_id, ShowWin(WWait));
    if (divers.count({proceed: DNone}) == 0) beforeReveal();
    return Success();
}

onMsg[MBet]   = function () { log("TODO!"); }
onMsg[MScrew] = function () { log("TODO!"); }

// Creates a dumb object representing an event.
function Event (type, value = 0, subtype = null) {
    return { type: type, value: value, subtype: subtype; }
}

// Create the initial deck.
function createDeck () {
    for (i of (1).upto(15)) deck.push(Event(ELoot, i));
    for (i of (1).upto(5)) (3).times(() => deck.push(Event(EHazard, 0, i)));
    deck.shuffle();
}

// Start a new round.
function roundStart (num) {
    events = [];
    roundNum++;
    deck.append(new Relic(roundNum));
    deck = deck.shuffle();
    for (p of players) (p.type = PDiver ? divers : audience).push(p);
    revealEvent();
}

// Send messages to the controllers.
function nextEvent () {
    for (d of divers) AC.message(d.id, ShowWin(WProceed));
    for (a of audience) AC.message(a.id, ShowWin(WBet));
    // And then we wait for the Proceed message to say everyone's ready.
}

// Before revealing the event, take care of anyone leaving.
function beforeReveal () {
    var newDivers = [], leaving = [];
    for (d of divers) (d.proceed == DProceed ? newDivers : leaving).push(d);
    if (leaving.length > 0) {
        // TODO: Graphically show departing divers getting the loot.
        var total = events.sum("value");
        events.forEach(e => e.value = 0);
        events.filter((e, i) => e.type == ELoot || i == events.length).last()
         .value = total % leaving.length;
        for (p of leaving) {
            p.stash += total / leaving.length + p.loot;
            p.loot = 0;
        }
        // Only someone leaving on their own can collect the relics.
        if (leaving.length == 1) {
            var relics = events.remove(e => e.type == ERelic);
            for (r of relics) {
                r.value = relicValues[relicsFound++];
                leaving[0].relics.append(r);
            }
        }
    }
    divers = newDivers;
    audience.append(leaving);
    if (divers.length > 0) revealEvent();
    else finishRound();
}

// Reveal the result, give out points, or potentially end the game.
function revealEvent () {
    var event = deck.pop();
    events.push(event);
    // TODO: Graphically show the result.
    if (event.type == ELoot) {
        var split = event.value / divers.length
        event.value = event.value % divers.length
        for (d of divers) {
            d.loot += split;
            AC.message(d.id, SyncPlayer(d));
        }
    } else if (event.type == ERelic) {
        // TODO: Probably just show nice graphic event. Nothing can happen until
        // a player leaves alone with it.
    } else if (event.type == EHazard) {
        for (i of (1).upTo(5)) {
            if (events.count(e => e.type == EHazard && e.type == i) == 2) {
                overRun();
                return;
            }
        }
    }
    nextEvent();
}

// Game over, man. You got too much of a bad thing.
function overRun () {
    // If an overrun happens, the last event to have come out is guaranteed to
    // be a hazard. We'll pop it out of the deck.
    events.pop();
    for (d of divers) d.loot = 0;
}

function finishRound () {
    deck = deck.append(events).shuffle();
    // TODO: Wait for approval to move to next round, or finish the game.
    for (p of players) AC.message(p.id, ShowWin(WWait));
}
