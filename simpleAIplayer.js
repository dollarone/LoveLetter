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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleAIPlayer = void 0;
var player_1 = require("./player");
var returncodes_1 = require("./returncodes");
var SimpleAIPlayer = /** @class */ (function (_super) {
    __extends(SimpleAIPlayer, _super);
    function SimpleAIPlayer(game, id, name) {
        if (name === void 0) { name = "Frank"; }
        var _this = _super.call(this, game, name) || this;
        _this.override = false;
        _this.targetPlayerIndex = -1;
        _this.playerId = id;
        _this.override = false;
        _this.targetPlayerIndex = -1;
        return _this;
    }
    SimpleAIPlayer.prototype.itsYourTurn = function () {
        //console.log("It's your turn");
        this.drawCard();
        //console.log("You drew a card");
        var code = this.game.playCard(this);
        while (code != returncodes_1.ReturnCodes.SUCCESS) {
            this.override = true;
            code = this.game.playCard(this);
        }
        //console.log("You played a card");
        return true;
    };
    SimpleAIPlayer.prototype.playCard = function () {
        if (this.override) {
            this.override = false;
            console.log("    Override - ensuring valid card play ");
            if (!this.game.areThereAnyValidTargets(this) && this.cardTwo.getCardValue() === 5) {
                console.log("    No valid targets - targetting self with Prince");
                var guess_1 = Math.floor(Math.random() * 7) + 2;
                var event_1 = {
                    type: "playCard",
                    target: this.playerId,
                    guess: guess_1
                };
                return JSON.stringify(event_1);
            }
            if (!this.game.areThereAnyValidTargets(this)) {
                console.log("    No valid targets - targetting noone");
                var guess_2 = Math.floor(Math.random() * 7) + 2;
                var event_2 = {
                    type: "playCard",
                    target: -1,
                    guess: guess_2
                };
                return JSON.stringify(event_2);
            }
            // new random target:
            var newTargetPlayerIndex = Math.floor(Math.random() * this.activePlayerIds.length);
            while (this.activePlayerIds[newTargetPlayerIndex] == this.playerId || newTargetPlayerIndex == this.targetPlayerIndex) {
                newTargetPlayerIndex = (newTargetPlayerIndex + 1) % this.activePlayerIds.length;
            }
            this.targetPlayerIndex = newTargetPlayerIndex;
            console.log("    Target player index: " + this.activePlayerIds[this.targetPlayerIndex]);
            switch (this.cardTwo.getCardValue()) {
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 5:
                    break;
                case 6:
                    break;
            }
            var guess = Math.floor(Math.random() * 7) + 2;
            var event_3 = {
                type: "playCard",
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: guess
            };
            return JSON.stringify(event_3);
        }
        this.targetPlayerIndex = Math.floor(Math.random() * this.activePlayerIds.length);
        if (this.activePlayerIds[this.targetPlayerIndex] === this.playerId) {
            this.targetPlayerIndex = (this.targetPlayerIndex + 1) % this.activePlayerIds.length;
        }
        while ((this.game.isPlayerStillInRound(this.activePlayerIds[this.targetPlayerIndex]) == false) || this.activePlayerIds[this.targetPlayerIndex] == this.playerId) {
            this.targetPlayerIndex = (this.targetPlayerIndex + 1) % this.activePlayerIds.length;
        }
        //targetPlayerIndex = (targetPlayerIndex + 1) % this.activePlayerIds.length;
        console.log("    Target player index: " + this.activePlayerIds[this.targetPlayerIndex]);
        console.log(this.playerName + " is choosing between: " + this.cardOne.getCardName() + " and " + this.cardTwo.getCardName());
        if (this.cardTwo.getCardValue() == 7 && (this.cardOne.getCardValue() == 6 || this.cardOne.getCardValue() == 5)) {
            var event_4 = {
                type: "playCard",
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: 0
            };
            return JSON.stringify(event_4);
        }
        if (this.cardOne.getCardValue() == 7 && (this.cardTwo.getCardValue() == 6 || this.cardTwo.getCardValue() == 5) ||
            (this.cardOne.getCardValue() <= this.cardTwo.getCardValue())) {
            var card = this.cardOne;
            this.cardOne = this.cardTwo;
            this.cardTwo = card;
            var guess = Math.floor(Math.random() * 7) + 2;
            var event_5 = {
                type: "playCard",
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: guess
            };
            return JSON.stringify(event_5);
        }
        else {
            var guess = Math.floor(Math.random() * 7) + 2;
            var event_6 = {
                type: "playCard",
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: guess
            };
            return JSON.stringify(event_6);
        }
    };
    return SimpleAIPlayer;
}(player_1.Player));
exports.SimpleAIPlayer = SimpleAIPlayer;
