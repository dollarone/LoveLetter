import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import { Game } from './game';
import { SimpleAIPlayer } from './simpleAIplayer';
import { WebSocketPlayer, ClientMove } from './webSocketPlayer';

const PORT = 8080;
const ROOT = __dirname;

// ── Static file server ────────────────────────────────────────────────────
const MIME: Record<string, string> = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
};

const httpServer = http.createServer((req, res) => {
    let urlPath = req.url || '/';
    if (urlPath === '/') urlPath = '/client.html';

    const filePath = path.join(ROOT, urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': mime });
            res.end(data);
        }
    });
});

// ── WebSocket server ──────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

httpServer.listen(PORT, () => {
    console.log(`Love Letter server running.`);
    console.log(`  Open http://localhost:${PORT} in your browser.`);
});

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
            const yourCard = wsPlayer && wsPlayer.cardOne
                ? { name: wsPlayer.cardOne.getCardName(), value: wsPlayer.cardOne.getCardValue() }
                : null;
            send({
                type: 'stateUpdate',
                players: game.getAllPlayers(),
                deckSize: game.getDeckSize(),
                leftoverCard: game.getLeftoverCard(),
                yourCard
            });
        });

        game.setOnTurnStart((playerId: number) => {
            send({ type: 'turnStart', playerId });
        });

        game.setOnAIPlanning((playerId: number, cardValue: number, targetId: number, guess: number) => {
            send({ type: 'aiPlaying', playerId, cardValue, targetId, guess });
        });

        game.setOnPriestReveal((targetId: number, card: { name: string, value: number }) => {
            send({ type: 'priestReveal', targetId, card });
        });

        game.setOnBaronReveal((attackerId: number, attackerCard: { name: string, value: number }, targetId: number, targetCard: { name: string, value: number }) => {
            send({ type: 'baronReveal', attackerId, attackerCard, targetId, targetCard });
        });

        game.setOnShowdown((reveals: Array<{ playerId: number, card: { name: string, value: number } }>) => {
            send({ type: 'showdown', reveals });
        });

        send({
            type: 'gameStarted',
            selfId: 0,
            players: ['You', 'Bob', 'Malice', 'Angreta'],
            leftoverCard: game.getLeftoverCard()
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
        try { msg = JSON.parse(data.toString()); }
        catch { console.warn('Non-JSON message received'); return; }

        if (msg.type === 'createGame') {
            startGame();
        } else if (msg.type === 'move' && wsPlayer) {
            wsPlayer.receiveMove({
                cardValue: msg.cardValue,
                target:    msg.target   ?? -1,
                guess:     msg.guess    ?? 0
            } as ClientMove);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        wsPlayer = null;
        gameRunning = false;
    });

    ws.on('error', (err) => console.error('WS error:', err.message));
});
