import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import OnlineBoard from "./OnlineBoard";

// Get socket.io URL based on environment
const socketUrl = import.meta.env.PROD 
  ? "" // Empty string will connect to the same host
  : "http://localhost:3001";

export default function Online({ onBackToHome }) {
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Connect to Socket.io server
  useEffect(() => {
    const newSocket = io(socketUrl, {
      path: import.meta.env.PROD ? "/api/socket" : "",
      transports: ["websocket"],
    });
    
    newSocket.on("connect", () => {
      console.log("Socket.io connected");
      setStatus("Connected to server");
      setConnectionError(false);
    });
    
    newSocket.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
      setStatus("Connection error. Please try again.");
      setConnectionError(true);
    });
    
    newSocket.on("disconnect", () => {
      console.log("Socket.io disconnected");
      if (gameStarted) {
        setStatus("Connection lost. The other player may have left.");
      }
    });

    // Set up event handlers that should be present for the lifetime of the component
    newSocket.on("room-created", (data) => {
      console.log("Room created:", data);
      setRoomCode(data.code);
      setStatus("Waiting for friend to join...");
      setIsCreator(true);
      setPlayerSymbol("X"); // Creator is X
      setIsJoining(false);
    });
    
    newSocket.on("start", (data) => {
      console.log("Game starting:", data);
      setRoomCode(data.code);
      setGameStarted(true);
      setPlayerSymbol(prev => prev === "X" ? "X" : "O");
      setStatus(prev => prev === "Waiting for friend to join..." ? "Friend joined! Game starting..." : "Joined! Game starting...");
    });
    
    newSocket.on("player-left", () => {
      setStatus("Other player left the game");
    });
    
    newSocket.on("error", (data) => {
      setStatus(`Error: ${data.message}`);
    });
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []); // Only run once on component mount

  const createRoom = useCallback(() => {
    if (!socket || socket.disconnected) {
      setConnectionError(true);
      setStatus("Not connected to server");
      return;
    }
    
    console.log("Creating room...");
    setConnectionError(false);
    setIsJoining(false); // Not joining, creating
    socket.emit("create");
  }, [socket]);

  const joinRoom = useCallback(() => {
    if (!inputCode.trim()) {
      setStatus("Please enter a room code");
      return;
    }
    
    if (!socket || socket.disconnected) {
      setConnectionError(true);
      setStatus("Not connected to server");
      return;
    }
    
    console.log("Joining room:", inputCode);
    setConnectionError(false);
    setIsJoining(true); // We are joining
    socket.emit("join", { code: inputCode.trim() });
  }, [socket, inputCode]);

  const resetGame = useCallback(() => {
    if (socket) {
      socket.connect();
    }
    
    setRoomCode("");
    setInputCode("");
    setStatus("");
    setIsCreator(false);
    setGameStarted(false);
    setPlayerSymbol("");
    setConnectionError(false);
    setIsJoining(false);
  }, [socket]);

  const handleBackToHome = useCallback(() => {
    resetGame();
    onBackToHome && onBackToHome();
  }, [resetGame, onBackToHome]);

  if (gameStarted && socket && playerSymbol) {
    return (
      <div className="flex flex-col items-center">
        <OnlineBoard
          socket={socket}
          playerSymbol={playerSymbol}
          roomCode={roomCode}
          isMyTurn={playerSymbol === "X"}
          onGameEnd={() => {
            // Optional: Handle game end
          }}
        />
        <div className="flex space-x-4 mt-4">
          <button 
            className="btn-secondary" 
            onClick={resetGame}
          >
            New Game
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button 
        className="btn-primary w-full" 
        onClick={createRoom}
        disabled={connectionError}
      >
        Create Room
      </button>
      
      <div className="flex w-full space-x-2">
        <input
          className="w-full px-4 py-2 rounded border border-slate-700 bg-slate-900 text-white"
          value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase())}
          placeholder="Enter Room Code"
          disabled={connectionError}
        />
        <button 
          className="btn-secondary" 
          onClick={joinRoom}
          disabled={connectionError}
        >
          Join Room
        </button>
      </div>
      
      {roomCode && (
        <div className="mt-2">
          Room Code: <span className="font-mono">{roomCode}</span>
          <button
            className="ml-2 btn-secondary"
            onClick={() => navigator.clipboard.writeText(roomCode)}
          >
            Copy
          </button>
        </div>
      )}
      
      <div className={`mt-2 ${connectionError ? "text-red-400" : "text-slate-400"}`}>
        {status}
      </div>
      
      {connectionError && (
        <button 
          className="btn-primary" 
          onClick={resetGame}
        >
          Retry Connection
        </button>
      )}
      
      <button 
        className="btn-secondary mt-4" 
        onClick={handleBackToHome}
      >
        Back to Home
      </button>
    </div>
  );
}