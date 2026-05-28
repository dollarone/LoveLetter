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
var colorize_1 = require("./colorize");
var returncodes_1 = require("./returncodes");
var Game = /** @class */ (function () {
    function Game(playerCount, logger) {
        if (playerCount === void 0) { playerCount = 4; }
        this.players = [];
        this.gameStarted = false;
        this.playersLeft = 0;
        this.playersStillInRound = [];
        this.onActionCallback = null;
        this.onTurnStartCallback = null;
        this.playerCount = playerCount;
        this.logger = logger || (function (msg) { return console.log(msg); });
    }
    Game.prototype.log = function (msg) {
        this.logger(msg);
    };
    Game.prototype.setOnAction = function (fn) {
        this.onActionCallback = fn;
    };
    Game.prototype.setOnTurnStart = function (fn) {
        this.onTurnStartCallback = fn;
    };
    Game.prototype.notifyTurnStart = function (playerId) {
        if (this.onTurnStartCallback)
            this.onTurnStartCallback(playerId);
    };
    Game.prototype.addPlayer = function (player) {
        this.players.push(player);
    };
    Game.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, alive, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.playerCount !== this.players.length) {
                            this.log("Not enough players to start the game");
                            return [2 /*return*/];
                        }
                        if (!this.gameStarted) {
                            this.deck = new deck_1.Deck();
                            this.playersStillInRound = [];
                            this.whoseTurnIsItAnyway = 0;
                            this.gameStarted = true;
                            this.log("Game started");
                            this.leftoverCard = this.deck.drawCard();
                            this.log("One card is set aside face-down.");
                            this.playersLeft = this.playerCount;
                            for (i = 0; i < this.playerCount; i++) {
                                this.whoseTurnIsItAnyway = i;
                                this.players[i].newRound();
                                this.playersStillInRound.push(i);
                            }
                            this.whoseTurnIsItAnyway = 0;
                            if (this.onActionCallback)
                                this.onActionCallback();
                        }
                        _a.label = 1;
                    case 1:
                        if (!(this.playersLeft > 1 && this.deck.cardsLeft() > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.players[this.whoseTurnIsItAnyway].itsYourTurn()];
                    case 2:
                        _a.sent();
                        this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
                        if (this.playersLeft < 2)
                            return [3 /*break*/, 3];
                        while (this.players[this.whoseTurnIsItAnyway].outOfThisRound) {
                            this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
                        }
                        this.log("——————————————————————————————————————");
                        this.log("Next turn: " + this.players[this.whoseTurnIsItAnyway].playerName);
                        alive = this.players.filter(function (p) { return !p.outOfThisRound; }).map(function (p) { return p.playerName; }).join(", ");
                        this.log("Remaining: " + alive + " | Deck: " + this.deck.cardsLeft() + " cards");
                        return [3 /*break*/, 1];
                    case 3:
                        if (this.playersLeft === 1) {
                            for (i = 0; i < this.playerCount; i++) {
                                if (!this.players[i].outOfThisRound) {
                                    this.log(this.players[i].playerName + " is the last player standing — wins the round!");
                                    this.playersLeft = -1;
                                    return [2 /*return*/];
                                }
                            }
                        }
                        else if (this.playersLeft !== -1 && this.deck.cardsLeft() === 0) {
                            this.log("Deck is empty — showdown!");
                            this.resolveEndOfRound();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.isItMyTurn = function (player) {
        return player === this.players[this.whoseTurnIsItAnyway];
    };
    Game.prototype.areThereAnyValidTargets = function (player) {
        for (var i = 0; i < this.playerCount; i++) {
            if (this.players[i].playerId !== player.playerId &&
                !this.players[i].outOfThisRound &&
                !this.players[i].protectedForOneRound) {
                return true;
            }
        }
        return false;
    };
    Game.prototype.isPlayerStillInRound = function (playerId) {
        return !this.players[playerId].outOfThisRound;
    };
    Game.prototype.playCard = function (player) {
        if (!this.isItMyTurn(player)) {
            this.log("It's not ".concat(player.playerName, "'s turn."));
            return returncodes_1.ReturnCodes.ERROR;
        }
        var event = JSON.parse(player.playCard());
        if (event.type !== "playCard") {
            this.log("Invalid event type");
            return returncodes_1.ReturnCodes.INVALID_EVENT;
        }
        var cardToBePlayed = this.players[player.playerId].cardTwo;
        // Handle no-target case
        if (event.target === -1) {
            if (this.areThereAnyValidTargets(player)) {
                return returncodes_1.ReturnCodes.MUST_CHOOSE_TARGET;
            }
            if (player.cardTwo.getCardValue() === 5) {
                return returncodes_1.ReturnCodes.MUST_CHOOSE_TARGET; // Prince must target someone (can be self)
            }
            var v = player.cardTwo.getCardValue();
            if (v === 1 || v === 2 || v === 3 || v === 6) {
                this.log(player.cardTwo.getCardName() + " played with no effect (no valid targets).");
                player.totalDiscardValue += cardToBePlayed.getCardValue();
                player.discards.push(cardToBePlayed);
                this.players[player.playerId].cardTwo = null;
                if (this.onActionCallback)
                    this.onActionCallback();
                return returncodes_1.ReturnCodes.SUCCESS;
            }
        }
        else if (this.players[event.target].outOfThisRound) {
            return returncodes_1.ReturnCodes.TARGET_OUT_OF_ROUND;
        }
        var targetName = event.target !== -1 ? this.players[event.target].playerName : "(none)";
        this.log(player.playerName + " plays " + colorize_1.colorize.white(cardToBePlayed.getCardName()) + " on " + targetName);
        if (cardToBePlayed.getCardValue() === 1) {
            this.log(player.playerName + " guesses " + event.guess + ".");
        }
        this.players[player.playerId].protectedForOneRound = false;
        switch (cardToBePlayed.getCardValue()) {
            case 1: { // Guard
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                }
                if (event.guess === 1)
                    return returncodes_1.ReturnCodes.CANNOT_GUESS_GUARD;
                if (player.playerId === event.target)
                    return returncodes_1.ReturnCodes.CANNOT_PLAY_ON_SELF;
                if (this.players[event.target].cardOne.getCardValue() === event.guess) {
                    this.log(colorize_1.colorize.red("✗") + " " + this.players[event.target].playerName + " is out of the round!");
                    this.players[event.target].outOfThisRound = true;
                    this.playersLeft--;
                }
                else {
                    this.log(colorize_1.colorize.green("✓") + " Miss — " + this.players[event.target].playerName + " is safe.");
                }
                break;
            }
            case 2: { // Priest
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                }
                if (player.isHuman()) {
                    this.log(this.players[event.target].playerName + " holds: " + this.players[event.target].cardOne.getCardName());
                }
                break;
            }
            case 3: { // Baron
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                }
                if (player.isHuman()) {
                    this.log("You hold " + this.players[player.playerId].cardOne.getCardName() +
                        "; " + this.players[event.target].playerName + " holds " + this.players[event.target].cardOne.getCardName());
                }
                var myVal = this.players[player.playerId].cardOne.getCardValue();
                var theirVal = this.players[event.target].cardOne.getCardValue();
                if (theirVal > myVal) {
                    this.log(player.playerName + " is out of the round!");
                    this.players[player.playerId].outOfThisRound = true;
                    this.playersLeft--;
                }
                else if (theirVal < myVal) {
                    this.log(this.players[event.target].playerName + " is out of the round!");
                    this.players[event.target].outOfThisRound = true;
                    this.playersLeft--;
                }
                else {
                    this.log("Tie — no one eliminated.");
                }
                break;
            }
            case 4: { // Handmaid
                this.log(player.playerName + " plays Handmaid — protected until next turn.");
                this.players[player.playerId].protectedForOneRound = true;
                break;
            }
            case 5: { // Prince
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                }
                var targetSelf = player.playerId === event.target;
                this.log(colorize_1.colorize.blue("Prince") + " — " + this.players[event.target].playerName +
                    (targetSelf ? " must discard and redraw." : " is forced to discard and redraw."));
                if (this.players[event.target].cardOne.getCardValue() === 8) {
                    this.log(this.players[event.target].playerName + " discarded the Princess and is out!");
                    this.players[event.target].outOfThisRound = true;
                    this.playersLeft--;
                }
                else {
                    this.players[event.target].discardAndDraw();
                }
                break;
            }
            case 6: { // King
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return returncodes_1.ReturnCodes.TARGET_PROTECTED;
                }
                if (player.playerId === event.target)
                    return returncodes_1.ReturnCodes.CANNOT_PLAY_ON_SELF;
                var tempCard = this.players[player.playerId].cardOne;
                this.players[player.playerId].cardOne = this.players[event.target].cardOne;
                this.players[event.target].cardOne = tempCard;
                this.log(player.playerName + " and " + this.players[event.target].playerName + " swap hands.");
                break;
            }
            case 7: { // Countess
                this.log(player.playerName + " plays Countess.");
                break;
            }
            case 8: { // Princess
                this.log(player.playerName + " played the Princess — out of the round!");
                this.players[player.playerId].outOfThisRound = true;
                this.playersLeft--;
                break;
            }
        }
        player.totalDiscardValue += cardToBePlayed.getCardValue();
        player.discards.push(cardToBePlayed);
        this.players[player.playerId].cardTwo = null;
        if (this.onActionCallback)
            this.onActionCallback();
        return returncodes_1.ReturnCodes.SUCCESS;
    };
    Game.prototype.isTheDeckEmpty = function () {
        return this.deck.cardsLeft() === 0;
    };
    Game.prototype.drawCard = function (_player) {
        return this.deck.drawCard();
    };
    Game.prototype.drawLeftover = function (_player) {
        return this.leftoverCard;
    };
    Game.prototype.getDeckSize = function () {
        return this.deck ? this.deck.cardsLeft() : 0;
    };
    Game.prototype.getAllPlayers = function () {
        return this.players.map(function (p) { return ({
            id: p.playerId,
            name: p.playerName,
            eliminated: p.outOfThisRound,
            protected: p.protectedForOneRound,
            discards: p.discards.map(function (d) { return ({ name: d.getCardName(), value: d.getCardValue() }); })
        }); });
    };
    Game.prototype.getActivePlayers = function () {
        return this.players
            .filter(function (p) { return !p.outOfThisRound; })
            .map(function (p) { return ({
            id: p.playerId,
            name: p.playerName,
            protected: p.protectedForOneRound,
            discards: p.discards.map(function (d) { return ({ name: d.getCardName(), value: d.getCardValue() }); })
        }); });
    };
    Game.prototype.resolveEndOfRound = function () {
        this.gameStarted = false;
        this.log("=== Showdown ===");
        var winner = this.players[0];
        var winnerCard = new card_1.Card(0, "none", "none");
        for (var i = 0; i < this.playerCount; i++) {
            if (!this.players[i].outOfThisRound) {
                this.log(this.players[i].playerName + " reveals: " + this.players[i].cardOne.getCardName());
                if (this.players[i].cardOne.getCardValue() > winnerCard.getCardValue()) {
                    winner = this.players[i];
                    winnerCard = this.players[i].cardOne;
                }
            }
        }
        var tied = this.players.filter(function (p) { return !p.outOfThisRound && p.cardOne.getCardValue() === winnerCard.getCardValue(); });
        if (tied.length > 1) {
            this.log("Tie on card value! Comparing discard totals...");
            tied.sort(function (a, b) { return b.totalDiscardValue - a.totalDiscardValue; });
            if (tied[0].totalDiscardValue !== tied[1].totalDiscardValue) {
                winner = tied[0];
            }
            else {
                this.log("Perfect tie between " + tied.map(function (p) { return p.playerName; }).join(" and ") + "!");
                return;
            }
        }
        this.log(winner.playerName + " wins with " + winnerCard.getCardName() + "!");
    };
    return Game;
}());
exports.Game = Game;
// Run standalone when invoked directly: node game.js
if (require.main === module) {
    var SimpleAIPlayer = require('./simpleAIplayer').SimpleAIPlayer;
    var HumanCLIPlayer = require('./humanPlayer').HumanCLIPlayer;
    var game = new Game(4);
    game.addPlayer(new HumanCLIPlayer(game, 0, "Player"));
    game.addPlayer(new SimpleAIPlayer(game, 1, "Bob"));
    game.addPlayer(new SimpleAIPlayer(game, 2, "Malice"));
    game.addPlayer(new SimpleAIPlayer(game, 3, "Angreta"));
    game.start().catch(console.error);
}
//# sourceMappingURL=game.js.map