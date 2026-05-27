"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var game_1 = require("./game"); // Assuming you have a Game class in game.ts
var simpleAIplayer_1 = require("./simpleAIplayer");
var wss = new ws_1.default.Server({ port: 8080 });
var clients = [];
wss.on('connection', function (ws) {
    console.log('New client connected');
    clients.push(ws);
    console.log("Added client: " + ws.toString());
    console.log("Clients: " + clients.concat());
    console.log("Total clients: " + clients.length);
    ws.on('message', function (message) {
        console.log("Received message: ".concat(message));
        //wss.clients.forEach((client) => {
        //  client.send(`Server received your message: ${message}`);
        //});
        ws.send("Server received your message: ".concat(message));
        var event = JSON.parse(message);
        if (event.type === 'createGame') {
            console.log('createGame received');
            ws.send('createGame');
        }
        else if (event.type === 'startGame') {
            console.log('startGame received');
            ws.send('startGame');
        }
        else if (event.type === 'playCardOne') {
            console.log('playCardOne received');
            ws.send('playCardOne');
        }
        else if (event.type === 'playCardTwo') {
            console.log('playCardTwo received');
            ws.send('playCardTwo');
        }
        else if (event.type === 'drawCard') {
            console.log('drawCard received');
            ws.send('drawCard');
        }
    });
    ws.on('close', function () {
        console.log('Client disconnected');
        var index = clients.indexOf(ws, 0);
        if (index > -1) {
            clients.splice(index, 1);
        }
        console.log("Removed client: " + ws.toString());
        console.log("Clients: " + clients.concat());
        console.log("Total clients: " + clients.length);
    });
    function startNewGame() {
        console.log('Starting new game...');
        // Logic to start a new game
        var game = new game_1.Game();
        game.addPlayer(new simpleAIplayer_1.SimpleAIPlayer(game, 0));
        game.start();
    }
});
//# sourceMappingURL=server.js.map