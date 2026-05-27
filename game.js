"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var deck_1 = require("./deck");
var card_1 = require("./card");
var simpleAIplayer_1 = require("./simpleAIplayer");
var colorize_1 = require("./colorize");
var returncodes_1 = require("./returncodes");
var Game = /** @class */ (function () {
    function Game(playerCount) {
        if (playerCount === void 0) { playerCount = 4; }
        this.players = [];
        this.gameStarted = false;
        this.playersLeft = 0;
        this.sleep = function (ms) { return new Promise(function (r) { return setTimeout(r, ms); }); };
        this.playersStillInRound = [];
        this.sleepNow = function (delay) { return new Promise(function (resolve) { return setTimeout(resolve, delay); }); };
        this.playerCount = playerCount;
    }
    ;
    Game.prototype.addPlayer = function (player) {
        this.players.push(player);
        if (this.players.length == this.playerCount) {
            this.start();
        }
    };
    Game.prototype.sleep2 = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sleepNow(10000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.start = function () {
        if (this.playerCount !== this.players.length) {
            console.log("Not enough players to start the game");
        }
        else {
            if (!this.gameStarted) {
                this.deck = new deck_1.Deck();
                this.playersStillInRound = [];
                this.whoseTurnIsItAnyway = 1;
                this.gameStarted = true;
                console.log("Game started");
                this.leftoverCard = this.deck.drawCard();
                console.log("Leftover card: " + this.leftoverCard.getCardName());
                this.playersLeft = this.playerCount;
                for (var i = 0; i < this.playerCount; i++) {
                    this.whoseTurnIsItAnyway = i;
                    ;
                    this.players[i].newRound();
                    this.playersStillInRound.push(i);
                }
                this.whoseTurnIsItAnyway = 0;
            }
            while (this.playersLeft > 1 && this.deck.cardsLeft() > 0) {
                this.players[this.whoseTurnIsItAnyway].itsYourTurn();
                this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
                if (this.playersLeft < 2) {
                    break;
                }
                while (this.players[this.whoseTurnIsItAnyway].outOfThisRound) {
                    this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
                }
                console.log("======================================================");
                console.log("New turn: " + this.players[this.whoseTurnIsItAnyway].playerName);
                var buffer = "Players left in round: ";
                for (var i = 0; i < this.playerCount; i++) {
                    if (!this.players[i].outOfThisRound) {
                        buffer += this.players[i].playerName + " (" + this.players[i].playerId + ") ";
                    }
                }
                console.log(buffer);
                ;
                console.log("Cards left in deck: " + this.deck.cardsLeft());
            }
            if (this.playersLeft === 1) {
                for (var i = 0; i < this.playerCount; i++) {
                    if (!this.players[i].outOfThisRound) {
                        console.log("".concat(this.players[i].playerName, " is the last remaining player and wins!"));
                        this.playersLeft = -1;
                        return;
                    }
                }
            }
            else if (this.playersLeft !== -1 && this.deck.cardsLeft() === 0) {
                console.log("Deck is empty - end of round");
                this.resolveEndOfRound();
                return;
            }
            else if (this.playersLeft === -1) {
                //console.log("Game over - no players left");
            }
            else {
                console.log("What happened?");
            }
        }
    };
    Game.prototype.isItMyTurn = function (player) {
        if (player === this.players[this.whoseTurnIsItAnyway]) {
            return true;
        }
        else
            return false;
    };
    Game.prototype.areThereAnyValidTargets = function (player) {
        var validTargets = [];
        for (var i = 0; i < this.playerCount; i++) {
            if (this.players[i].playerId !== player.playerId && !this.players[i].outOfThisRound && !this.players[i].protectedForOneRound) {
                validTargets.push(this.players[i].playerId);
            }
        }
        if (validTargets.length > 0) {
            return true;
        }
        else
            return false;
    };
    Game.prototype.isPlayerStillInRound = function (playerId) {
        if (this.players[playerId].outOfThisRound) {
            return false;
        }
        else
            return true;
    };
    Game.prototype.playCard = function (player) {
        if (this.isItMyTurn(player)) {
            var event_1 = JSON.parse(player.playCard());
            if (event_1.type === "playCard") {
                var cardToBePlayed = this.players[player.playerId].cardTwo;
                if (event_1.target === -1) {
                    if (this.areThereAnyValidTargets(player)) {
                        return returncodes_1.ReturnCodes.MUST_CHOOSE_TARGET;
                    }
                    else if (player.cardTwo.getCardValue() === 5) {
                        console.log("No valid targets - but can target Prince on self");
                        return returncodes_1.ReturnCodes.MUST_CHOOSE_TARGET;
                    }
                    else if (player.cardTwo.getCardValue() === 1 ||
                        player.cardTwo.getCardValue() === 2 ||
                        player.cardTwo.getCardValue() === 3 ||
                        player.cardTwo.getCardValue() === 6) {
                        console.log("No valid target. " + player.cardTwo.getCardName() + " played with no effect");
                        player.totalDiscardValue += cardToBePlayed.getCardValue();
                        player.discards.push(cardToBePlayed);
                        this.players[player.playerId].cardTwo = null;
                        return returncodes_1.ReturnCodes.SUCCESS;
                    }
                }
                else if (this.players[event_1.target].outOfThisRound) {
                    return returncodes_1.ReturnCodes.TARGET_OUT_OF_ROUND;
                }
                console.log(this.players[player.playerId].playerName + " wants to play " + cardToBePlayed.getCardName() + " on " + this.players[event_1.target].playerName);
                if (cardToBePlayed.getCardValue() === 1) {
                    console.log(player.playerName + " is guessing card value " + event_1.guess + ". " + this.players[event_1.target].playerName + " has card " + this.players[event_1.target].cardOne.getCardName());
                }
                this.players[player.playerId].protectedForOneRound = false;
                switch (cardToBePlayed.getCardValue()) {
                    case 1:
                        if (this.players[event_1.target].protectedForOneRound) {
                            console.log(this.players[event_1.target].playerName + " is protected!");
                            return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                        }
                        if (event_1.guess === 1) {
                            console.log("Cannot guess Guard");
                            return returncodes_1.ReturnCodes.CANNOT_GUESS_GUARD;
                        }
                        if (player.playerId === event_1.target) {
                            console.log("Cannot play Guard on self!");
                            return returncodes_1.ReturnCodes.CANNOT_PLAY_ON_SELF;
                        }
                        console.log(colorize_1.colorize.gray("Guard") + colorize_1.colorize.white(" played on " + this.players[event_1.target].playerName));
                        if (this.players[event_1.target].cardOne.getCardValue() === event_1.guess) {
                            console.log(this.players[event_1.target].playerName + " is out of the round");
                            this.players[event_1.target].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        break;
                    case 2:
                        if (this.players[event_1.target].protectedForOneRound) {
                            console.log(this.players[event_1.target].playerName + " is protected!");
                            return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                        }
                        console.log(colorize_1.colorize.green("Priest") + colorize_1.colorize.white(" played on " + this.players[event_1.target].playerName));
                        console.log(this.players[event_1.target].playerName + " has a " + this.players[event_1.target].cardOne.getCardName());
                        break;
                    case 3:
                        if (this.players[event_1.target].protectedForOneRound) {
                            console.log(this.players[event_1.target].playerName + " is protected!");
                            return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                        }
                        console.log(colorize_1.colorize.cyan("Baron") + colorize_1.colorize.white(" played on " + this.players[event_1.target].playerName));
                        console.log(player.playerName + " has a " + this.players[player.playerId].cardOne.getCardName() + " and " + this.players[event_1.target].playerName + " has a " + this.players[event_1.target].cardOne.getCardName());
                        if (this.players[event_1.target].cardOne.getCardValue() > this.players[player.playerId].cardOne.getCardValue()) {
                            console.log(player.playerName + " is out of the round!");
                            this.players[player.playerId].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        else if (this.players[event_1.target].cardOne.getCardValue() < this.players[player.playerId].cardOne.getCardValue()) {
                            console.log(this.players[event_1.target].playerName + " is out of the round!");
                            this.players[event_1.target].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        else {
                            console.log("It's a tie - no one is out of the round!");
                        }
                        break;
                    case 4:
                        console.log(player.playerName + " plays " + colorize_1.colorize.yellow("Handmaid") + colorize_1.colorize.white(" on themselves."));
                        this.players[player.playerId].protectedForOneRound = true;
                        break;
                    case 5:
                        if (this.players[event_1.target].protectedForOneRound) {
                            console.log(this.players[event_1.target].playerName + " is protected!");
                            return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                            ;
                        }
                        if (player.playerId === event_1.target) {
                            console.log(colorize_1.colorize.blue("Prince") + colorize_1.colorize.white(" played on self!"));
                        }
                        else {
                            console.log(colorize_1.colorize.blue("Prince") + colorize_1.colorize.white(" played on " + this.players[event_1.target].playerName));
                        }
                        if (this.players[event_1.target].cardOne.getCardValue() === 8) {
                            console.log(this.players[event_1.target].playerName + " has the Princess and is out of the round!");
                            this.players[event_1.target].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        else {
                            this.players[event_1.target].discardAndDraw();
                        }
                        break;
                    case 6:
                        console.log(colorize_1.colorize.brightBlue("King") + colorize_1.colorize.white(" played on " + this.players[event_1.target].playerName));
                        if (this.players[event_1.target].protectedForOneRound) {
                            console.log(this.players[event_1.target].playerName + " is protected!");
                            return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                        }
                        if (player.playerId === event_1.target) {
                            console.log("Cannot play King on self!");
                            return returncodes_1.ReturnCodes.CANNOT_PLAY_ON_SELF;
                        }
                        var tempCard = this.players[player.playerId].cardOne;
                        this.players[player.playerId].cardOne = this.players[event_1.target].cardOne;
                        this.players[event_1.target].cardOne = tempCard;
                        console.log(player.playerName + " and " + this.players[event_1.target].playerName + " swapped cards");
                        break;
                    case 7:
                        console.log(player.playerName + " plays " + colorize_1.colorize.magenta("Countess") + colorize_1.colorize.white("."));
                        break;
                    case 8:
                        console.log(colorize_1.colorize.red("Princess") + colorize_1.colorize.white(" played - " + this.players[event_1.target].playerName + " is out of the round!"));
                        this.players[player.playerId].outOfThisRound = true;
                        this.playersLeft--;
                        break;
                }
                player.totalDiscardValue += cardToBePlayed.getCardValue();
                player.discards.push(cardToBePlayed);
                this.players[player.playerId].cardTwo = null;
                return returncodes_1.ReturnCodes.SUCCESS;
            }
            else {
                console.log("Invalid event");
                return returncodes_1.ReturnCodes.INVALID_EVENT;
            }
        }
        else {
            console.log("It's not ".concat(player.playerName, "'s turn to play a card."));
        }
    }; //#endregion
    Game.prototype.isTheDeckEmpty = function () {
        if (this.deck.cardsLeft() === 0) {
            return true;
        }
        else
            return false;
    };
    Game.prototype.drawCard = function (player) {
        //        if (this.isItMyTurn(player)) {
        var card = this.deck.drawCard();
        return card;
        //      }
        /*        else {
                  console.log(`It's not Player ${player}'s turn to draw a card.`);
                  return null;
              }
              */
    };
    Game.prototype.drawLeftover = function (player) {
        var card = this.leftoverCard;
        return card;
    };
    Game.prototype.resolveEndOfRound = function () {
        // check for win
        this.gameStarted = false;
        console.log("End of round: Showdown!");
        console.log("--------------------------------");
        var winner = this.players[0];
        var winnerCard = new card_1.Card(0, "none", "none");
        var tied = false;
        for (var i = 0; i < this.playerCount; i++) {
            if (!this.players[i].outOfThisRound) {
                console.log(this.players[i].playerName + " has a " + this.players[i].cardOne.getCardName());
                if (this.players[i].cardOne.getCardValue() > winnerCard.getCardValue()) {
                    winner = this.players[i];
                    winnerCard = this.players[i].cardOne;
                }
            }
        }
        var count = 0;
        for (var i = 0; i < this.playerCount; i++) {
            if (!this.players[i].outOfThisRound && this.players[i].cardOne.getCardValue() === winnerCard.getCardValue()) {
                count += 1;
            }
        }
        if (count > 1) {
            tied = true;
        }
        console.log("--------------------------------");
        if (tied) {
            console.log("It's a tie!");
            var tiedPlayers = [];
            for (var i = 0; i < this.playerCount; i++) {
                if (!this.players[i].outOfThisRound && this.players[i].cardOne.getCardValue() === winnerCard.getCardValue()) {
                    tiedPlayers.push(this.players[i]);
                }
            }
            if (tiedPlayers[0].totalDiscardValue > tiedPlayers[1].totalDiscardValue) {
                winner = tiedPlayers[0];
                tied = false;
                console.log("The winner is " + tiedPlayers[0].playerName + " with a " + winnerCard.getCardName() + " and a total discard value of " + tiedPlayers[0].totalDiscardValue);
                console.log(tiedPlayers[1].playerName + " has a total discard value of " + tiedPlayers[1].totalDiscardValue);
            }
            else if (tiedPlayers[0].totalDiscardValue < tiedPlayers[1].totalDiscardValue) {
                winner = tiedPlayers[1];
                tied = false;
                console.log("The winner is " + tiedPlayers[1].playerName + " with a " + winnerCard.getCardName() + " and a total discard value of " + tiedPlayers[1].totalDiscardValue);
                console.log(tiedPlayers[0].playerName + " has a total discard value of " + tiedPlayers[0].totalDiscardValue);
            }
            else {
                console.log("wE ACTUALLY HAVE A TIE! " + tiedPlayers[0].playerName + " and " + tiedPlayers[1].playerName);
                console.log("They both have a " + winnerCard.getCardName() + " and a total discard value of " + tiedPlayers[0].totalDiscardValue);
            }
        }
        else {
            console.log("The winner is " + winner.playerName + " with a " + winnerCard.getCardName());
        }
    };
    Game.waitingForPlayerTurn = false;
    return Game;
}());
exports.Game = Game;
;
var game = new Game(4);
game.addPlayer(new simpleAIplayer_1.SimpleAIPlayer(game, 0, "Frank"));
game.addPlayer(new simpleAIplayer_1.SimpleAIPlayer(game, 1, "Bob"));
game.addPlayer(new simpleAIplayer_1.SimpleAIPlayer(game, 2, "Malice"));
game.addPlayer(new simpleAIplayer_1.SimpleAIPlayer(game, 3, "Angreta"));
game.start();
