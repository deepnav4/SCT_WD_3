import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
    credentials: true
  }
});

const rooms = {}; // { roomCode: [player1Socket, player2Socket] }

function makeRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('create', () => {
    const code = makeRoomCode();
    rooms[code] = [socket.id];
    socket.join(code);
    socket.roomCode = code;
    socket.emit('room-created', { code });
    console.log(`Room created: ${code}`);
  });

  socket.on('join', ({ code }) => {
    if (rooms[code] && rooms[code].length === 1) {
      rooms[code].push(socket.id);
      socket.join(code);
      socket.roomCode = code;
      io.to(code).emit('start', { code });
      console.log(`Player joined room: ${code}`);
    } else {
      socket.emit('error', { message: 'Room not found or full' });
      console.log(`Failed to join room: ${code}`);
    }
  });

  socket.on('move', ({ move }) => {
    const code = socket.roomCode;
    if (rooms[code]) {
      console.log(`Move in room ${code}: square ${move.index}`);
      socket.to(code).emit('move', { move });
    }
  });

  socket.on('rematch-request', () => {
    const code = socket.roomCode;
    if (rooms[code]) {
      socket.to(code).emit('rematch-request');
      console.log(`Rematch requested in room ${code}`);
    }
  });

  socket.on('rematch-accepted', () => {
    const code = socket.roomCode;
    if (rooms[code]) {
      io.to(code).emit('rematch-accepted');
      console.log(`Rematch accepted in room ${code}`);
    }
  });

  socket.on('disconnect', () => {
    const code = socket.roomCode;
    if (rooms[code]) {
      rooms[code] = rooms[code].filter(id => id !== socket.id);
      console.log(`Player left room: ${code}, remaining players: ${rooms[code].length}`);
      
      if (rooms[code].length === 0) {
        delete rooms[code];
        console.log(`Room closed: ${code}`);
      } else {
        socket.to(code).emit('player-left', { message: 'Other player left the game' });
      }
    }
    console.log('Client disconnected');
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}`);
}); 