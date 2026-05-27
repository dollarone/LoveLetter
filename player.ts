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
        console.log(`${this.playerName} drew starting card: ${this.cardOne.getCardName()}`);
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
            console.log(`${this.playerName} discarded ${cardToDiscard.getCardName()} and drew a new card: ${this.cardOne.getCardName()}`);
        }
        else {
            console.log("No more cards in deck - drawing leftover card");
            this.cardOne = this.game.drawLeftover(this);
            console.log(`${this.playerName} drew card: ${this.cardOne.getCardName()}`);
        }
    }

    drawCard() {
        if (!this.game.isTheDeckEmpty()) {

            this.cardTwo = this.game.drawCard(this);
            if (this.cardTwo == null) {
                console.log("No more cards to draw");
            }
            else {
                console.log(`${this.playerName} drew card: ${this.cardTwo.getCardName()}`);
            }
        }
    }

    playCard() {
        return "";
    }
};