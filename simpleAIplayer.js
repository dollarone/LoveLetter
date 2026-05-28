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
exports.SimpleAIPlayer = void 0;
var player_1 = require("./player");
var returncodes_1 = require("./returncodes");
var NO_TARGET_CARDS = [4, 7, 8]; // Handmaid, Countess, Princess — target irrelevant
var SimpleAIPlayer = /** @class */ (function (_super) {
    __extends(SimpleAIPlayer, _super);
    function SimpleAIPlayer(game, id, name) {
        if (name === void 0) { name = "Frank"; }
        var _this = _super.call(this, game, name) || this;
        _this.override = false;
        _this.targetPlayerIndex = -1;
        _this._computedPlay = null;
        _this.playerId = id;
        return _this;
    }
    SimpleAIPlayer.prototype.itsYourTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cardValue, targetId, guess, code;
            return __generator(this, function (_b) {
                this.game.notifyTurnStart(this.playerId);
                this.drawCard();
                _a = this.precomputePlay(), cardValue = _a.cardValue, targetId = _a.targetId, guess = _a.guess;
                this.game.notifyAIPlanning(this.playerId, cardValue, targetId, guess);
                code = this.game.playCard(this);
                while (code !== returncodes_1.ReturnCodes.SUCCESS) {
                    this.override = true;
                    this._computedPlay = null;
                    code = this.game.playCard(this);
                }
                return [2 /*return*/, true];
            });
        });
    };
    /** Pre-compute and cache the move so playCard() can reuse it without re-running logic. */
    SimpleAIPlayer.prototype.precomputePlay = function () {
        this._computedPlay = this._computePlayInternal();
        var parsed = JSON.parse(this._computedPlay);
        var cardValue = this.cardTwo.getCardValue();
        var targetId = NO_TARGET_CARDS.includes(cardValue) ? -1 : parsed.target;
        var guess = parsed.guess || 0;
        return { cardValue: cardValue, targetId: targetId, guess: guess };
    };
    SimpleAIPlayer.prototype.playCard = function () {
        if (this._computedPlay) {
            var result = this._computedPlay;
            this._computedPlay = null;
            return result;
        }
        return this._computePlayInternal();
    };
    SimpleAIPlayer.prototype._computePlayInternal = function () {
        if (this.override) {
            this.override = false;
            console.log("    Override - ensuring valid card play ");
            if (!this.game.areThereAnyValidTargets(this) && this.cardTwo.getCardValue() === 5) {
                console.log("    No valid targets - targetting self with Prince");
                return JSON.stringify({ type: "playCard", target: this.playerId, guess: Math.floor(Math.random() * 7) + 2 });
            }
            if (!this.game.areThereAnyValidTargets(this)) {
                console.log("    No valid targets - targetting noone");
                return JSON.stringify({ type: "playCard", target: -1, guess: Math.floor(Math.random() * 7) + 2 });
            }
            var newTargetPlayerIndex = Math.floor(Math.random() * this.activePlayerIds.length);
            while (this.activePlayerIds[newTargetPlayerIndex] === this.playerId || newTargetPlayerIndex === this.targetPlayerIndex) {
                newTargetPlayerIndex = (newTargetPlayerIndex + 1) % this.activePlayerIds.length;
            }
            this.targetPlayerIndex = newTargetPlayerIndex;
            console.log("    Target player index: " + this.activePlayerIds[this.targetPlayerIndex]);
            return JSON.stringify({ type: "playCard", target: this.activePlayerIds[this.targetPlayerIndex], guess: Math.floor(Math.random() * 7) + 2 });
        }
        this.targetPlayerIndex = Math.floor(Math.random() * this.activePlayerIds.length);
        if (this.activePlayerIds[this.targetPlayerIndex] === this.playerId) {
            this.targetPlayerIndex = (this.targetPlayerIndex + 1) % this.activePlayerIds.length;
        }
        while (!this.game.isPlayerStillInRound(this.activePlayerIds[this.targetPlayerIndex]) || this.activePlayerIds[this.targetPlayerIndex] === this.playerId) {
            this.targetPlayerIndex = (this.targetPlayerIndex + 1) % this.activePlayerIds.length;
        }
        console.log("    Target player index: " + this.activePlayerIds[this.targetPlayerIndex]);
        console.log(this.playerName + " is choosing between: " + this.cardOne.getCardName() + " and " + this.cardTwo.getCardName());
        // Countess forced: keep Countess in cardTwo
        if (this.cardTwo.getCardValue() === 7 && (this.cardOne.getCardValue() === 6 || this.cardOne.getCardValue() === 5)) {
            return JSON.stringify({ type: "playCard", target: this.activePlayerIds[this.targetPlayerIndex], guess: 0 });
        }
        // Swap so the higher-value card (or Countess-forced) ends up in cardTwo (played)
        if ((this.cardOne.getCardValue() === 7 && (this.cardTwo.getCardValue() === 6 || this.cardTwo.getCardValue() === 5)) ||
            (this.cardOne.getCardValue() <= this.cardTwo.getCardValue())) {
            var tmp = this.cardOne;
            this.cardOne = this.cardTwo;
            this.cardTwo = tmp;
        }
        return JSON.stringify({ type: "playCard", target: this.activePlayerIds[this.targetPlayerIndex], guess: Math.floor(Math.random() * 7) + 2 });
    };
    return SimpleAIPlayer;
}(player_1.Player));
exports.SimpleAIPlayer = SimpleAIPlayer;
//# sourceMappingURL=simpleAIplayer.js.map