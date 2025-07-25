# Tic-Tac-Toe Online Game

A modern, real-time, online Tic-Tac-Toe game built with React, Vite, Tailwind CSS, and Socket.io. Play with a friend anywhere in the world!

## ✨ Features

- **Online Multiplayer:** Play Tic-Tac-Toe with a friend over the internet.
- **Real-Time Gameplay:** Moves are synced instantly using Socket.io.
- **Room Code System:** Create a room and share the code for your friend to join.
- **Rematch Support:** Request and accept rematches without leaving the room.
- **Responsive Design:** Looks great on desktop and mobile devices.
- **Status Messages:** Clear feedback for connection, turns, wins, draws, and rematches.
- **Vercel Deployment Ready:** Easily deploy to Vercel with included configuration.
- **Modern Stack:** Built with React 19, Vite, Tailwind CSS, and Node.js (Socket.io backend).

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm

### Installation
1. Clone the repo:
   ```sh
   git clone https://github.com/deepnav4/SCT_WD_3
   cd SCT_WD_3
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Local Development
Run both the frontend and backend servers with a single command:
```sh
npm run start
```
- Frontend: http://localhost:5173
- Backend (Socket.io): ws://localhost:3001

### Build for Production
```sh
npm run build
```
The production build will be in the `dist/` directory.

## 🕹️ How to Play
1. Click **Create Room** to get a room code (you play as X).
2. Share the code with a friend.
3. Your friend enters the code and joins as O.
4. Play alternately; X always goes first.
5. Win by getting three in a row, or request a rematch after a game ends!

## 🌐 Deployment (Vercel)
- The project is ready for Vercel. Connect your repo and set:
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
- The backend Socket.io server is set up as a Vercel serverless function (`/api/socket.js`).

## 📁 Project Structure
- `src/` - React components and main app logic
- `api/socket.js` - Socket.io server for online play (Vercel serverless function)
- `dev-server.js` - Local Socket.io server for development
- `public/` - Static assets
- `dist/` - Production build output

## 📝 License
MIT
