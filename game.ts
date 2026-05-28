import { Player } from './player';
import { Deck } from './deck';
import { Card } from './card';
import { colorize } from './colorize';
import { ReturnCodes } from './returncodes';

export class Game {
    private deck: Deck;
    private players: Player[] = [];
    private playerCount: number;
    private whoseTurnIsItAnyway: number;
    private gameStarted: boolean = false;
    private leftoverCard: Card;
    private playersLeft: number = 0;
    public playersStillInRound: number[] = [];
    private logger: (msg: string) => void;
    private onActionCallback: (() => void) | null = null;

    constructor(playerCount: number = 4, logger?: (msg: string) => void) {
        this.playerCount = playerCount;
        this.logger = logger || ((msg) => console.log(msg));
    }

    log(msg: string) {
        this.logger(msg);
    }

    setOnAction(fn: () => void) {
        this.onActionCallback = fn;
    }

    private onTurnStartCallback: ((playerId: number) => void) | null = null;

    setOnTurnStart(fn: (playerId: number) => void): void {
        this.onTurnStartCallback = fn;
    }

    notifyTurnStart(playerId: number): void {
        if (this.onTurnStartCallback) this.onTurnStartCallback(playerId);
    }

    private onPriestRevealCallback: ((targetId: number, card: { name: string, value: number }) => void) | null = null;

    setOnPriestReveal(fn: (targetId: number, card: { name: string, value: number }) => void): void {
        this.onPriestRevealCallback = fn;
    }

    private onShowdownCallback: ((reveals: Array<{ playerId: number, card: { name: string, value: number } }>) => void) | null = null;

    setOnShowdown(fn: (reveals: Array<{ playerId: number, card: { name: string, value: number } }>) => void): void {
        this.onShowdownCallback = fn;
    }

    private onBaronRevealCallback: ((attackerId: number, attackerCard: { name: string, value: number }, targetId: number, targetCard: { name: string, value: number }) => void) | null = null;

    setOnBaronReveal(fn: (attackerId: number, attackerCard: { name: string, value: number }, targetId: number, targetCard: { name: string, value: number }) => void): void {
        this.onBaronRevealCallback = fn;
    }

    private onAIPlanningCallback: ((playerId: number, cardValue: number, targetId: number, guess: number) => void) | null = null;

    setOnAIPlanning(fn: (playerId: number, cardValue: number, targetId: number, guess: number) => void): void {
        this.onAIPlanningCallback = fn;
    }

