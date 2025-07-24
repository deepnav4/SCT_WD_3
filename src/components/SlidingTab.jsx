import React from "react";

const SlidingTab = ({ playerChoice, setPlayerChoice }) => {
  const toggleChoice = () => {
    setPlayerChoice((prevChoice) => (prevChoice === "X" ? "O" : "X"));
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-slate-300 mb-2 text-center">Choose Your Symbol</h3>
      <div
        className="bg-slate-800 rounded-lg p-2 flex items-center justify-between relative cursor-pointer"
        onClick={toggleChoice}
      >
        <div
          className={`absolute w-1/2 h-10 bg-cyan-600 rounded-md transition-all duration-300 ease-in-out ${
            playerChoice === "X" ? "left-1" : "left-[calc(50%-4px)]"
          }`}
        ></div>
        
        <div className="flex-1 flex justify-center items-center h-10 z-10">
          <span className={`text-xl font-bold transition-colors ${
            playerChoice === "X" ? "text-white" : "text-slate-400"
          }`}>
            X
          </span>
        </div>
        
        <div className="flex-1 flex justify-center items-center h-10 z-10">
          <span className={`text-xl font-bold transition-colors ${
            playerChoice === "O" ? "text-white" : "text-slate-400"
          }`}>
            O
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        {playerChoice === "X" ? "X goes first" : "O goes first"}
      </p>
    </div>
  );
};

export default SlidingTab;