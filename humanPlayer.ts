import { Player } from './player';
import { Game } from './game';
import { ReturnCodes } from './returncodes';
import { colorize } from './colorize';
import * as readlineSync from 'readline-sync';

export class HumanCLIPlayer extends Player {

    constructor(game: Game, id: number, name: string = "Player") {
        super(game, name);
        this.playerId = id;
    }

    isHuman(): boolean {
        return true;
    }

    itsYourTurn() {
        this.drawCard();
        let code: number = this.game.playCard(this);
        while (code !== ReturnCodes.SUCCESS) {
            this.showError(code);
            code = this.game.playCard(this);
        }
        return true;
    }

    private showError(code: number) {
        switch (code) {
            case ReturnCodes.TARGET_PROTECTED:
                console.log(colorize.red("That player is protected by the Handmaid! Choose another target."));
                break;
            case ReturnCodes.CANNOT_PLAY_ON_SELF:
                console.log(colorize.red("You cannot play that card on yourself! Choose another target."));
                break;
            case ReturnCodes.CANNOT_GUESS_GUARD:
                console.log(colorize.red("You cannot guess Guard (1)! Guess a different value."));
                break;
            case ReturnCodes.MUST_CHOOSE_TARGET:
                console.log(colorize.red("You must choose a valid target!"));
                break;
            case ReturnCodes.TARGET_OUT_OF_ROUND:
                console.log(colorize.red("That player is already out of the round! Choose another target."));
                break;
            default:
                console.log(colorize.red("Invalid play, try again."));
        }
    }

    playCard(): string {
        this.showHandAndGameState();

        // Enforce the Countess rule before prompting
        const c1 = this.cardOne.getCardValue();
        const c2 = this.cardTwo.getCardValue();
        const mustPlayCountess =
            (c1 === 7 && (c2 === 5 || c2 === 6)) ||
            (c2 === 7 && (c1 === 5 || c1 === 6));

        if (mustPlayCountess) {
            console.log(colorize.magenta("You must play the Countess when holding the King or Prince!"));
            // Ensure the Countess ends up in cardTwo (the card that gets played)
            if (this.cardOne.getCardValue() === 7) {
                const temp = this.cardOne;
                this.cardOne = this.cardTwo;
                this.cardTwo = temp;
            }
        } else {
            const choice = this.promptCardChoice();
            if (choice === 1) {
                const temp = this.cardOne;
                this.cardOne = this.cardTwo;
                this.cardTwo = temp;
            }
        }

        const cardVal = this.cardTwo.getCardValue();
        const cardName = this.cardTwo.getCardName();

        console.log(colorize.white(`\nPlaying: ${cardName} (${cardVal})`));

        let target = this.playerId;
        let guess = 0;

        switch (cardVal) {
            case 1: // Guard — needs a target and a guess
                target = this.promptForTarget(false);
                if (target !== -1) {
                    guess = this.promptForGuess();
                }
                break;
            case 2: // Priest — needs a target
            case 3: // Baron — needs a target
                target = this.promptForTarget(false);
                break;
            case 4: // Handmaid — protects self, no target prompt needed
                break;
            case 5: // Prince — can target self or others
                target = this.promptForTarget(true);
                break;
            case 6: // King — needs a different target
                target = this.promptForTarget(false);
                break;
            case 7: // Countess — no effect, no target
                break;
            case 8: // Princess — eliminates yourself
                console.log(colorize.red("You played the Princess — you are out of the round!"));
                break;
        }

        const event = { type: "playCard", target, guess };
        return JSON.stringify(event);
    }

    private showHandAndGameState() {
        console.log("\n" + colorize.brightWhite("════════════════════════════════════════════"));
        console.log(colorize.brightWhite(`YOUR TURN — ${this.playerName.toUpperCase()}`));
        console.log(colorize.brightWhite("════════════════════════════════════════════"));

        console.log(colorize.white("\nYour hand:"));
        console.log(`  [1] ${colorize.yellow(this.cardOne.getCardName())} (value ${this.cardOne.getCardValue()})`);
        console.log(`  [2] ${colorize.yellow(this.cardTwo.getCardName())} (value ${this.cardTwo.getCardValue()})`);

        const activePlayers = this.game.getActivePlayers();
        console.log(colorize.white("\nOther players:"));
        for (const p of activePlayers) {
            if (p.id === this.playerId) continue;
            const protectedStr = p.protected ? colorize.cyan(" [PROTECTED]") : "";
            const discardStr = p.discards.length > 0
                ? colorize.gray("  discards: " + p.discards.map(d => `${d.name}(${d.value})`).join(", "))
                : "";
            console.log(`  ${p.name} (id:${p.id})${protectedStr}${discardStr}`);
        }
        console.log();
    }

    private promptCardChoice(): number {
        console.log("Which card do you want to play?");
        console.log(`  [1] ${this.cardOne.getCardName()} (value ${this.cardOne.getCardValue()})`);
        console.log(`  [2] ${this.cardTwo.getCardName()} (value ${this.cardTwo.getCardValue()})`);

        while (true) {
            const raw = readlineSync.question("Enter 1 or 2: ").trim();
            const n = parseInt(raw, 10);
            if (n === 1 || n === 2) return n;
            console.log("Please enter 1 or 2.");
        }
    }

    private promptForTarget(includeSelf: boolean): number {
        const activePlayers = this.game.getActivePlayers();
        const candidates = activePlayers.filter(p => includeSelf || p.id !== this.playerId);

        if (candidates.length === 0) {
            console.log("No valid targets available.");
            return -1;
        }

        console.log("Choose a target:");
        for (let i = 0; i < candidates.length; i++) {
            const p = candidates[i];
            const selfStr  = p.id === this.playerId ? colorize.gray(" (you)") : "";
            const protStr  = p.protected ? colorize.cyan(" [PROTECTED]") : "";
            console.log(`  [${i + 1}] ${p.name} (id:${p.id})${selfStr}${protStr}`);
        }

        while (true) {
            const raw = readlineSync.question(`Enter 1–${candidates.length}: `).trim();
            const n = parseInt(raw, 10);
            if (n >= 1 && n <= candidates.length) return candidates[n - 1].id;
            console.log(`Please enter a number between 1 and ${candidates.length}.`);
        }
    }

    private promptForGuess(): number {
        console.log("Guess the target's card (2–8):");
        console.log("  2=Priest  3=Baron  4=Handmaid  5=Prince  6=King  7=Countess  8=Princess");

        while (true) {
            const raw = readlineSync.question("Enter 2–8: ").trim();
            const n = parseInt(raw, 10);
            if (n >= 2 && n <= 8) return n;
            console.log("Please enter a value between 2 and 8 (you cannot guess 1/Guard).");
        }
    }
}