    notifyAIPlanning(playerId: number, cardValue: number, targetId: number, guess: number = 0): void {
        if (this.onAIPlanningCallback) this.onAIPlanningCallback(playerId, cardValue, targetId, guess);
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    async start(): Promise<void> {
        if (this.playerCount !== this.players.length) {
            this.log("Not enough players to start the game");
            return;
        }

        if (!this.gameStarted) {
            this.deck = new Deck();
            this.playersStillInRound = [];
            this.whoseTurnIsItAnyway = 0;
            this.gameStarted = true;
            this.log("Game started");
            this.leftoverCard = this.deck.drawCard();
            this.log("One card is set aside face-down.");
            this.playersLeft = this.playerCount;

            for (let i = 0; i < this.playerCount; i++) {
                this.whoseTurnIsItAnyway = i;
                this.players[i].newRound();
                this.playersStillInRound.push(i);
            }
            this.whoseTurnIsItAnyway = 0;
            if (this.onActionCallback) this.onActionCallback();
        }

        while (this.playersLeft > 1 && this.deck.cardsLeft() > 0) {
            await this.players[this.whoseTurnIsItAnyway].itsYourTurn();

            this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
            if (this.playersLeft < 2) break;

            while (this.players[this.whoseTurnIsItAnyway].outOfThisRound) {
                this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
            }

            this.log("——————————————————————————————————————");
            this.log("Next turn: " + this.players[this.whoseTurnIsItAnyway].playerName);
            const alive = this.players.filter(p => !p.outOfThisRound).map(p => p.playerName).join(", ");
            this.log("Remaining: " + alive + " | Deck: " + this.deck.cardsLeft() + " cards");
        }

        if (this.playersLeft === 1) {
            for (let i = 0; i < this.playerCount; i++) {
                if (!this.players[i].outOfThisRound) {
                    this.log(this.players[i].playerName + " is the last player standing — wins the round!");
                    this.playersLeft = -1;
                    return;
                }
            }
        } else if (this.playersLeft !== -1 && this.deck.cardsLeft() === 0) {
            this.log("Deck is empty — showdown!");
            this.resolveEndOfRound();
        }
    }

    isItMyTurn(player: Player): boolean {
        return player === this.players[this.whoseTurnIsItAnyway];
    }

    areThereAnyValidTargets(player: Player): boolean {
        for (let i = 0; i < this.playerCount; i++) {
            if (this.players[i].playerId !== player.playerId &&
                !this.players[i].outOfThisRound &&
                !this.players[i].protectedForOneRound) {
                return true;
            }
        }
        return false;
    }

    isPlayerStillInRound(playerId: number): boolean {
        return !this.players[playerId].outOfThisRound;
    }

    playCard(player: Player): number {
        if (!this.isItMyTurn(player)) {
            this.log(`It's not ${player.playerName}'s turn.`);
            return ReturnCodes.ERROR;
        }

        const event = JSON.parse(player.playCard());
        if (event.type !== "playCard") {
            this.log("Invalid event type");
            return ReturnCodes.INVALID_EVENT;
        }

        const cardToBePlayed: Card = this.players[player.playerId].cardTwo;

        // Handle no-target case
        if (event.target === -1) {
            if (this.areThereAnyValidTargets(player)) {
                return ReturnCodes.MUST_CHOOSE_TARGET;
            }
            if (player.cardTwo.getCardValue() === 5) {
                return ReturnCodes.MUST_CHOOSE_TARGET; // Prince must target someone (can be self)
            }
            const v = player.cardTwo.getCardValue();
            if (v === 1 || v === 2 || v === 3 || v === 6) {
                this.log(player.cardTwo.getCardName() + " played with no effect (no valid targets).");
                player.totalDiscardValue += cardToBePlayed.getCardValue();
                player.discards.push(cardToBePlayed);
                this.players[player.playerId].cardTwo = null;
                if (this.onActionCallback) this.onActionCallback();
                return ReturnCodes.SUCCESS;
            }
        } else if (this.players[event.target].outOfThisRound) {
            return ReturnCodes.TARGET_OUT_OF_ROUND;
        }

        const targetName = event.target !== -1 ? this.players[event.target].playerName : "(none)";
        this.log(player.playerName + " plays " + colorize.white(cardToBePlayed.getCardName()) + " on " + targetName);
        if (cardToBePlayed.getCardValue() === 1) {
            this.log(player.playerName + " guesses " + event.guess + ".");
        }

        this.players[player.playerId].protectedForOneRound = false;

        switch (cardToBePlayed.getCardValue()) {
            case 1: { // Guard
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return ReturnCodes.TARGET_PROTECTED;
                }
                if (event.guess === 1) return ReturnCodes.CANNOT_GUESS_GUARD;
                if (player.playerId === event.target) return ReturnCodes.CANNOT_PLAY_ON_SELF;
                if (this.players[event.target].cardOne.getCardValue() === event.guess) {
                    this.log(colorize.red("✗") + " " + this.players[event.target].playerName + " is out of the round!");
                    this.players[event.target].outOfThisRound = true;
                    this.playersLeft--;
                } else {
                    this.log(colorize.green("✓") + " Miss — " + this.players[event.target].playerName + " is safe.");
                }
                break;
            }
            case 2: { // Priest
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return ReturnCodes.TARGET_PROTECTED;
                }
                if (player.isHuman()) {
                    this.log(this.players[event.target].playerName + " holds: " + this.players[event.target].cardOne.getCardName());
                    if (this.onPriestRevealCallback) {
                        this.onPriestRevealCallback(event.target, {
                            name: this.players[event.target].cardOne.getCardName(),
                            value: this.players[event.target].cardOne.getCardValue()
                        });
                    }
                }
                break;
            }
            case 3: { // Baron
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return ReturnCodes.TARGET_PROTECTED;
                }
                if (player.isHuman() || this.players[event.target].isHuman()) {
                    if (this.onBaronRevealCallback) {
                        this.onBaronRevealCallback(
                            player.playerId,
                            { name: player.cardOne.getCardName(), value: player.cardOne.getCardValue() },
                            event.target,
                            { name: this.players[event.target].cardOne.getCardName(), value: this.players[event.target].cardOne.getCardValue() }
                        );
                    }
                }
                if (player.isHuman()) {
                    this.log("You hold " + this.players[player.playerId].cardOne.getCardName() +
                        "; " + this.players[event.target].playerName + " holds " + this.players[event.target].cardOne.getCardName());
                }
                const myVal = this.players[player.playerId].cardOne.getCardValue();
                const theirVal = this.players[event.target].cardOne.getCardValue();
                if (theirVal > myVal) {
                    this.log(player.playerName + " is out of the round!");
                    this.players[player.playerId].outOfThisRound = true;
                    this.playersLeft--;
                } else if (theirVal < myVal) {
                    this.log(this.players[event.target].playerName + " is out of the round!");
                    this.players[event.target].outOfThisRound = true;
                    this.playersLeft--;
                } else {
                    this.log("Tie — no one eliminated.");
                }
                break;
            }
            case 4: { // Handmaid
                this.log(player.playerName + " plays Handmaid — protected until next turn.");
                this.players[player.playerId].protectedForOneRound = true;
                break;
            }
            case 5: { // Prince
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return ReturnCodes.TARGET_PROTECTED;
                }
                const targetSelf = player.playerId === event.target;
                this.log(colorize.blue("Prince") + " — " + this.players[event.target].playerName +
                    (targetSelf ? " must discard and redraw." : " is forced to discard and redraw."));
                if (this.players[event.target].cardOne.getCardValue() === 8) {
                    this.log(this.players[event.target].playerName + " discarded the Princess and is out!");
                    this.players[event.target].outOfThisRound = true;
                    this.playersLeft--;
                } else {
                    this.players[event.target].discardAndDraw();
                }
                break;
            }
            case 6: { // King
                if (this.players[event.target].protectedForOneRound) {
                    this.log(this.players[event.target].playerName + " is protected!");
                    return ReturnCodes.TARGET_PROTECTED;
                }
                if (player.playerId === event.target) return ReturnCodes.CANNOT_PLAY_ON_SELF;
                const tempCard: Card = this.players[player.playerId].cardOne;
                this.players[player.playerId].cardOne = this.players[event.target].cardOne;
                this.players[event.target].cardOne = tempCard;
                this.log(player.playerName + " and " + this.players[event.target].playerName + " swap hands.");
                break;
            }
            case 7: { // Countess
                this.log(player.playerName + " plays Countess.");
                break;
            }
            case 8: { // Princess
                this.log(player.playerName + " played the Princess — out of the round!");
                this.players[player.playerId].outOfThisRound = true;
                this.playersLeft--;
                break;
            }
        }

        player.totalDiscardValue += cardToBePlayed.getCardValue();
        player.discards.push(cardToBePlayed);
        this.players[player.playerId].cardTwo = null;
        if (this.onActionCallback) this.onActionCallback();
        return ReturnCodes.SUCCESS;
    }

    isTheDeckEmpty(): boolean {
        return this.deck.cardsLeft() === 0;
    }

    drawCard(_player: Player): Card {
        return this.deck.drawCard();
    }

    drawLeftover(_player: Player): Card {
        const card = this.leftoverCard!;
        this.leftoverCard = null;
        return card;
    }

    getLeftoverCard(): { name: string, value: number } | null {
        if (!this.leftoverCard) return null;
        return { name: this.leftoverCard.getCardName(), value: this.leftoverCard.getCardValue() };
    }

    getDeckSize(): number {
        return this.deck ? this.deck.cardsLeft() : 0;
    }

    getAllPlayers(): Array<{ id: number, name: string, eliminated: boolean, protected: boolean, discards: Array<{ name: string, value: number }> }> {
        return this.players.map(p => {
            const discards = p.discards.map(d => ({ name: d.getCardName(), value: d.getCardValue() }));
            if (p.outOfThisRound && p.cardOne) {
                discards.push({ name: p.cardOne.getCardName(), value: p.cardOne.getCardValue() });
            }
            return {
                id: p.playerId,
                name: p.playerName,
                eliminated: p.outOfThisRound,
                protected: p.protectedForOneRound,
                discards
            };
        });
    }

    getActivePlayers(): Array<{ id: number, name: string, protected: boolean, discards: Array<{ name: string, value: number }> }> {
        return this.players
            .filter(p => !p.outOfThisRound)
            .map(p => ({
                id: p.playerId,
                name: p.playerName,
                protected: p.protectedForOneRound,
                discards: p.discards.map(d => ({ name: d.getCardName(), value: d.getCardValue() }))
            }));
    }

    resolveEndOfRound() {
        this.gameStarted = false;
        this.log("=== Showdown ===");
        let winner = this.players[0];
        let winnerCard = new Card(0, "none", "none");

        const reveals: Array<{ playerId: number, card: { name: string, value: number } }> = [];
        for (let i = 0; i < this.playerCount; i++) {
            if (!this.players[i].outOfThisRound) {
                reveals.push({ playerId: i, card: { name: this.players[i].cardOne.getCardName(), value: this.players[i].cardOne.getCardValue() } });
            }
        }
        if (this.onShowdownCallback) this.onShowdownCallback(reveals);

        for (let i = 0; i < this.playerCount; i++) {
            if (!this.players[i].outOfThisRound) {
                this.log(this.players[i].playerName + " reveals: " + this.players[i].cardOne.getCardName());
                if (this.players[i].cardOne.getCardValue() > winnerCard.getCardValue()) {
                    winner = this.players[i];
                    winnerCard = this.players[i].cardOne;
                }
            }
        }

        const tied = this.players.filter(p => !p.outOfThisRound && p.cardOne.getCardValue() === winnerCard.getCardValue());
        if (tied.length > 1) {
            this.log("Tie on card value! Comparing discard totals...");
            tied.sort((a, b) => b.totalDiscardValue - a.totalDiscardValue);
            if (tied[0].totalDiscardValue !== tied[1].totalDiscardValue) {
                winner = tied[0];
            } else {
                this.log("Perfect tie between " + tied.map(p => p.playerName).join(" and ") + "!");
                return;
            }
        }

        this.log(winner.playerName + " wins with " + winnerCard.getCardName() + "!");
    }
}

// Run standalone when invoked directly: node game.js
if (require.main === module) {
    const { SimpleAIPlayer } = require('./simpleAIplayer');
    const { HumanCLIPlayer } = require('./humanPlayer');
    const game = new Game(4);
    game.addPlayer(new HumanCLIPlayer(game, 0, "Player"));
    game.addPlayer(new SimpleAIPlayer(game, 1, "Bob"));
    game.addPlayer(new SimpleAIPlayer(game, 2, "Malice"));
    game.addPlayer(new SimpleAIPlayer(game, 3, "Angreta"));
    game.start().catch(console.error);
}
