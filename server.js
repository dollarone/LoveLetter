"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var ws_1 = require("ws");
var ws_2 = __importDefault(require("ws"));
var game_1 = require("./game");
var simpleAIplayer_1 = require("./simpleAIplayer");
var webSocketPlayer_1 = require("./webSocketPlayer");
var PORT = 8080;
var ROOT = __dirname;
// ── Static file server ────────────────────────────────────────────────────
var MIME = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
};
var httpServer = http_1.default.createServer(function (req, res) {
    var urlPath = req.url || '/';
    if (urlPath === '/')
        urlPath = '/client.html';
    var filePath = path_1.default.join(ROOT, urlPath);
    var ext = path_1.default.extname(filePath).toLowerCase();
    var mime = MIME[ext] || 'application/octet-stream';
    fs_1.default.readFile(filePath, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        }
        else {
            res.writeHead(200, { 'Content-Type': mime });
            res.end(data);
        }
    });
});
// ── WebSocket server ──────────────────────────────────────────────────────
var wss = new ws_1.WebSocketServer({ server: httpServer });
httpServer.listen(PORT, function () {
    console.log("Love Letter server running.");
    console.log("  Open http://localhost:".concat(PORT, " in your browser."));
});
function stripAnsi(s) {
    return s.replace(/\x1b\[[0-9;]*m/g, '');
}
wss.on('connection', function (ws) {
    console.log('Client connected');
    var wsPlayer = null;
    var gameRunning = false;
    function send(msg) {
        if (ws.readyState === ws_2.default.OPEN) {
            ws.send(JSON.stringify(msg));
        }
    }
    function startGame() {
        return __awaiter(this, void 0, void 0, function () {
            var game, bob, malice, angreta, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (gameRunning)
                            return [2 /*return*/];
                        gameRunning = true;
                        game = new game_1.Game(4, function (msg) {
                            console.log(msg);
                            send({ type: 'log', message: stripAnsi(msg) });
                        });
                        wsPlayer = new webSocketPlayer_1.WebSocketPlayer(game, 0, 'You', ws);
                        bob = new simpleAIplayer_1.SimpleAIPlayer(game, 1, 'Bob');
                        malice = new simpleAIplayer_1.SimpleAIPlayer(game, 2, 'Malice');
                        angreta = new simpleAIplayer_1.SimpleAIPlayer(game, 3, 'Angreta');
                        game.addPlayer(wsPlayer);
                        game.addPlayer(bob);
                        game.addPlayer(malice);
                        game.addPlayer(angreta);
                        game.setOnAction(function () {
                            send({
                                type: 'stateUpdate',
                                players: game.getAllPlayers(),
                                deckSize: game.getDeckSize()
                            });
                        });
                        game.setOnTurnStart(function (playerId) {
                            send({ type: 'turnStart', playerId: playerId });
                        });
                        send({
                            type: 'gameStarted',
                            selfId: 0,
                            players: ['You', 'Bob', 'Malice', 'Angreta']
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, game.start()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Game error:', err_1);
                        return [3 /*break*/, 4];
                    case 4:
                        wsPlayer = null;
                        gameRunning = false;
                        send({ type: 'gameOver' });
                        return [2 /*return*/];
                }
            });
        });
    }
    ws.on('message', function (data) {
        var _a, _b;
        var msg;
        try {
            msg = JSON.parse(data.toString());
        }
        catch (_c) {
            console.warn('Non-JSON message received');
            return;
        }
        if (msg.type === 'createGame') {
            startGame();
        }
        else if (msg.type === 'move' && wsPlayer) {
            wsPlayer.receiveMove({
                cardValue: msg.cardValue,
                target: (_a = msg.target) !== null && _a !== void 0 ? _a : -1,
                guess: (_b = msg.guess) !== null && _b !== void 0 ? _b : 0
            });
        }
    });
    ws.on('close', function () {
        console.log('Client disconnected');
        wsPlayer = null;
        gameRunning = false;
    });
    ws.on('error', function (err) { return console.error('WS error:', err.message); });
});
//# sourceMappingURL=server.js.map