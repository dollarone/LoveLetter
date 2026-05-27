"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deck = void 0;
var card_1 = require("./card");
var Deck = /** @class */ (function () {
    function Deck() {
        this.cards = [];
        //this.cards.push(1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8);
        this.cards.push(new card_1.Card(1, "Guard", "KILL KILL KILL"), new card_1.Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."), new card_1.Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."), new card_1.Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."), new card_1.Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."), new card_1.Card(2, "Priest", "Look at another player's hand."), new card_1.Card(2, "Priest", "Look at another player's hand."), new card_1.Card(3, "Baron", "Compare hands with another player. If you have a lower card, you are eliminated."), new card_1.Card(3, "Baron", "Compare hands with another player. If you have a lower card, you are eliminated."), new card_1.Card(4, "Handmaid", "You are protected from other players' cards until your next turn."), new card_1.Card(4, "Handmaid", "You are protected from other players' cards until your next turn."), new card_1.Card(5, "Prince", "Choose any player (including yourself) to discard their hand and draw a new card."), new card_1.Card(5, "Prince", "Choose any player (including yourself) to discard their hand and draw a new card."), new card_1.Card(6, "King", "Trade hands with another player."), new card_1.Card(7, "Countess", "If you have this card and the King or Prince in your hand, you must play the Countess."), new card_1.Card(8, "Princess", "If you play or discard this card, you are eliminated from the game."));
        this.shuffle();
    }
    Deck.prototype.shuffle = function () {
        var _a;
        for (var i = this.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [this.cards[j], this.cards[i]], this.cards[i] = _a[0], this.cards[j] = _a[1];
        }
    };
    Deck.prototype.cardsLeft = function () {
        return this.cards.length;
    };
    Deck.prototype.drawCard = function () {
        if (this.cards.length === 0) {
            throw new Error("No cards left in the deck");
        }
        return this.cards.pop();
    };
    return Deck;
}());
exports.Deck = Deck;
;
//# sourceMappingURL=deck.js.map