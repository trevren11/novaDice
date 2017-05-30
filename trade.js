
// Get information from input box
console.log($('#crypto').val());

var keepGoing = 1;

// setup socket
var socket;
var namespace = '/feed';
if (socket == null) {
    socket = io.connect('//' + document.domain + ':' + location.port + namespace, { pingInterval: 5000, 'sync disconnect on unload': true });
}

// Make a box to show win losses
// function makeBox() {
//     var $div = $("<div style='background:black;width: 200px; height:400px;position: fixed;bottom:auto;top:0px;right:auto;left:0px;padding: 1em' ></div>").appendTo('body');
//     $div.attr('id', 'holder');
// }

// var box = $('#holder');
// if (box == undefined) {
//     makeBox();
// }
// makeBox();
// get coin

// get value of coin

// set variables
var target;
var startBet;
var currency;
var startBalance = 0;
var currentBalance;
// var smallestValue = 0.00000001;
var smallestValue = 0.00002;
var decimals = 5;
var currentBet = smallestValue;
var ladder = 0;
var maxLadder = 0;
var maxLadders = 13; // maximum number of steps to go before resetting
var increase = 1.1; // 10% increase
var timeOut = 1000;
var stopLoss; // if balance goes below this, quit

var totalWins = 0, totalLosses = 0;

(function setVariables() {
    target = "49"
    startBet = smallestValue;
    // currency = "XP";
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
        console.log(callback);
        console.log(callback.data.balance);
        startBalance = callback.data.balance;
        currentBalance = startBalance;
        stopLoss = startBalance - startBalance * 0.0001; // 1/100th a percent of total value
        console.log("Stop loss: " + stopLoss);

        startAutoTrading(callback);
    });
}
getInitialBalance();

var lossesInARow = 0;

// start trading
function startAutoTrading(callback) {

    currentBalance = callback.data.balance;
    console.log("Current Value: " + currentBalance + ",  Current Bet: " + bet);
    console.log("Total wins/losses: " + totalWins + "/" + totalLosses +
        ", longest ladder: " + maxLadder +
        ",  lossesInARow: " + lossesInARow);
    var tg = (currentBalance - startBalance).toFixed(decimals);
    console.log("Total gains: " + tg);
    if (ladder > maxLadder) maxLadder = ladder;

    // if win, reset to smallest increment
    if (callback.data.win == 1) {
        // console.log("Won!");
        totalWins++;
        lossesInARow = 0;
        // $('#winLoss').append("<li>Win</li>");
        lossesInARow = 0;
        ladder = 0;
        bet = smallestValue;
        singleTrade();
    } else {
        // lost, get new value to bet
        // console.log("Lost");

        lossesInARow++;
        ladder++;
        totalLosses++;
        // $('#winLoss').append("<li>Lost</li>");
        upBet();
        singleTrade();
    }

}

function upBet() {
    // console.log("upBet");
    if (ladder == maxLadders) {
        bet = smallestValue;
        return;
    }
    bet = (bet * 2) * increase + smallestValue;
    bet = bet.toFixed(decimals);
}
// single trade
function singleTrade() {
    // console.log("singleTrade");
    // console.log("lossesInARow: " + lossesInARow);

    if (shouldIStop() == 0) {
        console.log("Don't continue");
        return;
    }

    var values = {
        'target': target,
        'currency': currency,
        'bet': bet,
    }
    socket.emit('dice_roll', values, function (data) {
        // console.log(data.result);
        //console.log(data);

        setTimeout(function () {
            startAutoTrading(data);
        }, timeOut)
    });
};


function shouldIStop() {
    if (keepGoing == 0) return 0;
    if (ladder >= maxLadders) return 0;
    // if (currentBalance > stopLoss) return 0; // Lost enough to quit
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
