"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
var Card = /** @class */ (function () {
    function Card(cardValue, cardName, cardText) {
        this.cardValue = cardValue;
        this.cardName = cardName;
        this.cardText = cardText;
    }
    Card.prototype.getCardValue = function () {
        return this.cardValue;
    };
    Card.prototype.getCardText = function () {
        return this.cardText;
    };
    Card.prototype.getCardName = function () {
        return this.cardName;
    };
    return Card;
}());
exports.Card = Card;
