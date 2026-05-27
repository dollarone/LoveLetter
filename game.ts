
import { Player } from './player';
import { Deck } from './deck';
import { Card } from './card';
import { SimpleAIPlayer } from './simpleAIplayer';
import { colorize } from './colorize';
import { ReturnCodes } from './returncodes';

export class Game {
    private deck: Deck;
    private players: Player[] = [];
    private playerCount: number;
    private whoseTurnIsItAnyway: number;
    private gameStarted: boolean = false;
    private leftoverCard: Card;
    private playersLeft: number = 0
    private static waitingForPlayerTurn: boolean = false;
    private sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    public playersStillInRound : number[] = [];


    constructor (playerCount: number = 4) {
        this.playerCount = playerCount;
    };

    addPlayer(player: Player) {
        this.players.push(player);
        if (this.players.length == this.playerCount) {
            this.start();
        }
    }
    private sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

    async sleep2() {
        await this.sleepNow(10000);
    }
    start() {
        if (this.playerCount !== this.players.length) { 
            console.log("Not enough players to start the game");
        }
        else {
            if (!this.gameStarted) {
                this.deck = new Deck();
                this.playersStillInRound = [];
                this.whoseTurnIsItAnyway = 1;
                this.gameStarted=true;
                console.log("Game started");
                this.leftoverCard = this.deck.drawCard();
                console.log("Leftover card: " + this.leftoverCard.getCardName());
                this.playersLeft = this.playerCount;
                
                for(let i = 0; i < this.playerCount; i++) {
                    this.whoseTurnIsItAnyway = i;;
                    this.players[i].newRound()
                    this.playersStillInRound.push(i);
                }
                this.whoseTurnIsItAnyway = 0;
            }

            while (this.playersLeft > 1 && this.deck.cardsLeft() > 0) {
                this.players[this.whoseTurnIsItAnyway].itsYourTurn();
              
                
                this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
                if (this.playersLeft < 2) {
                    break;
                }
                while (this.players[this.whoseTurnIsItAnyway].outOfThisRound) {
                    this.whoseTurnIsItAnyway = (this.whoseTurnIsItAnyway + 1) % this.playerCount;
                }
                console.log("======================================================");
                console.log("New turn: " + this.players[this.whoseTurnIsItAnyway].playerName);

                let buffer = "Players left in round: ";
                for(let i = 0; i < this.playerCount; i++) {
                    if (!this.players[i].outOfThisRound) {
                        buffer += this.players[i].playerName + " (" +  this.players[i].playerId + ") ";
                    }
                }
                console.log(buffer);;
                console.log("Cards left in deck: " + this.deck.cardsLeft());
            }
            if (this.playersLeft === 1) {
                for(let i = 0; i < this.playerCount; i++) {
                    if (!this.players[i].outOfThisRound) {
                        console.log(`${this.players[i].playerName} is the last remaining player and wins!`);
                        this.playersLeft = -1;
                        return;
                    }
                }
            }
            else if (this.playersLeft !== -1 && this.deck.cardsLeft() === 0) {
                console.log("Deck is empty - end of round");
                this.resolveEndOfRound();
                return;

            }
            else if (this.playersLeft === -1) {
                //console.log("Game over - no players left");
                
            }
            else {
                console.log("What happened?");
            }
        }
    }

    isItMyTurn(player: Player) {
        if (player === this.players[this.whoseTurnIsItAnyway]) {
            return true;
        }
        else return false;
    }

    areThereAnyValidTargets(player: Player) {
        let validTargets: number[] = [];
        for (let i = 0; i < this.playerCount; i++) {
            if (this.players[i].playerId !== player.playerId && !this.players[i].outOfThisRound && !this.players[i].protectedForOneRound) {
                validTargets.push(this.players[i].playerId);
            }
        }
        if (validTargets.length > 0) {
            return true;
        }
        else return false;
    }

    isPlayerStillInRound(playerId: number) {
        if (this.players[playerId].outOfThisRound) {
            return false;
        }
        else return true;
    }

