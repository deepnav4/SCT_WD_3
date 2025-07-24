import React, { useState } from "react";
import SlidingTab from "./SlidingTab";
import Online from "./Online";

const Home = ({
  onStart,
  handlePlayerChoiceChange,
  playerChoice,
  setPlayerChoice,
}) => {
  const [mode, setMode] = useState(null);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player1Error, setPlayer1Error] = useState("");
  const [player2Error, setPlayer2Error] = useState("");

  const validateInputs = () => {
    let isValid = true;
    if (!player1) {
      setPlayer1Error("Player 1 name is required");
      isValid = false;
    } else {
      setPlayer1Error("");
    }
    if (mode === "player" && !player2) {
      setPlayer2Error("Player 2 name is required");
      isValid = false;
    } else {
      setPlayer2Error("");
    }
    return isValid;
  };

  const handleStartGame = () => {
    if (validateInputs()) {
      if (mode === "computer") {
        onStart(player1, "Computer", "normal");
      } else if (mode === "player") {
        onStart(player1, player2, "normal");
      }
    }
  };

  const handleOnlineMode = () => {
    // For online mode, we just need a player name and then start the game
    if (player1) {
      setPlayer1Error("");
      onStart(player1, "Online Opponent", "online");
    } else {
      setPlayer1Error("Your name is required to play online");
    }
  };

  return (
    <div className="w-full max-w-md px-4 py-8 mx-auto">
      <div className="flex flex-col items-center space-y-8">
        {/* Game Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white mb-2">
            Tic <span className="text-game-primary">Tac</span> Toe
          </h1>
          <p className="text-slate-400">Challenge yourself or a friend</p>
        </div>

        {/* Game Mode Selection */}
        {!mode && (
          <div className="flex flex-col w-full space-y-4 mt-8">
            <h2 className="text-xl text-white font-medium text-center mb-2">Choose Game Mode</h2>
            <button
              className="btn-primary w-full py-3 text-lg font-medium rounded-lg shadow-lg"
              onClick={() => setMode("computer")}
            >
              Play vs Computer
            </button>
            <button
              className="btn-secondary w-full py-3 text-lg font-medium rounded-lg shadow-lg"
              onClick={() => setMode("player")}
            >
              Play vs Friend
            </button>
            <button
              className="btn-secondary w-full py-3 text-lg font-medium rounded-lg shadow-lg"
              onClick={() => setMode("online")}
            >
              Play Online
            </button>
          </div>
        )}

        {/* Player Setup for Normal Modes */}
        {(mode === "computer" || mode === "player") && (
          <div className="flex flex-col space-y-6 w-full bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl text-white font-medium text-center">
              {mode === "computer" ? "Play vs Computer" : "Play vs Friend"}
            </h2>
            
            <SlidingTab
              playerChoice={playerChoice}
              setPlayerChoice={setPlayerChoice}
            />
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Player 1 Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 bg-slate-900 border ${
                    player1Error ? "border-red-500" : "border-slate-700"
                  } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                />
                {player1Error && (
                  <p className="mt-1 text-sm text-red-500">{player1Error}</p>
                )}
              </div>
              
              {mode === "player" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Player 2 Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter opponent's name"
                    className={`w-full px-4 py-3 bg-slate-900 border ${
                      player2Error ? "border-red-500" : "border-slate-700"
                    } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                  />
                  {player2Error && (
                    <p className="mt-1 text-sm text-red-500">{player2Error}</p>
                  )}
                </div>
              )}
            </div>
            
            <button
              className="btn-primary w-full py-3 text-lg font-semibold rounded-lg shadow-lg mt-4"
              onClick={handleStartGame}
            >
              Start Game
            </button>
          </div>
        )}

        {/* Player Setup for Online Mode */}
        {mode === "online" && (
          <div className="flex flex-col space-y-6 w-full bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl text-white font-medium text-center">
              Play Online
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 bg-slate-900 border ${
                    player1Error ? "border-red-500" : "border-slate-700"
                  } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                />
                {player1Error && (
                  <p className="mt-1 text-sm text-red-500">{player1Error}</p>
                )}
              </div>
            </div>
            
            <button
              className="btn-primary w-full py-3 text-lg font-semibold rounded-lg shadow-lg mt-4"
              onClick={handleOnlineMode}
            >
              Continue to Online Play
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;