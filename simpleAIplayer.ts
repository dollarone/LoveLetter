import { Player } from './player';
import { Game } from './game';
import { Card } from './card';
import { ReturnCodes } from './returncodes';

export class SimpleAIPlayer extends Player {

    private override: boolean = false;
    private targetPlayerIndex: number = -1;

    constructor(game: Game, id: number, name: string = "Frank") {
        super(game, name);
        this.playerId = id;
        this.override = false;
        this.targetPlayerIndex = -1;
    }
    itsYourTurn() {
        //console.log("It's your turn");
        this.drawCard();
        //console.log("You drew a card");
        let code: number = this.game.playCard(this);
        while (code != ReturnCodes.SUCCESS) {
            this.override = true;
            code = this.game.playCard(this);
        }
        //console.log("You played a card");
        return true;
    }

    playCard() {
        if(this.override) {
            this.override = false;
            console.log("    Override - ensuring valid card play ");
            
            if(!this.game.areThereAnyValidTargets(this) && this.cardTwo.getCardValue() === 5) {
                console.log("    No valid targets - targetting self with Prince");
                let guess: number = Math.floor(Math.random() * 7) + 2;
                const event = {
                    type: "playCard", 
                    target: this.playerId,
                    guess: guess
                };
                return JSON.stringify(event);
            }

            if(!this.game.areThereAnyValidTargets(this)) {
                console.log("    No valid targets - targetting noone");
                let guess: number = Math.floor(Math.random() * 7) + 2;
                const event = {
                    type: "playCard", 
                    target: -1,
                    guess: guess
                };
                return JSON.stringify(event);
            }

            // new random target:
            let newTargetPlayerIndex: number = Math.floor(Math.random() * this.activePlayerIds.length);
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
            let guess: number = Math.floor(Math.random() * 7) + 2;
            const event = {
                type: "playCard", 
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: guess
            };
            return JSON.stringify(event);
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
            const event = {
                type: "playCard", 
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: 0
            };
            return JSON.stringify(event);

        }

        if (this.cardOne.getCardValue() == 7 && (this.cardTwo.getCardValue() == 6 || this.cardTwo.getCardValue() == 5) ||
            (this.cardOne.getCardValue() <= this.cardTwo.getCardValue())) {
            let card: Card = this.cardOne;
            this.cardOne = this.cardTwo;
            this.cardTwo = card;
            let guess: number = Math.floor(Math.random() * 7) + 2;
            const event = {
                type: "playCard", 
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: guess
            };
            return JSON.stringify(event);
        }
        else {
            let guess: number = Math.floor(Math.random() * 7) + 2;
            const event = {
                type: "playCard", 
                target: this.activePlayerIds[this.targetPlayerIndex],
                guess: guess
            };
            return JSON.stringify(event);
        }
    }    
}