"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var ws = new ws_1.default('ws://localhost:8080');
ws.on('open', function () {
    console.log('Connected to server');
    ws.send('Hello, server!');
});
ws.on('message', function (message) {
    console.log("Received message from server: ".concat(message));
});
ws.on('close', function () {
    console.log('Disconnected from server');
});
function createGame() {
    var event = { type: "createGame", playerCount: 4 };
    ws.send(JSON.stringify(event));
    console.log('createGame sent');
}
function startGame() {
    ws.send('startGame');
    console.log('startGame sent');
}
function playCardOne() {
    ws.send('playCardOne');
    console.log('playCardOne sent');
}
function playCardTwo() {
    ws.send('playCardTwo');
    console.log('playCardTwo sent');
}
//# sourceMappingURL=client.js.map