export class Card {
    private cardValue: number;
    private cardName: string;
    private cardText: string;

    constructor(cardValue: number, cardName: string, cardText: string) {
        this.cardValue = cardValue;
        this.cardName = cardName;
        this.cardText = cardText;
    }

    getCardValue() {
        return this.cardValue;
    }

    getCardText() {
        return this.cardText;
    }

    getCardName() {
        return this.cardName;
    }
}