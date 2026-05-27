import { Card } from "./card";
import { Game } from "./game";

export abstract class Player {
    public playerName: string;
    public playerId: number;
    public cardOne: Card;
    public cardTwo: Card;
    public activePlayerIds: number[] = [];
    public discards: Card[] = [];
    public totalDiscardValue;
    public outOfThisRound: boolean = false;
    public game : Game;
    public protectedForOneRound : boolean = false;

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
        if (this.isHuman()) {
            console.log(`You drew your starting card: ${this.cardOne.getCardName()}`);
        } else {
            console.log(`${this.playerName} draws their starting card.`);
        }
    }

    itsYourTurn() {
        console.log("It's your turn");
    }

    discardAndDraw() {
        let cardToDiscard: Card = this.cardOne;
        this.discards.push(this.cardOne);
        this.totalDiscardValue += this.cardOne.getCardValue();
        
        if (!this.game.isTheDeckEmpty()) {

            this.cardOne = this.game.drawCard(this);
            if (this.isHuman()) {
                console.log(`You discarded ${cardToDiscard.getCardName()} and drew: ${this.cardOne.getCardName()}`);
            } else {
                console.log(`${this.playerName} discarded ${cardToDiscard.getCardName()} and draws a new card.`);
            }
        }
        else {
            console.log("No more cards in deck - drawing leftover card");
            this.cardOne = this.game.drawLeftover(this);
            if (this.isHuman()) {
                console.log(`You drew the leftover card: ${this.cardOne.getCardName()}`);
            } else {
                console.log(`${this.playerName} drew the leftover card.`);
            }
        }
    }

    drawCard() {
        if (!this.game.isTheDeckEmpty()) {

            this.cardTwo = this.game.drawCard(this);
            if (this.cardTwo == null) {
                console.log("No more cards to draw");
            } else if (this.isHuman()) {
                console.log(`You drew: ${this.cardTwo.getCardName()}`);
            } else {
                console.log(`${this.playerName} draws a card.`);
            }
        }
    }

    isHuman(): boolean {
        return false;
    }

    playCard() {
        return "";
    }
};