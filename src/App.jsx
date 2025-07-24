import React, { useState } from "react";
import Home from "./components/Home";
import Board from "./components/Board";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [playerChoice, setPlayerChoice] = useState("X");
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };
  const [gameStarted, setGameStarted] = useState(false);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const handlePlayerChoiceChange = (choice) => {
    setPlayerChoice(choice);
  };
  const handleStartGame = (player1, player2) => {
    setPlayer1(player1);
    setPlayer2(player2);
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen w-full bg-game-gradient font-['Poppins'] overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        {gameStarted ? (
          <Board
            player1={player1}
            player2={player2}
            handlePlayerChoiceChange={handlePlayerChoiceChange}
            playerChoice={playerChoice}
          />
        ) : (
          <Home
            onStart={handleStartGame}
            handlePlayerChoiceChange={handlePlayerChoiceChange}
            playerChoice={playerChoice}
            setPlayerChoice={setPlayerChoice}
          />
        )}
      </div>
    </div>
  );
};

export default App;