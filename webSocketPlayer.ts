import WebSocket from 'ws';
import { Player } from './player';
import { Game } from './game';
import { ReturnCodes } from './returncodes';

export interface ClientMove {
    cardValue: number; // value of the card the player wants to play
    target: number;    // target player id, or -1
    guess: number;     // guard guess value, or 0
}

export class WebSocketPlayer extends Player {
    private ws: WebSocket;
    private pendingMove: ClientMove | null = null;
    private pendingResolve: ((move: ClientMove) => void) | null = null;

    constructor(game: Game, id: number, name: string, ws: WebSocket) {
        super(game, name);
        this.playerId = id;
        this.ws = ws;
    }

    isHuman(): boolean {
        return true;
    }

    async itsYourTurn(): Promise<boolean> {
        this.drawCard();

        let code: number;
        do {
            this.sendYourTurn();
            const move = await this.awaitMove();
            this.pendingMove = move;
            code = this.game.playCard(this);
            if (code !== ReturnCodes.SUCCESS) {
                this.sendError(code);
            }
        } while (code !== ReturnCodes.SUCCESS);

        return true;
    }

    /** Called by the server when a move message arrives from the browser. */
    receiveMove(move: ClientMove) {
        if (this.pendingResolve) {
            this.pendingResolve(move);
            this.pendingResolve = null;
        }
    }

    /** Override discardAndDraw so the client is told what they drew after a forced discard (Prince). */
    discardAndDraw() {
        super.discardAndDraw();
        this.ws.send(JSON.stringify({
            type: 'forcedDraw',
            newCard: {
                name: this.cardOne.getCardName(),
                value: this.cardOne.getCardValue(),
                text: this.cardOne.getCardText()
            }
        }));
    }

    playCard(): string {
        if (!this.pendingMove) {
            return JSON.stringify({ type: 'playCard', target: -1, guess: 0 });
        }

        const move = this.pendingMove;

        // Enforce Countess rule server-side
        const c1 = this.cardOne.getCardValue();
        const c2 = this.cardTwo.getCardValue();
        const mustPlayCountess =
            (c1 === 7 && (c2 === 5 || c2 === 6)) ||
            (c2 === 7 && (c1 === 5 || c1 === 6));
        const desiredValue = mustPlayCountess ? 7 : move.cardValue;

        // Put the desired card in the cardTwo slot (the slot game.playCard reads)
        if (this.cardOne.getCardValue() === desiredValue && this.cardTwo.getCardValue() !== desiredValue) {
            const tmp = this.cardOne;
            this.cardOne = this.cardTwo;
            this.cardTwo = tmp;
        }

        // Cards that self-apply don't need a meaningful target, but game.ts reads
        // players[event.target] unconditionally, so we pass self to avoid index errors.
        let target = move.target;
        const cardVal = this.cardTwo.getCardValue();
        if (cardVal === 4 || cardVal === 7 || cardVal === 8) {
            target = this.playerId;
        }

        return JSON.stringify({ type: 'playCard', target, guess: move.guess ?? 0 });
    }

    private awaitMove(): Promise<ClientMove> {
        return new Promise((resolve) => {
            this.pendingResolve = resolve;
        });
    }

    private sendYourTurn() {
        const c1 = this.cardOne.getCardValue();
        const c2 = this.cardTwo.getCardValue();
        const countessForced =
            (c1 === 7 && (c2 === 5 || c2 === 6)) ||
            (c2 === 7 && (c1 === 5 || c1 === 6));

        this.ws.send(JSON.stringify({
            type: 'yourTurn',
            selfId: this.playerId,
            cardOne: { name: this.cardOne.getCardName(), value: c1, text: this.cardOne.getCardText() },
            cardTwo: { name: this.cardTwo.getCardName(), value: c2, text: this.cardTwo.getCardText() },
            activePlayers: this.game.getActivePlayers(),
            countessForced
        }));
    }

    private sendError(code: number) {
        const messages: Record<number, string> = {
            [ReturnCodes.TARGET_PROTECTED]: 'That player is protected by the Handmaid — choose another target.',
            [ReturnCodes.CANNOT_PLAY_ON_SELF]: 'You cannot play that card on yourself.',
            [ReturnCodes.CANNOT_GUESS_GUARD]: 'You cannot guess Guard (1) — choose a different value.',
            [ReturnCodes.MUST_CHOOSE_TARGET]: 'You must choose a valid target.',
            [ReturnCodes.TARGET_OUT_OF_ROUND]: 'That player is already out of the round.'
        };
        this.ws.send(JSON.stringify({
            type: 'error',
            message: messages[code] ?? 'Invalid play — please try again.'
        }));
    }
}
