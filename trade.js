
// Get information from input box
console.log($('#crypto').val());

var keepGoing = 1;

// setup socket
var socket;
var namespace = '/feed';
if (socket == null) {
    socket = io.connect('//' + document.domain + ':' + location.port + namespace, { pingInterval: 5000, 'sync disconnect on unload': true });
}

// set variables
var target;
var startBet;
var currency;
var startBalance = 0;
var currentBalance;
var origStart;

var minValue = 0.00000001;
var smallestValue = 0.00000001;
var decimals = 8;
var currentBet = smallestValue;
var ladder = 0;
var maxLadder = 0;
var maxLadders = 8; // maximum number of steps to go before resetting
var increase = 1.1; // 10% increase
var timeOut = 500;
var stopLoss; // if balance goes below this, quit

var totalWins = 0, totalLosses = 0;
var bet = smallestValue;
var stopGain; // If I make x% gains, stop also
var stopGainMultiplier = 1.2;

var equalizeNumber = 20;
var equalizeCounter = equalizeNumber;
var equalizeLosses = 0;
var needToEqualize = true;
var modNumber = 8;

var maxBigLosses = 10; // If get to this ladder and lose this many times, quit, eventually adjust with the % increase 
var bigLosses = 0; // current big losses

var balance = 0.0001;

var partOfWhole = 300;

(function setVariables() {
    target = "49"
    startBet = smallestValue;
    currency = "LTC";
})();

// get amount of coins
function getInitialBalance() {
    var values = {
        'target': target,
        'currency': currency,
        'bet': currentBet
    }
    socket.emit('dice_roll', values, function (callback) {
        // console.log(callback);
        console.log(callback.data.balance);
        startBalance = callback.data.balance;
        currentBalance = startBalance;
        stopLoss = startBalance - startBalance * 0.0001; // 1/100th a percent of total value
        origStart = startBalance;
        stopGain = stopGainMultiplier * origStart; // 
        console.log("Stop loss: " + stopLoss);
        startAutoTrading(callback);
    });
}
getInitialBalance();

var lossesInARow = 0;

// start trading
function startAutoTrading(callback) {
    //console.log(callback);
    currentBalance = callback.data.balance;
    adjustBet();
    var tg = (currentBalance - startBalance).toFixed(decimals);
    if (ladder > maxLadder) maxLadder = ladder;

    console.log("Current Value: " + currentBalance +
        " Total gains: " + tg +
        ", gains percentage: " + ((((currentBalance - startBalance) / (startBalance)) * 100).toFixed(3)) + "%" +
        ", gains since beginning " + ((((currentBalance - origStart) / (origStart)) * 100).toFixed(3)) + "%");
    console.log("Total wins/losses: " + totalWins + "/" + totalLosses +
        ", win percentage: " + (((totalWins / (totalLosses + totalWins)) * 100).toFixed(3)) + "%" +
        ", longest ladder: " + maxLadder +
        ",  lossesInARow: " + lossesInARow +
        ",  Current Bet: " + bet);

    if (ladder % modNumber == 0 && ladder != 0 && callback.data.win == 0 && needToEqualize == true) {
        equalizeCounter = equalizeNumber;
        equalizeLosses = 0;
        console.log("Equalize");
        equalize(equalizeCounter, callback);
        return;
    }

    needToEqualize = true;

    // if win, reset to smallest increment
    if (callback.data.win == 1) {
        // console.log("Won!");
        smallestValue = currentBalance / partOfWhole;
        smallestValue = (smallestValue).toFixed(8);
        // console.log(smallestValue);
        totalWins++;
        lossesInARow = 0;
        // $('#winLoss').append("<li>Win</li>");
        lossesInARow = 0;
        ladder = 0;
        bet = smallestValue;
        bet = castNumber(bet);
        needToEqualize = true;
    } else {
        // lost, get new value to bet
        // console.log("Lost");

        lossesInARow++;
        ladder++;
        totalLosses++;
        // $('#winLoss').append("<li>Lost</li>");
        upBet();
    }
    singleTrade();

    // needToEqualize = false;
}

function upBet() {
    // console.log("upBet");
    if (ladder == maxLadders) {
        bet = smallestValue;
        bet = castNumber(bet);
        return;
    }
    bet = (bet * 2) * increase + parseFloat(smallestValue);
    bet = castNumber(bet);
}

