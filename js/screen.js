// This is going to hold most of our actual logic and do all the work.
var players = new Map();
var divers = [], audience = [];
var deck = [];
var relicsFound = 0;
var events = [];
var round = 0;
var roundOver = false;

function divers () { return players.filter({type: PDiver}); }
function audience () { return players.exclude({type: PDiver}); }


// Set the message handler and create the deck.
window.onload = function () {
    // Init AirConsole instance.
    AC = new AirConsole();

    AC.onReady = () => log("Let's get this party started, fam.");
    AC.onConnect = id => log("Player arrived: ID {0}".format(id));
    AC.onDisconnect = id => log("Player left: ID {0}".format(id));
    
    // This just delegates to other functions, and usually sends something back.
    AC.onMessage = handleMsg;
    
    currentWin = WTitle;
    //showWin(WTitle);
    onClick("startGameButton", beginGame);
};

// See shared.js for MPing and MResult.

// Receive a player object from a controller.
onMsg[MSubmitPlayer] = function (value, device_id) {
    if (players.has(device_id)) return Result(RIDExists);
    else if (Array.from(players.values).some(x => x.name) == value.name)
        return Result(RNameTaken);
    else players.set(device_id, new Diver(device_id, value.name));
    console.log(value);
    log("{0} has joined the game.".format(value.name));
    return [Success(), SyncPlayer(value), ShowWin(WWait)];
}

// A controller has submitted its proceed decision. Maybe advance.
onMsg[MProceed] = function (value, device_id) {
    if (divers.none({id: device_id})) return Result(RNotDiver);
    players.get(device_id).proceed = value;
    AC.message(device_id, ShowWin(WWait));
    log(`${players.get(device_id).name} has submitted a decision.`);
    if (divers.count({proceed: DNone}) == 0) {
        if (roundOver) roundStart(); else beforeReveal();
    }
    return Success();
}

onMsg[MBet]   = function () { log("TODO!"); }
onMsg[MScrew] = function () { log("TODO!"); }

function showWinDev ()      { return; }  // TODO
function updateDisplays ()  { return; }  // TODO


// Creates a dumb object representing an event.
function Event (type, value = 0, subtype = null) {
    return { type: type, value: value, subtype: subtype };
}

// Create the initial deck.
function createDeck () {
    for (i of (1).upto(15)) deck.push(Event(ELoot, i));
    for (i of (1).upto(5)) (3).times(() => deck.push(Event(EHazard, 0, i)));
    deck.shuffle();
}


// Start the game, already!
function beginGame () {
    createDeck();
    showWin(WGame);
    roundStart();
}

// Start a new round.
function roundStart (num) {
    roundOver = false;
    events = [];
    deck.append(Event(ERelic, 0, ++round));
    deck = deck.shuffle();
    for (p of players) (p.type = PDiver ? divers : audience).push(p);
    log("Starting round " + round);
    revealEvent();
}

// Send messages to the controllers.
function nextEvent () {
    log("Awaiting decisions from players for next round.");
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
        log("The following divers are leaving and split {0} loot: {1}".format(
         total % leaving.length, leaving.map("name").join(", ")));
        // Only someone leaving on their own can collect the relics.
        if (leaving.length == 1) {
            var relics = events.remove(e => e.type == ERelic);
            for (r of relics) {
                r.value = relicValues[relicsFound++];
                leaving[0].relics.append(r);
            }
            log(`This diver has also claimed ${relics.length} relics.`);
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
        log("The remaining divers split {0} loot and leave {1} behind.".format(
         split, event.value));
    } else if (event.type == ERelic) {
        // TODO: Probably just show nice graphic event. Nothing can happen until
        // a player leaves alone with it.
        log("A relic has appeared! Leave alone to grab it.");
    } else if (event.type == EHazard) {
        for (i of (1).upTo(5)) {
            if (events.count(e => e.type == EHazard && e.subtype == i) == 2) {
                overRun();
                return;
            }
        }
        log("Hazard type {0} has appeared. ".format(event.subtype) +
         "A second of the same type will end the current round.");
    }
    nextEvent();
}

// Game over, man. You got too much of a bad thing.
function overRun () {
    // If an overrun happens, the last event to have come out is guaranteed to
    // be a hazard. We'll pop it out of the deck.
    log("An overrun has occurred. The offending hazard will be removed " +
     "from the deck.");
    events.pop();
    for (d of divers) d.loot = 0;
    finishRound();
}

// Wait for players to want to move to the next round.
function finishRound () {
    log("The round has ended. Remaining relics are lost.");
    roundOver = true;
    events.remove(e => e.type == ERelic);
    deck = deck.append(events).shuffle();
    // TODO: Wait for approval to move to next round, or finish the game.
    if (round < 5) {
        log("Awaiting approval to move to next round.");
        for (p of players) AC.message(p.id, ShowWin(WProceed));
    } else {
        finishGame();
    }
}

// Show who won.
function finishGame () {
    var standings = divers().sortBy("stash");
    log("Game over. The winner is {0} with {1} stashed loot.".format(
     standings.last().name, standings.last().loot));
}
