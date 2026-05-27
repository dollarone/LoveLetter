"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanCLIPlayer = void 0;
var player_1 = require("./player");
var returncodes_1 = require("./returncodes");
var colorize_1 = require("./colorize");
var readlineSync = __importStar(require("readline-sync"));
var HumanCLIPlayer = /** @class */ (function (_super) {
    __extends(HumanCLIPlayer, _super);
    function HumanCLIPlayer(game, id, name) {
        if (name === void 0) { name = "Player"; }
        var _this = _super.call(this, game, name) || this;
        _this.playerId = id;
        return _this;
    }
    HumanCLIPlayer.prototype.isHuman = function () {
        return true;
    };
    HumanCLIPlayer.prototype.itsYourTurn = function () {
        this.drawCard();
        var code = this.game.playCard(this);
        while (code !== returncodes_1.ReturnCodes.SUCCESS) {
            this.showError(code);
            code = this.game.playCard(this);
        }
        return true;
    };
    HumanCLIPlayer.prototype.showError = function (code) {
        switch (code) {
            case returncodes_1.ReturnCodes.TARGET_PROTECTED:
                console.log(colorize_1.colorize.red("That player is protected by the Handmaid! Choose another target."));
                break;
            case returncodes_1.ReturnCodes.CANNOT_PLAY_ON_SELF:
                console.log(colorize_1.colorize.red("You cannot play that card on yourself! Choose another target."));
                break;
            case returncodes_1.ReturnCodes.CANNOT_GUESS_GUARD:
                console.log(colorize_1.colorize.red("You cannot guess Guard (1)! Guess a different value."));
                break;
            case returncodes_1.ReturnCodes.MUST_CHOOSE_TARGET:
                console.log(colorize_1.colorize.red("You must choose a valid target!"));
                break;
            case returncodes_1.ReturnCodes.TARGET_OUT_OF_ROUND:
                console.log(colorize_1.colorize.red("That player is already out of the round! Choose another target."));
                break;
            default:
                console.log(colorize_1.colorize.red("Invalid play, try again."));
        }
    };
    HumanCLIPlayer.prototype.playCard = function () {
        this.showHandAndGameState();
        // Enforce the Countess rule before prompting
        var c1 = this.cardOne.getCardValue();
        var c2 = this.cardTwo.getCardValue();
        var mustPlayCountess = (c1 === 7 && (c2 === 5 || c2 === 6)) ||
            (c2 === 7 && (c1 === 5 || c1 === 6));
        if (mustPlayCountess) {
            console.log(colorize_1.colorize.magenta("You must play the Countess when holding the King or Prince!"));
            // Ensure the Countess ends up in cardTwo (the card that gets played)
            if (this.cardOne.getCardValue() === 7) {
                var temp = this.cardOne;
                this.cardOne = this.cardTwo;
                this.cardTwo = temp;
            }
        }
        else {
            var choice = this.promptCardChoice();
            if (choice === 1) {
                var temp = this.cardOne;
                this.cardOne = this.cardTwo;
                this.cardTwo = temp;
            }
        }
        var cardVal = this.cardTwo.getCardValue();
        var cardName = this.cardTwo.getCardName();
        console.log(colorize_1.colorize.white("\nPlaying: ".concat(cardName, " (").concat(cardVal, ")")));
        var target = this.playerId;
        var guess = 0;
        switch (cardVal) {
            case 1: // Guard — needs a target and a guess
                target = this.promptForTarget(false);
                if (target !== -1) {
                    guess = this.promptForGuess();
                }
                break;
            case 2: // Priest — needs a target
            case 3: // Baron — needs a target
                target = this.promptForTarget(false);
                break;
            case 4: // Handmaid — protects self, no target prompt needed
                break;
            case 5: // Prince — can target self or others
                target = this.promptForTarget(true);
                break;
            case 6: // King — needs a different target
                target = this.promptForTarget(false);
                break;
            case 7: // Countess — no effect, no target
                break;
            case 8: // Princess — eliminates yourself
                console.log(colorize_1.colorize.red("You played the Princess — you are out of the round!"));
                break;
        }
        var event = { type: "playCard", target: target, guess: guess };
        return JSON.stringify(event);
    };
    HumanCLIPlayer.prototype.showHandAndGameState = function () {
        console.log("\n" + colorize_1.colorize.brightWhite("════════════════════════════════════════════"));
        console.log(colorize_1.colorize.brightWhite("YOUR TURN \u2014 ".concat(this.playerName.toUpperCase())));
        console.log(colorize_1.colorize.brightWhite("════════════════════════════════════════════"));
        console.log(colorize_1.colorize.white("\nYour hand:"));
        console.log("  [1] ".concat(colorize_1.colorize.yellow(this.cardOne.getCardName()), " (value ").concat(this.cardOne.getCardValue(), ")"));
        console.log("  [2] ".concat(colorize_1.colorize.yellow(this.cardTwo.getCardName()), " (value ").concat(this.cardTwo.getCardValue(), ")"));
        var activePlayers = this.game.getActivePlayers();
        console.log(colorize_1.colorize.white("\nOther players:"));
        for (var _i = 0, activePlayers_1 = activePlayers; _i < activePlayers_1.length; _i++) {
            var p = activePlayers_1[_i];
            if (p.id === this.playerId)
                continue;
            var protectedStr = p.protected ? colorize_1.colorize.cyan(" [PROTECTED]") : "";
            var discardStr = p.discards.length > 0
                ? colorize_1.colorize.gray("  discards: " + p.discards.map(function (d) { return "".concat(d.name, "(").concat(d.value, ")"); }).join(", "))
                : "";
            console.log("  ".concat(p.name, " (id:").concat(p.id, ")").concat(protectedStr).concat(discardStr));
        }
        console.log();
    };
    HumanCLIPlayer.prototype.promptCardChoice = function () {
        console.log("Which card do you want to play?");
        console.log("  [1] ".concat(this.cardOne.getCardName(), " (value ").concat(this.cardOne.getCardValue(), ")"));
        console.log("  [2] ".concat(this.cardTwo.getCardName(), " (value ").concat(this.cardTwo.getCardValue(), ")"));
        while (true) {
            var raw = readlineSync.question("Enter 1 or 2: ").trim();
            var n = parseInt(raw, 10);
            if (n === 1 || n === 2)
                return n;
            console.log("Please enter 1 or 2.");
        }
    };
    HumanCLIPlayer.prototype.promptForTarget = function (includeSelf) {
        var _this = this;
        var activePlayers = this.game.getActivePlayers();
        var candidates = activePlayers.filter(function (p) { return includeSelf || p.id !== _this.playerId; });
        if (candidates.length === 0) {
            console.log("No valid targets available.");
            return -1;
        }
        console.log("Choose a target:");
        for (var i = 0; i < candidates.length; i++) {
            var p = candidates[i];
            var selfStr = p.id === this.playerId ? colorize_1.colorize.gray(" (you)") : "";
            var protStr = p.protected ? colorize_1.colorize.cyan(" [PROTECTED]") : "";
            console.log("  [".concat(i + 1, "] ").concat(p.name, " (id:").concat(p.id, ")").concat(selfStr).concat(protStr));
        }
        while (true) {
            var raw = readlineSync.question("Enter 1\u2013".concat(candidates.length, ": ")).trim();
            var n = parseInt(raw, 10);
            if (n >= 1 && n <= candidates.length)
                return candidates[n - 1].id;
            console.log("Please enter a number between 1 and ".concat(candidates.length, "."));
        }
    };
    HumanCLIPlayer.prototype.promptForGuess = function () {
        console.log("Guess the target's card (2–8):");
        console.log("  2=Priest  3=Baron  4=Handmaid  5=Prince  6=King  7=Countess  8=Princess");
        while (true) {
            var raw = readlineSync.question("Enter 2–8: ").trim();
            var n = parseInt(raw, 10);
            if (n >= 2 && n <= 8)
                return n;
            console.log("Please enter a value between 2 and 8 (you cannot guess 1/Guard).");
        }
    };
    return HumanCLIPlayer;
}(player_1.Player));
exports.HumanCLIPlayer = HumanCLIPlayer;
//# sourceMappingURL=humanPlayer.js.map