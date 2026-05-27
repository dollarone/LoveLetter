import WebSocket, { WebSocketServer } from 'ws';
import { Game } from './game';
import { SimpleAIPlayer } from './simpleAIplayer';
import { WebSocketPlayer, ClientMove } from './webSocketPlayer';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`Love Letter server listening on ws://localhost:${PORT}`);

function stripAnsi(s: string): string {
    return s.replace(/\x1b\[[0-9;]*m/g, '');
}

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    let wsPlayer: WebSocketPlayer | null = null;
    let gameRunning = false;

    function send(msg: object) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg));
        }
    }

    async function startGame() {
        if (gameRunning) return;
        gameRunning = true;

        const game = new Game(4, (msg: string) => {
            console.log(msg);
            send({ type: 'log', message: stripAnsi(msg) });
        });

        wsPlayer = new WebSocketPlayer(game, 0, 'You', ws);
        const bob     = new SimpleAIPlayer(game, 1, 'Bob');
        const malice  = new SimpleAIPlayer(game, 2, 'Malice');
        const angreta = new SimpleAIPlayer(game, 3, 'Angreta');

        game.addPlayer(wsPlayer);
        game.addPlayer(bob);
        game.addPlayer(malice);
        game.addPlayer(angreta);

        game.setOnAction(() => {
            send({
                type: 'stateUpdate',
                players: game.getAllPlayers(),
                deckSize: game.getDeckSize()
            });
        });

        send({
            type: 'gameStarted',
            selfId: 0,
            players: ['You', 'Bob', 'Malice', 'Angreta']
        });

        try {
            await game.start();
        } catch (err) {
            console.error('Game error:', err);
        }

        wsPlayer = null;
        gameRunning = false;
        send({ type: 'gameOver' });
    }

    ws.on('message', (data: Buffer) => {
        let msg: any;
        try {
            msg = JSON.parse(data.toString());
        } catch {
            console.warn('Received non-JSON message');
            return;
        }

        if (msg.type === 'createGame') {
            startGame();
        } else if (msg.type === 'move' && wsPlayer) {
            const move: ClientMove = {
                cardValue: msg.cardValue,
                target:    msg.target   ?? -1,
                guess:     msg.guess    ?? 0
            };
            wsPlayer.receiveMove(move);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        wsPlayer = null;
        gameRunning = false;
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
    });
});
