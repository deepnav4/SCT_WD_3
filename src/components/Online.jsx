import React, { useState, useEffect } from "react";
import OnlineBoard from "./OnlineBoard";

const wsUrl = "ws://localhost:3001";

export default function Online({ onBackToHome }) {
  const [ws, setWs] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [connectionError, setConnectionError] = useState(false);

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const connect = () => {
    try {
      setConnectionError(false);
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log("WebSocket connected");
        setStatus("Connected to server");
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus("Connection error. Please try again.");
        setConnectionError(true);
      };
      
      socket.onclose = () => {
        console.log("WebSocket closed");
        if (gameStarted) {
          setStatus("Connection lost. The other player may have left.");
        }
      };
      
      setWs(socket);
      return socket;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setStatus("Failed to connect to server");
      setConnectionError(true);
      return null;
    }
  };

  const createRoom = () => {
    const socket = connect();
    if (!socket) return;
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "create" }));
    };
    
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("Received:", data);
        
        if (data.type === "room-created") {
          setRoomCode(data.code);
          setStatus("Waiting for friend to join...");
          setIsCreator(true);
          setPlayerSymbol("X");
        }
        
        if (data.type === "start") {
          setStatus("Friend joined! Game starting...");
          setGameStarted(true);
        }
        
        if (data.type === "player-left") {
          setStatus("Other player left the game");
        }
        
        if (data.type === "error") {
          setStatus(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };
  };

  const joinRoom = () => {
    if (!inputCode.trim()) {
      setStatus("Please enter a room code");
      return;
    }
    
    const socket = connect();
    if (!socket) return;
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", code: inputCode.trim() }));
    };
    
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("Received:", data);
        
        if (data.type === "start") {
          setRoomCode(inputCode);
          setStatus("Joined! Game starting...");
          setPlayerSymbol("O");
          setGameStarted(true);
        }
        
        if (data.type === "player-left") {
          setStatus("Other player left the game");
        }
        
        if (data.type === "error") {
          setStatus(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };
  };

  const resetGame = () => {
    if (ws) ws.close();
    setWs(null);
    setRoomCode("");
    setInputCode("");
    setStatus("");
    setIsCreator(false);
    setGameStarted(false);
    setPlayerSymbol("");
    setConnectionError(false);
  };

  const handleBackToHome = () => {
    resetGame();
    onBackToHome && onBackToHome();
  };

  if (gameStarted && ws && playerSymbol) {
    return (
      <div className="flex flex-col items-center">
        <OnlineBoard
          ws={ws}
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