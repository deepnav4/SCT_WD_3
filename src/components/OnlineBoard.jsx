import React, { useState, useEffect, useCallback } from "react";

export default function OnlineBoard({ socket, playerSymbol, roomCode, isMyTurn, onGameEnd }) {
  // X always goes first
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X"); 
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchOffered, setRematchOffered] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const moveHandler = (data) => {
      console.log("Board received move:", data);
      const { index, symbol } = data.move;
      
      setSquares((prev) => {
        if (prev[index]) return prev;
        const newSquares = prev.slice();
        newSquares[index] = symbol;
        return newSquares;
      });
      
      // After opponent's move, it's my turn
      setTurn(symbol === "X" ? "O" : "X");
    };

    const playerLeftHandler = () => {
      console.log("Opponent left the game");
      setOpponentLeft(true);
    };

    const rematchRequestHandler = () => {
      console.log("Received rematch request from opponent");
      setRematchOffered(true);
    };

    const rematchAcceptedHandler = () => {
      console.log("Rematch accepted by opponent");
      resetBoard();
      setRematchOffered(false);
      setRematchRequested(false);
      setGameEnded(false);
    };

    const disconnectHandler = () => {
      console.log("Socket.io disconnected in board");
      setConnectionLost(true);
    };

    const errorHandler = () => {
      console.error("Socket.io connection error in board");
      setConnectionLost(true);
    };

    // Register event handlers
    socket.on("move", moveHandler);
    socket.on("player-left", playerLeftHandler);
    socket.on("rematch-request", rematchRequestHandler);
    socket.on("rematch-accepted", rematchAcceptedHandler);
    socket.on("disconnect", disconnectHandler);
    socket.on("connect_error", errorHandler);

    // Clean up on unmount
    return () => {
      socket.off("move", moveHandler);
      socket.off("player-left", playerLeftHandler);
      socket.off("rematch-request", rematchRequestHandler);
      socket.off("rematch-accepted", rematchAcceptedHandler);
      socket.off("disconnect", disconnectHandler);
      socket.off("connect_error", errorHandler);
    };
  }, [socket]);

  useEffect(() => {
    const result = calculateWinner(squares);
    if (result.winner) {
      setWinner(result.winner);
      setGameEnded(true);
      onGameEnd && onGameEnd(result.winner);
    } else if (isDraw(squares)) {
      setDraw(true);
      setGameEnded(true);
      onGameEnd && onGameEnd(null);
    }
  }, [squares, onGameEnd]);

  const handleClick = useCallback((index) => {
    // Check if it's player's turn
    const isMyTurnNow = turn === playerSymbol;
    
    if (winner || draw || squares[index] || !isMyTurnNow || connectionLost || opponentLeft) return;
    
    try {
      console.log(`Making move in square ${index}`);
      const newSquares = squares.slice();
      newSquares[index] = playerSymbol;
      setSquares(newSquares);
      
      // After my move, it's opponent's turn
      setTurn(playerSymbol === "X" ? "X" : "O");
      
      socket.emit("move", { 
        move: { index, symbol: playerSymbol } 
      });
    } catch (error) {
      console.error("Error sending move:", error);
      setConnectionLost(true);
    }
  }, [winner, draw, squares, turn, playerSymbol, connectionLost, opponentLeft, socket]);

  const requestRematch = useCallback(() => {
    if (!socket || connectionLost || opponentLeft) return;
    
    try {
      console.log("Sending rematch request to opponent");
      socket.emit("rematch-request");
      setRematchRequested(true);
    } catch (error) {
      console.error("Error requesting rematch:", error);
    }
  }, [socket, connectionLost, opponentLeft]);

  const acceptRematch = useCallback(() => {
    if (!socket || connectionLost || opponentLeft) return;
    
    try {
      console.log("Accepting rematch request");
      socket.emit("rematch-accepted");
      resetBoard();
      setRematchOffered(false);
      setGameEnded(false);
    } catch (error) {
      console.error("Error accepting rematch:", error);
    }
  }, [socket, connectionLost, opponentLeft]);

  const resetBoard = () => {
    setSquares(Array(9).fill(null));
    setWinner(null);
    setDraw(false);
    setTurn("X"); // X always starts in a new game
  };

  // Determine if it's my turn
  const isMyTurnNow = turn === playerSymbol;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl mb-2">Room: <span className="font-mono">{roomCode}</span></h2>
      <div className="text-md mb-2">
        You are playing as <span className={playerSymbol === "X" ? "text-teal-400 font-bold" : "text-amber-400 font-bold"}>{playerSymbol}</span>
      </div>
      
      {connectionLost && (
        <div className="bg-red-500/20 text-red-300 p-2 rounded mb-4 w-full text-center">
          Connection lost. Please rejoin the game.
        </div>
      )}
      
      {opponentLeft && !connectionLost && (
        <div className="bg-yellow-500/20 text-yellow-300 p-2 rounded mb-4 w-full text-center">
          Your opponent left the game.
        </div>
      )}
      
      {rematchOffered && (
        <div className="bg-green-500/20 text-green-300 p-2 rounded mb-4 w-full text-center flex flex-col items-center">
          <p className="mb-2">Your opponent has requested a rematch!</p>
          <button 
            className="btn-primary px-4 py-2 rounded-md"
            onClick={acceptRematch}
          >
            Accept Rematch
          </button>
        </div>
      )}
      
      {rematchRequested && !rematchOffered && (
        <div className="bg-blue-500/20 text-blue-300 p-2 rounded mb-4 w-full text-center">
          Rematch request sent. Waiting for opponent...
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3 mt-3">
        {Array(9).fill(null).map((_, i) => (
          <button
            key={i}
            className={`w-24 h-24 flex items-center bg-[#1F3641] font-['Poppins'] 
              ${squares[i]==="X" ? "text-teal-400" : squares[i]==="O" ? "text-amber-400" : "text-transparent"} 
              rounded-md border border-gray-400 justify-center text-4xl font-bold
              ${isMyTurnNow && !winner && !draw && !connectionLost && !opponentLeft ? "hover:bg-[#223845] cursor-pointer" : "cursor-not-allowed"}
            `}
            onClick={() => handleClick(i)}
            disabled={winner || draw || squares[i] || !isMyTurnNow || connectionLost || opponentLeft}
          >
            {squares[i] || " "}
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-lg">
        {winner ? (
          <span className={winner === playerSymbol ? "text-green-400" : "text-red-400"}>
            {winner === playerSymbol ? "You win!" : "Opponent wins!"}
          </span>
        ) : draw ? (
          <span className="text-blue-400">Draw!</span>
        ) : connectionLost ? (
          <span className="text-red-400">Game interrupted</span>
        ) : opponentLeft ? (
          <span className="text-yellow-400">Opponent left</span>
        ) : (
          <span className={isMyTurnNow ? "text-green-400" : "text-slate-400"}>
            {isMyTurnNow ? "Your turn" : "Opponent's turn"}
          </span>
        )}
      </div>
      
      {gameEnded && !connectionLost && !opponentLeft && !rematchRequested && !rematchOffered && (
        <button 
          className="btn-primary mt-4 px-6 py-2 rounded-md"
          onClick={requestRematch}
        >
          Request Rematch
        </button>
      )}
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

function isDraw(squares) {
  return squares.every((square) => square !== null) && !calculateWinner(squares).winner;
} 