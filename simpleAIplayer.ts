import { Player } from './player';
import { Game } from './game';
import { Card } from './card';
import { ReturnCodes } from './returncodes';

const NO_TARGET_CARDS = [4, 7, 8]; // Handmaid, Countess, Princess — target irrelevant

export class SimpleAIPlayer extends Player {

    private override: boolean = false;
    private targetPlayerIndex: number = -1;
    private _computedPlay: string | null = null;

    constructor(game: Game, id: number, name: string = "Frank") {
        super(game, name);
        this.playerId = id;
    }

    async itsYourTurn(): Promise<boolean> {
        this.game.notifyTurnStart(this.playerId);
        this.drawCard();
        const { cardValue, targetId, guess } = this.precomputePlay();
        this.game.notifyAIPlanning(this.playerId, cardValue, targetId, guess);
        let code: number = this.game.playCard(this);
        while (code !== ReturnCodes.SUCCESS) {
            this.override = true;
            this._computedPlay = null;
            code = this.game.playCard(this);
        }
        return true;
    }

    /** Pre-compute and cache the move so playCard() can reuse it without re-running logic. */
    private precomputePlay(): { cardValue: number, targetId: number, guess: number } {
        this._computedPlay = this._computePlayInternal();
        const parsed = JSON.parse(this._computedPlay);
        const cardValue = this.cardTwo.getCardValue();
        const targetId = NO_TARGET_CARDS.includes(cardValue) ? -1 : parsed.target;
        const guess = parsed.guess || 0;
        return { cardValue, targetId, guess };
    }

    playCard(): string {
        if (this._computedPlay) {
            const result = this._computedPlay;
            this._computedPlay = null;
            return result;
        }
        return this._computePlayInternal();
    }

    private _computePlayInternal(): string {
        if (this.override) {
            this.override = false;
            console.log("    Override - ensuring valid card play ");

            if (!this.game.areThereAnyValidTargets(this) && this.cardTwo.getCardValue() === 5) {
                console.log("    No valid targets - targetting self with Prince");
                return JSON.stringify({ type: "playCard", target: this.playerId, guess: Math.floor(Math.random() * 7) + 2 });
            }

            if (!this.game.areThereAnyValidTargets(this)) {
                console.log("    No valid targets - targetting noone");
                return JSON.stringify({ type: "playCard", target: -1, guess: Math.floor(Math.random() * 7) + 2 });
            }

            let newTargetPlayerIndex = Math.floor(Math.random() * this.activePlayerIds.length);
            while (this.activePlayerIds[newTargetPlayerIndex] === this.playerId || newTargetPlayerIndex === this.targetPlayerIndex) {
                newTargetPlayerIndex = (newTargetPlayerIndex + 1) % this.activePlayerIds.length;
            }
            this.targetPlayerIndex = newTargetPlayerIndex;
            console.log("    Target player index: " + this.activePlayerIds[this.targetPlayerIndex]);
            return JSON.stringify({ type: "playCard", target: this.activePlayerIds[this.targetPlayerIndex], guess: Math.floor(Math.random() * 7) + 2 });
        }

        this.targetPlayerIndex = Math.floor(Math.random() * this.activePlayerIds.length);
        if (this.activePlayerIds[this.targetPlayerIndex] === this.playerId) {
            this.targetPlayerIndex = (this.targetPlayerIndex + 1) % this.activePlayerIds.length;
        }
        while (!this.game.isPlayerStillInRound(this.activePlayerIds[this.targetPlayerIndex]) || this.activePlayerIds[this.targetPlayerIndex] === this.playerId) {
            this.targetPlayerIndex = (this.targetPlayerIndex + 1) % this.activePlayerIds.length;
        }
        console.log("    Target player index: " + this.activePlayerIds[this.targetPlayerIndex]);
        console.log(this.playerName + " is choosing between: " + this.cardOne.getCardName() + " and " + this.cardTwo.getCardName());

        // Countess forced: keep Countess in cardTwo
        if (this.cardTwo.getCardValue() === 7 && (this.cardOne.getCardValue() === 6 || this.cardOne.getCardValue() === 5)) {
            return JSON.stringify({ type: "playCard", target: this.activePlayerIds[this.targetPlayerIndex], guess: 0 });
        }

        // Swap so the higher-value card (or Countess-forced) ends up in cardTwo (played)
        if ((this.cardOne.getCardValue() === 7 && (this.cardTwo.getCardValue() === 6 || this.cardTwo.getCardValue() === 5)) ||
            (this.cardOne.getCardValue() <= this.cardTwo.getCardValue())) {
            const tmp: Card = this.cardOne;
            this.cardOne = this.cardTwo;
            this.cardTwo = tmp;
        }

        return JSON.stringify({ type: "playCard", target: this.activePlayerIds[this.targetPlayerIndex], guess: Math.floor(Math.random() * 7) + 2 });
    }
}
