import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to server');

  ws.send('Hello, server!');
});

ws.on('message', (message: string) => {
  console.log(`Received message from server: ${message}`);
});

ws.on('close', () => {
  console.log('Disconnected from server');
});

function createGame() {
  const event = {type: "createGame", playerCount: 4};

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