function castNumber(number) {
    number = parseFloat(number).toFixed(decimals);    
    number = parseFloat(number).toPrecision(2); // sig figs
    return number;
}

function adjustBet() {
    // if value has increased 20%, up the starting value by 5%
    var adjusted = false;
    while (currentBalance > startBalance * 1.001) {
        adjusted = true;
        startBalance *= 1.0005;
        smallestValue = currentBalance / partOfWhole; //millionth of current balance
        smallestValue = castNumber(smallestValue);
    }
    if (adjusted){
        console.log("Adding 0.05% to base value because added 0.1% value to starting value");
        console.log("Old start: " + startBalance);
        console.warn("New start: " + startBalance + " Original start: " + origStart + ", percent increase since start:" + ((((currentBalance - origStart) / (origStart)) * 100).toFixed(3)) + "%");
    }
}

function equalize(numberLeft, origCallback) { // If all of these return a losing bet, exit, or start over
    var valuesTemp = {
        'target': target,
        'currency': currency,
        'bet': 0.00000001,
    }
    // console.log(values);
    socket.emit('dice_roll', valuesTemp, function (callback) {
        numberLeft--;
        if (callback.data.win == 0) {
            console.log("\tLost");
            equalizeLosses++
        } else {
            console.log("\tWon");
        }
        if (numberLeft == 0) {
            // if lost all of them, exit
            if (equalizeLosses >= equalizeNumber * .70) { // pass with better than 70% fail
                console.warn("After " + equalizeNumber + " losses, stopping current ladder since 70% failed");
                // reset to start again
                bet = smallestValue;
                bet = castNumber(bet);
                ladder = 0;
                lossesInARow = 0;
            }
            needToEqualize = false;
            lossesInARow++;
            upBet();
            startAutoTrading(origCallback);
        }
        else equalize(numberLeft, origCallback);
    });
}

// single trade
function singleTrade() {
    // console.log("singleTrade");
    // console.log("lossesInARow: " + lossesInARow);


    if (shouldIStop() == 0) {
        console.error("Stopped, original start balance was " + origStart + " current balance is " + currentBalance);
        return;
    }

    var values = {
        'target': target,
        'currency': currency,
        'bet': bet,
    }
    // console.log(values);
    socket.emit('dice_roll', values, function (data) {
        // console.log(data.result);
        //console.log(data);

        setTimeout(function () {
            startAutoTrading(data);
        }, timeOut + ((Math.random() * 10000) % 5000))
    });
};


function shouldIStop() {
    if (keepGoing == 0 && ladder == 0) return 0; // wait till reach a win
    if (ladder >= maxLadders) {
        if (maxBigLosses <= bigLosses) {
            console.error("Quit because had " + bigLosses + " big losses");
            return 0;
        }
        bigLosses++;
        console.warn("Have had " + bigLosses + " big loss");
        bet = smallestValue;
        bet = castNumber(bet);
        ladder = 0;
        lossesInARow = 0;
    }
    // if (currentBalance > stopLoss) return 0; // Lost enough to quit
    if (currentBalance < startBalance - startBalance * .2 || currentBalance < origStart - origStart * .05) {
        console.error("Quit because lost 20% or 5% of " + startBalance);
        return 0;
    }
    if (currentBalance > stopGain) {
        console.error("Quit because gained " + stopGainMultiplier + " percent increase from original start");
        return 0;
    }
    return 1;
}

// singleTrade();

// roller bot - chould just paste into the terminal or insert into page
// stop = % below start value that will stop the bot
// start at smallest increment
// max_value of value as a % of total value owned ~1/100,000th
// %increase - if lose, double and add x percent
// timeout - if lose, increase timeout, if win decrease + random
// if win, reset to beginning ladder/value
// track losses in a row, max/average
// track win/lose rate
// max_loss, something like 1% of total value, so this could run 100 times till it would go to 0, if it weren't to stop if it lost x percent from above
// track time running and current gain/loss percentage
// eventually scale up and down according to current total value
// if 15 losses in a row, kill, or alternately start a mode that just bets the minimum value ~50 times until the win/loss ratio returns to within 5% of 50%
// rolling quit value, if I gain x percent, readjust quit value to be higher (never lower) so I don't lose what I have already gained
