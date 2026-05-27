"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var Player = /** @class */ (function () {
    function Player(game, name) {
        if (name === void 0) { name = "Frank"; }
        this.activePlayerIds = [];
        this.discards = [];
        this.outOfThisRound = false;
        this.protectedForOneRound = false;
        this.playerName = name;
        this.game = game;
        this.activePlayerIds.push(0);
        this.activePlayerIds.push(1);
        this.activePlayerIds.push(2);
        this.activePlayerIds.push(3);
        this.totalDiscardValue = 0;
    }
    Player.prototype.newRound = function () {
        this.cardOne = this.game.drawCard(this);
        this.cardTwo = null;
        this.discards = [];
        this.outOfThisRound = false;
        console.log("".concat(this.playerName, " drew starting card: ").concat(this.cardOne.getCardName()));
    };
    Player.prototype.itsYourTurn = function () {
        console.log("It's your turn");
    };
    Player.prototype.discardAndDraw = function () {
        var cardToDiscard = this.cardOne;
        this.discards.push(this.cardOne);
        this.totalDiscardValue += this.cardOne.getCardValue();
        if (!this.game.isTheDeckEmpty()) {
            this.cardOne = this.game.drawCard(this);
            console.log("".concat(this.playerName, " discarded ").concat(cardToDiscard.getCardName(), " and drew a new card: ").concat(this.cardOne.getCardName()));
        }
        else {
            console.log("No more cards in deck - drawing leftover card");
            this.cardOne = this.game.drawLeftover(this);
            console.log("".concat(this.playerName, " drew card: ").concat(this.cardOne.getCardName()));
        }
    };
    Player.prototype.drawCard = function () {
        if (!this.game.isTheDeckEmpty()) {
            this.cardTwo = this.game.drawCard(this);
            if (this.cardTwo == null) {
                console.log("No more cards to draw");
            }
            else {
                console.log("".concat(this.playerName, " drew card: ").concat(this.cardTwo.getCardName()));
            }
        }
    };
    Player.prototype.playCard = function () {
        return "";
    };
    return Player;
}());
exports.Player = Player;
;
