import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

const rooms = {}; // { roomCode: [player1Socket, player2Socket] }

function makeRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'create') {
      const code = makeRoomCode();
      rooms[code] = [ws];
      ws.send(JSON.stringify({ type: 'room-created', code }));
      ws.roomCode = code;
    }

    if (data.type === 'join') {
      const code = data.code;
      if (rooms[code] && rooms[code].length === 1) {
        rooms[code].push(ws);
        ws.roomCode = code;
        rooms[code].forEach(s => s.send(JSON.stringify({ type: 'start', code })));
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found or full' }));
      }
    }

    if (data.type === 'move') {
      const code = ws.roomCode;
      if (rooms[code]) {
        rooms[code].forEach(s => {
          if (s !== ws) s.send(JSON.stringify({ type: 'move', move: data.move }));
        });
      }
    }
  });

  ws.on('close', () => {
    const code = ws.roomCode;
    if (rooms[code]) {
      rooms[code] = rooms[code].filter(s => s !== ws);
      if (rooms[code].length === 0) delete rooms[code];
    }
  });
});

console.log('WebSocket server running on ws://localhost:3001');