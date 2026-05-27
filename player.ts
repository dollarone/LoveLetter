import { Card } from "./card";
import { Game } from "./game";

export abstract class Player {
    public playerName: string;
    public playerId: number;
    public cardOne: Card;
    public cardTwo: Card;
    public activePlayerIds: number[] = [];
    public discards: Card[] = [];
    public totalDiscardValue: number;
    public outOfThisRound: boolean = false;
    public game: Game;
    public protectedForOneRound: boolean = false;

    constructor(game: Game, name: string = "Frank") {
        this.playerName = name;
        this.game = game;
        this.activePlayerIds.push(0);
        this.activePlayerIds.push(1);
        this.activePlayerIds.push(2);
        this.activePlayerIds.push(3);
        this.totalDiscardValue = 0;
    }

    newRound() {
        this.cardOne = this.game.drawCard(this);
        this.cardTwo = null;
        this.discards = [];
        this.outOfThisRound = false;
        if (!this.isHuman()) {
            this.game.log(`${this.playerName} draws their starting card.`);
        }
    }

    async itsYourTurn(): Promise<boolean> {
        return true;
    }

    discardAndDraw() {
        const cardToDiscard: Card = this.cardOne;
        this.discards.push(this.cardOne);
        this.totalDiscardValue += this.cardOne.getCardValue();

        if (!this.game.isTheDeckEmpty()) {
            this.cardOne = this.game.drawCard(this);
            this.game.log(`${this.playerName} discards ${cardToDiscard.getCardName()} and draws.`);
        } else {
            this.cardOne = this.game.drawLeftover(this);
            this.game.log(`${this.playerName} discards ${cardToDiscard.getCardName()} and draws the leftover card.`);
        }
    }

    drawCard() {
        if (!this.game.isTheDeckEmpty()) {
            this.cardTwo = this.game.drawCard(this);
            if (!this.isHuman()) {
                this.game.log(`${this.playerName} draws a card.`);
            }
        }
    }

    isHuman(): boolean {
        return false;
    }

    playCard(): string {
        return "";
    }
}