    playCard(player: Player): number {
        
        if (this.isItMyTurn(player)) {
            const event = JSON.parse(player.playCard());
          
            if (event.type === "playCard") {
                let cardToBePlayed: Card = this.players[player.playerId].cardTwo;

                if (event.target === -1) {
                    if (this.areThereAnyValidTargets(player)) {
                        return ReturnCodes.MUST_CHOOSE_TARGET;
                    }
                    else if (player.cardTwo.getCardValue() === 5) {
                        console.log("No valid targets - but can target Prince on self");
                         return ReturnCodes.MUST_CHOOSE_TARGET;
                    }
                    else if(player.cardTwo.getCardValue() === 1 ||
                            player.cardTwo.getCardValue() === 2 ||
                            player.cardTwo.getCardValue() === 3 ||
                            player.cardTwo.getCardValue() === 6) { 
                        console.log("No valid target. " + player.cardTwo.getCardName() + " played with no effect");
                        player.totalDiscardValue += cardToBePlayed.getCardValue();
                        player.discards.push(cardToBePlayed);
                        this.players[player.playerId].cardTwo = null;
                        return ReturnCodes.SUCCESS;                            
                    }
                }
                else if (this.players[event.target].outOfThisRound) {
                    return ReturnCodes.TARGET_OUT_OF_ROUND;
                }

                
                console.log(this.players[player.playerId].playerName + " wants to play " + cardToBePlayed.getCardName() + " on " + this.players[event.target].playerName);
                if (cardToBePlayed.getCardValue() === 1) {
                    console.log(player.playerName + " is guessing card value " + event.guess + ". " + this.players[event.target].playerName + " has card " + this.players[event.target].cardOne.getCardName());
                }
                this.players[player.playerId].protectedForOneRound = false;
                switch (cardToBePlayed.getCardValue()) {
                    case 1: 
                        if (this.players[event.target].protectedForOneRound) {
                            console.log(this.players[event.target].playerName + " is protected!");
                            return ReturnCodes.TARGET_PROTECTED;
                        }

                        if (event.guess === 1) {
                            console.log("Cannot guess Guard");
                            return ReturnCodes.CANNOT_GUESS_GUARD;
                        }
                        if (player.playerId === event.target) {
                            console.log("Cannot play Guard on self!");
                            return ReturnCodes.CANNOT_PLAY_ON_SELF;
                        }
                        console.log(colorize.gray("Guard") + colorize.white(" played on " + this.players[event.target].playerName));
                        if (this.players[event.target].cardOne.getCardValue() === event.guess) {
                            console.log(this.players[event.target].playerName + " is out of the round");
                            this.players[event.target].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        break;
                    case 2: 
                        if (this.players[event.target].protectedForOneRound) {
                            console.log(this.players[event.target].playerName + " is protected!");
                            return ReturnCodes.TARGET_PROTECTED;
                        }
                        console.log(colorize.green("Priest") + colorize.white(" played on " + this.players[event.target].playerName));
                        console.log(this.players[event.target].playerName + " has a " + this.players[event.target].cardOne.getCardName());
                        break;
                    case 3: 
                        if (this.players[event.target].protectedForOneRound) {
                            console.log(this.players[event.target].playerName + " is protected!");
                            return ReturnCodes.TARGET_PROTECTED;
                        }
                        console.log(colorize.cyan("Baron") + colorize.white(" played on " + this.players[event.target].playerName));
                        console.log(player.playerName + " has a " + this.players[player.playerId].cardOne.getCardName() + " and " + this.players[event.target].playerName + " has a " + this.players[event.target].cardOne.getCardName());
                        if (this.players[event.target].cardOne.getCardValue() > this.players[player.playerId].cardOne.getCardValue()) {
                            console.log(player.playerName + " is out of the round!");
                            this.players[player.playerId].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        else if (this.players[event.target].cardOne.getCardValue() < this.players[player.playerId].cardOne.getCardValue()) {
                            console.log(this.players[event.target].playerName + " is out of the round!");
                            this.players[event.target].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        else {
                            console.log("It's a tie - no one is out of the round!");
                        }

                        break;
                    case 4: 
                        console.log(player.playerName + " plays " + colorize.yellow("Handmaid") + colorize.white(" on themselves."));
                        this.players[player.playerId].protectedForOneRound = true;
                        break;
                    case 5: 
                        if (this.players[event.target].protectedForOneRound) {
                            console.log(this.players[event.target].playerName + " is protected!");
                            return ReturnCodes.TARGET_PROTECTED;;
                        }
                        if (player.playerId === event.target) {
                            console.log(colorize.blue("Prince") + colorize.white(" played on self!"));
                        }
                        else {
                            console.log(colorize.blue("Prince") + colorize.white(" played on " + this.players[event.target].playerName));
                        }
                        if (this.players[event.target].cardOne.getCardValue() === 8) {
                            console.log(this.players[event.target].playerName + " has the Princess and is out of the round!");
                            this.players[event.target].outOfThisRound = true;
                            this.playersLeft--;
                        }
                        else {
                            this.players[event.target].discardAndDraw();
                        }
                        break;
                    case 6: console.log(colorize.brightBlue("King") + colorize.white(" played on " + this.players[event.target].playerName));
                        if (this.players[event.target].protectedForOneRound) {
                            console.log(this.players[event.target].playerName + " is protected!");
                            return ReturnCodes.TARGET_PROTECTED;
                        }
                        if (player.playerId === event.target) {
                            console.log("Cannot play King on self!");
                            return ReturnCodes.CANNOT_PLAY_ON_SELF;
                        }
                        let tempCard: Card = this.players[player.playerId].cardOne;
                        this.players[player.playerId].cardOne = this.players[event.target].cardOne;
                        this.players[event.target].cardOne = tempCard;
                        console.log(player.playerName + " and " + this.players[event.target].playerName + " swapped cards");
                        break;
                    case 7: console.log(player.playerName + " plays " + colorize.magenta("Countess") + colorize.white("."));
                        break;
                    case 8: console.log(colorize.red("Princess") + colorize.white(" played - " + this.players[event.target].playerName + " is out of the round!"));
                        this.players[player.playerId].outOfThisRound = true;
                        this.playersLeft--;
                        break;
                }
                player.totalDiscardValue += cardToBePlayed.getCardValue();
                player.discards.push(cardToBePlayed);
                this.players[player.playerId].cardTwo = null;
                return ReturnCodes.SUCCESS;
            }
            else {
                console.log("Invalid event");
                return ReturnCodes.INVALID_EVENT;
            }

        }
        else {
            console.log(`It's not ${player.playerName}'s turn to play a card.`);
        }
    }//#endregion

    isTheDeckEmpty() {
        if (this.deck.cardsLeft() === 0) {
            return true;
        }
        else return false;
    }

    drawCard(player: Player) {
//        if (this.isItMyTurn(player)) {
        const card: Card = this.deck.drawCard();
        return card;
  //      }
  /*        else {
            console.log(`It's not Player ${player}'s turn to draw a card.`);
            return null;
        }
        */
    }

    drawLeftover(player: Player) {
        const card: Card = this.leftoverCard;
        return card;
    }

    resolveEndOfRound() {
        // check for win
        this.gameStarted = false;
        console.log("End of round: Showdown!");
        console.log("--------------------------------");
        let winner = this.players[0];
        let winnerCard = new Card(0, "none", "none");
        let tied = false;
        for (let i = 0; i < this.playerCount; i++) {
            if(!this.players[i].outOfThisRound) {
                console.log(this.players[i].playerName + " has a " + this.players[i].cardOne.getCardName());
                if (this.players[i].cardOne.getCardValue() > winnerCard.getCardValue()) {
                    winner = this.players[i];
                    winnerCard = this.players[i].cardOne;
                }
            }
        }
        let count = 0;
        for (let i = 0; i < this.playerCount; i++) {
            if(!this.players[i].outOfThisRound && this.players[i].cardOne.getCardValue() === winnerCard.getCardValue()) {
                count+=1;
            }
        }
        if (count > 1) {
            tied = true;
        }
        console.log("--------------------------------");
        if (tied) {
            console.log("It's a tie!");
            let tiedPlayers: Player[] = [];
            for (let i = 0; i < this.playerCount; i++) {
                if(!this.players[i].outOfThisRound && this.players[i].cardOne.getCardValue() === winnerCard.getCardValue()) {
                    tiedPlayers.push(this.players[i]);
                }
            }
            if (tiedPlayers[0].totalDiscardValue > tiedPlayers[1].totalDiscardValue) {
                winner = tiedPlayers[0];
                tied = false;
                console.log("The winner is " + tiedPlayers[0].playerName + " with a " + winnerCard.getCardName() + " and a total discard value of " + tiedPlayers[0].totalDiscardValue);
                console.log(tiedPlayers[1].playerName + " has a total discard value of " + tiedPlayers[1].totalDiscardValue);
            }
            else if (tiedPlayers[0].totalDiscardValue < tiedPlayers[1].totalDiscardValue) {
                winner = tiedPlayers[1];
                tied = false;
                console.log("The winner is " + tiedPlayers[1].playerName + " with a " + winnerCard.getCardName() + " and a total discard value of " + tiedPlayers[1].totalDiscardValue);
                console.log(tiedPlayers[0].playerName + " has a total discard value of " + tiedPlayers[0].totalDiscardValue);
            }
            else {
                console.log("wE ACTUALLY HAVE A TIE! " + tiedPlayers[0].playerName + " and " + tiedPlayers[1].playerName);    
                console.log("They both have a " + winnerCard.getCardName() + " and a total discard value of " + tiedPlayers[0].totalDiscardValue);
            }
        } 
        else {
            console.log("The winner is " + winner.playerName + " with a " + winnerCard.getCardName());
        }
        
    }
};

let game = new Game(4);
game.addPlayer(new SimpleAIPlayer(game, 0, "Frank"));
game.addPlayer(new SimpleAIPlayer(game, 1, "Bob"));
game.addPlayer(new SimpleAIPlayer(game, 2, "Malice"));
game.addPlayer(new SimpleAIPlayer(game, 3, "Angreta"));
game.start();