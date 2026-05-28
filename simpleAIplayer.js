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
        return __awaiter(this, void 0, void 0, function () {
            var code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.game.notifyTurnStart(this.playerId);
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 700); })];
                    case 1:
                        _a.sent();
                        this.drawCard();
                        code = this.game.playCard(this);
                        while (code != returncodes_1.ReturnCodes.SUCCESS) {
                            this.override = true;
                            code = this.game.playCard(this);
                        }
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 900); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
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
//# sourceMappingURL=simpleAIplayer.js.map