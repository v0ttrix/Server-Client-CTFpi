import React from "react";
import { Button } from "../components/Button";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-4 font-mono text-center">
      <div className="space-y-6 max-w-3xl">
        {/* Main Header */}
        <h1 className="text-5xl md:text-6xl font-bold text-green-500 tracking-widest uppercase mb-4">
          Capture The Flag
        </h1>

        {/* Sub Heading */}
        <p className="text-lg text-gray-300 mb-8">
          Welcome to the terminal. Test your cyber security skills, solve
          puzzles, and conquer the system.
        </p>

        {/* Action Button */}
        <div className="pt-6">
          <Button to="/challenges">Enter Challenges</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
