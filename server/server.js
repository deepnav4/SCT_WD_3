import { WebSocketServer } from 'ws';

// Check if running on Vercel
const isProduction = process.env.VERCEL === '1';

// Create WebSocket server with appropriate configuration
const wss = isProduction 
  ? new WebSocketServer({ 
      noServer: true, // Important for serverless environment
      path: '/socket'
    })
  : new WebSocketServer({ port: 3001 });

const rooms = {}; // { roomCode: [player1Socket, player2Socket] }

function makeRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      if (data.type === 'create') {
        const code = makeRoomCode();
        rooms[code] = [ws];
        ws.roomCode = code;
        ws.send(JSON.stringify({ type: 'room-created', code }));
        console.log(`Room created: ${code}`);
      }

      if (data.type === 'join') {
        const code = data.code;
        if (rooms[code] && rooms[code].length === 1) {
          rooms[code].push(ws);
          ws.roomCode = code;
          rooms[code].forEach(socket => 
            socket.send(JSON.stringify({ type: 'start', code }))
          );
          console.log(`Player joined room: ${code}`);
        } else {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Room not found or full' 
          }));
          console.log(`Failed to join room: ${code}`);
        }
      }

      if (data.type === 'move') {
        const code = ws.roomCode;
        if (rooms[code]) {
          rooms[code].forEach(socket => {
            if (socket !== ws) {
              socket.send(JSON.stringify({ 
                type: 'move', 
                move: data.move 
              }));
            }
          });
          console.log(`Move in room ${code}: ${JSON.stringify(data.move)}`);
        }
      }

      if (data.type === 'rematch-request') {
        const code = ws.roomCode;
        if (rooms[code]) {
          console.log(`Player in room ${code} requested a rematch`);
          
          // Find the opponent and send them the rematch request
          const opponent = rooms[code].find(socket => socket !== ws);
          if (opponent) {
            console.log(`Sending rematch request to opponent in room ${code}`);
            opponent.send(JSON.stringify({ type: 'rematch-request' }));
          } else {
            console.log(`No opponent found in room ${code} to send rematch request`);
          }
        } else {
          console.log(`Rematch request failed - room ${code} not found`);
        }
      }

      if (data.type === 'rematch-accepted') {
        const code = ws.roomCode;
        if (rooms[code]) {
          console.log(`Rematch accepted in room ${code}`);
          
          // Notify both players that rematch is accepted
          rooms[code].forEach(socket => {
            console.log(`Sending rematch-accepted to player in room ${code}`);
            socket.send(JSON.stringify({ type: 'rematch-accepted' }));
          });
        } else {
          console.log(`Rematch acceptance failed - room ${code} not found`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    const code = ws.roomCode;
    if (rooms[code]) {
      rooms[code] = rooms[code].filter(socket => socket !== ws);
      console.log(`Player left room: ${code}, remaining players: ${rooms[code].length}`);
      
      if (rooms[code].length === 0) {
        delete rooms[code];
        console.log(`Room closed: ${code}`);
      } else {
        // Notify remaining player
        rooms[code].forEach(socket => {
          console.log(`Notifying remaining player in room ${code} that opponent left`);
          socket.send(JSON.stringify({ 
            type: 'player-left', 
            message: 'Other player left the game' 
          }));
        });
      }
    }
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:3001'); 