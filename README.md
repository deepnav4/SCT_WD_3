# Tic-Tac-Toe Online Game

A multiplayer online Tic-Tac-Toe game with Socket.io for real-time gameplay.

## Running the Project

### Local Development

Run both the frontend and backend servers with a single command:

```bash
npm run start
```

This will start:
- The Vite development server for the frontend (React) on port 5173
- The Socket.io server for WebSockets on port 3001

### Individual Commands

If needed, you can run the servers separately:

```bash
# Frontend only (Vite)
npm run dev

# Backend only (Socket.io)
npm run dev-server
```

## Game Rules

1. Create a room to start a game as X
2. Share the room code with a friend
3. The friend joins the room and plays as O
4. X always goes first
5. The first player to get 3 in a row wins

## Deployment

The project is configured for deployment on Vercel. Push to your GitHub repository and connect it to Vercel for automatic deployment.
