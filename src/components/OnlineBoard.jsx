import React, { useState, useEffect } from "react";

export default function OnlineBoard({ ws, playerSymbol, roomCode, isMyTurn, onGameEnd }) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState(isMyTurn ? playerSymbol : playerSymbol === "X" ? "O" : "X");
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchOffered, setRematchOffered] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("Board received:", data);

        if (data.type === "move") {
          const { index, symbol } = data.move;
          setSquares((prev) => {
            if (prev[index]) return prev;
            const newSquares = prev.slice();
            newSquares[index] = symbol;
            return newSquares;
          });
          setTurn(symbol === "X" ? "O" : "X");
        }

        if (data.type === "player-left") {
          setOpponentLeft(true);
        }

        if (data.type === "rematch-request") {
          console.log("Received rematch request from opponent");
          setRematchOffered(true);
        }

        if (data.type === "rematch-accepted") {
          console.log("Rematch accepted by opponent");
          resetBoard();
          setRematchOffered(false);
          setRematchRequested(false);
          setGameEnded(false);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

    const handleClose = () => {
      console.log("WebSocket closed in board");
      setConnectionLost(true);
    };

    const handleError = () => {
      console.error("WebSocket error in board");
      setConnectionLost(true);
    };

    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", handleClose);
    ws.addEventListener("error", handleError);

    return () => {
      ws.removeEventListener("message", handleMessage);
      ws.removeEventListener("close", handleClose);
      ws.removeEventListener("error", handleError);
    };
  }, [ws]);

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

  const handleClick = (index) => {
    if (winner || draw || squares[index] || turn !== playerSymbol || connectionLost || opponentLeft) return;
    
    try {
      const newSquares = squares.slice();
      newSquares[index] = playerSymbol;
      setSquares(newSquares);
      setTurn(playerSymbol === "X" ? "O" : "X");
      
      ws.send(JSON.stringify({ 
        type: "move", 
        move: { index, symbol: playerSymbol } 
      }));
    } catch (error) {
      console.error("Error sending move:", error);
      setConnectionLost(true);
    }
  };

  const requestRematch = () => {
    if (!ws || connectionLost || opponentLeft) return;
    
    try {
      console.log("Sending rematch request to opponent");
      ws.send(JSON.stringify({ type: "rematch-request" }));
      setRematchRequested(true);
    } catch (error) {
      console.error("Error requesting rematch:", error);
    }
  };

  const acceptRematch = () => {
    if (!ws || connectionLost || opponentLeft) return;
    
    try {
      console.log("Accepting rematch request");
      ws.send(JSON.stringify({ type: "rematch-accepted" }));
      resetBoard();
      setRematchOffered(false);
      setGameEnded(false);
    } catch (error) {
      console.error("Error accepting rematch:", error);
    }
  };

  const resetBoard = () => {
    setSquares(Array(9).fill(null));
    setWinner(null);
    setDraw(false);
    setTurn(isMyTurn ? playerSymbol : playerSymbol === "X" ? "O" : "X");
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl mb-2">Room: <span className="font-mono">{roomCode}</span></h2>
      
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
              ${turn === playerSymbol && !winner && !draw && !connectionLost && !opponentLeft ? "hover:bg-[#223845] cursor-pointer" : "cursor-not-allowed"}
            `}
            onClick={() => handleClick(i)}
            disabled={winner || draw || squares[i] || turn !== playerSymbol || connectionLost || opponentLeft}
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
          <span className={turn === playerSymbol ? "text-green-400" : "text-slate-400"}>
            {turn === playerSymbol ? "Your turn" : "Opponent's turn"}
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