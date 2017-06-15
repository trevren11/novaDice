# novaDice
Chrome extension to play dice on Nova Exchange

General idea of this bot is it places bets based on current value. It will incrementally gain value and the bets will increase. The bot will stop trading if more than 5% is lost or balance is increased 2x. Bot should no longer look as much like a bot so it will be harder to get blocked out of NovaExchange.

## Features/Things to know
* Bet changes depending on total value
* Stops betting if lose 5% of original or moving base
    * If you gained 20%, new base will be ~10% more than starting
* Truncates bet to 2 significant figures so looks less like a bot
* Time interval randomly generates so looks less like a bot
* Percent gains output to console
* If you change a variable, you have to reload the extension
* Bot stops: if balance increases 2x original, if no response received

## Future work
* Use interface to show data instead of console
* Use interface to change currency type and other variables on the fly

## Known issues
Code looks like crap, it started out as a simple bot but then I kept adding things and made this Frankenstein and haven't refactored yet. It should look much better when I do.