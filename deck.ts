import { Card } from './card';
export class Deck {
    private cards: Card[] = [];

    constructor() {
        //this.cards.push(1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8);
        this.cards.push(
            new Card(1, "Guard", "KILL KILL KILL"), 
            new Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."),
            new Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."),
            new Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."),
            new Card(1, "Guard", "Choose another player and name a non-Guard card. If that player has that card, they are eliminated."),
            new Card(2, "Priest", "Look at another player's hand."),
            new Card(2, "Priest", "Look at another player's hand."),
            new Card(3, "Baron", "Compare hands with another player. If you have a lower card, you are eliminated."),
            new Card(3, "Baron", "Compare hands with another player. If you have a lower card, you are eliminated."),
            new Card(4, "Handmaid", "You are protected from other players' cards until your next turn."),
            new Card(4, "Handmaid", "You are protected from other players' cards until your next turn."),
            new Card(5, "Prince", "Choose any player (including yourself) to discard their hand and draw a new card."),
            new Card(5, "Prince", "Choose any player (including yourself) to discard their hand and draw a new card."),
            new Card(6, "King", "Trade hands with another player."),
            new Card(7, "Countess", "If you have this card and the King or Prince in your hand, you must play the Countess."),
            new Card(8, "Princess", "If you play or discard this card, you are eliminated from the game.")  
        );

        this.shuffle();
    }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    cardsLeft() {
        return this.cards.length;
    }
    drawCard() {
        if (this.cards.length === 0) {
            throw new Error("No cards left in the deck");
        }
        return this.cards.pop();
    }
};