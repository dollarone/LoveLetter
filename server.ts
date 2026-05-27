 
import WebSocket from 'ws';
import { Game } from './game'; // Assuming you have a Game class in game.ts
import { SimpleAIPlayer } from './simpleAIplayer';

const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');
  clients.push(ws);
  console.log("Added client: " + ws.toString());
  console.log("Clients: " + clients.concat());
  console.log("Total clients: " + clients.length);   

  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);
    //wss.clients.forEach((client) => {
    //  client.send(`Server received your message: ${message}`);
    //});
    ws.send(`Server received your message: ${message}`);
    const event = JSON.parse(message);
    if (event.type === 'createGame') {
      console.log('createGame received');
      ws.send('createGame');
    } else if (event.type === 'startGame') {
      console.log('startGame received');
      ws.send('startGame');
    } else if (event.type === 'playCardOne') {
      console.log('playCardOne received');
      ws.send('playCardOne');
    } else if (event.type === 'playCardTwo') {
      console.log('playCardTwo received');
      ws.send('playCardTwo');
    } else if (event.type === 'drawCard') {
      console.log('drawCard received');
      ws.send('drawCard');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
      
    const index = clients.indexOf(ws, 0);
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
    let game = new Game();
    game.addPlayer(new SimpleAIPlayer(game, 0));
    game.start();
  }
});