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
exports.WebSocketPlayer = void 0;
var player_1 = require("./player");
var returncodes_1 = require("./returncodes");
var WebSocketPlayer = /** @class */ (function (_super) {
    __extends(WebSocketPlayer, _super);
    function WebSocketPlayer(game, id, name, ws) {
        var _this = _super.call(this, game, name) || this;
        _this.pendingMove = null;
        _this.pendingResolve = null;
        _this.playerId = id;
        _this.ws = ws;
        return _this;
    }
    WebSocketPlayer.prototype.isHuman = function () {
        return true;
    };
    WebSocketPlayer.prototype.itsYourTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var code, move;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.drawCard();
                        _a.label = 1;
                    case 1:
                        this.sendYourTurn();
                        return [4 /*yield*/, this.awaitMove()];
                    case 2:
                        move = _a.sent();
                        this.pendingMove = move;
                        code = this.game.playCard(this);
                        if (code !== returncodes_1.ReturnCodes.SUCCESS) {
                            this.sendError(code);
                        }
                        _a.label = 3;
                    case 3:
                        if (code !== returncodes_1.ReturnCodes.SUCCESS) return [3 /*break*/, 1];
                        _a.label = 4;
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    /** Called by the server when a move message arrives from the browser. */
    WebSocketPlayer.prototype.receiveMove = function (move) {
        if (this.pendingResolve) {
            this.pendingResolve(move);
            this.pendingResolve = null;
        }
    };
    /** Override discardAndDraw so the client is told what they drew after a forced discard (Prince). */
    WebSocketPlayer.prototype.discardAndDraw = function () {
        _super.prototype.discardAndDraw.call(this);
        this.ws.send(JSON.stringify({
            type: 'forcedDraw',
            newCard: {
                name: this.cardOne.getCardName(),
                value: this.cardOne.getCardValue(),
                text: this.cardOne.getCardText()
            }
        }));
    };
    WebSocketPlayer.prototype.playCard = function () {
        var _a;
        if (!this.pendingMove) {
            return JSON.stringify({ type: 'playCard', target: -1, guess: 0 });
        }
        var move = this.pendingMove;
        // Enforce Countess rule server-side
        var c1 = this.cardOne.getCardValue();
        var c2 = this.cardTwo.getCardValue();
        var mustPlayCountess = (c1 === 7 && (c2 === 5 || c2 === 6)) ||
            (c2 === 7 && (c1 === 5 || c1 === 6));
        var desiredValue = mustPlayCountess ? 7 : move.cardValue;
        // Put the desired card in the cardTwo slot (the slot game.playCard reads)
        if (this.cardOne.getCardValue() === desiredValue && this.cardTwo.getCardValue() !== desiredValue) {
            var tmp = this.cardOne;
            this.cardOne = this.cardTwo;
            this.cardTwo = tmp;
        }
        // Cards that self-apply don't need a meaningful target, but game.ts reads
        // players[event.target] unconditionally, so we pass self to avoid index errors.
        var target = move.target;
        var cardVal = this.cardTwo.getCardValue();
        if (cardVal === 4 || cardVal === 7 || cardVal === 8) {
            target = this.playerId;
        }
        return JSON.stringify({ type: 'playCard', target: target, guess: (_a = move.guess) !== null && _a !== void 0 ? _a : 0 });
    };
    WebSocketPlayer.prototype.awaitMove = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.pendingResolve = resolve;
        });
    };
    WebSocketPlayer.prototype.sendYourTurn = function () {
        var c1 = this.cardOne.getCardValue();
        var c2 = this.cardTwo.getCardValue();
        var countessForced = (c1 === 7 && (c2 === 5 || c2 === 6)) ||
            (c2 === 7 && (c1 === 5 || c1 === 6));
        this.ws.send(JSON.stringify({
            type: 'yourTurn',
            selfId: this.playerId,
            cardOne: { name: this.cardOne.getCardName(), value: c1, text: this.cardOne.getCardText() },
            cardTwo: { name: this.cardTwo.getCardName(), value: c2, text: this.cardTwo.getCardText() },
            activePlayers: this.game.getActivePlayers(),
            countessForced: countessForced
        }));
    };
    WebSocketPlayer.prototype.sendError = function (code) {
        var _a;
        var _b;
        var messages = (_a = {},
            _a[returncodes_1.ReturnCodes.TARGET_PROTECTED] = 'That player is protected by the Handmaid — choose another target.',
            _a[returncodes_1.ReturnCodes.CANNOT_PLAY_ON_SELF] = 'You cannot play that card on yourself.',
            _a[returncodes_1.ReturnCodes.CANNOT_GUESS_GUARD] = 'You cannot guess Guard (1) — choose a different value.',
            _a[returncodes_1.ReturnCodes.MUST_CHOOSE_TARGET] = 'You must choose a valid target.',
            _a[returncodes_1.ReturnCodes.TARGET_OUT_OF_ROUND] = 'That player is already out of the round.',
            _a);
        this.ws.send(JSON.stringify({
            type: 'error',
            message: (_b = messages[code]) !== null && _b !== void 0 ? _b : 'Invalid play — please try again.'
        }));
    };
    return WebSocketPlayer;
}(player_1.Player));
exports.WebSocketPlayer = WebSocketPlayer;
//# sourceMappingURL=webSocketPlayer.js.map