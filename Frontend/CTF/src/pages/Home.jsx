import React from "react";
import { Button } from "../components/Button";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-mono text-center relative overflow-hidden">
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
          <Button
            to="/challenges"
            className="inline-flex items-center justify-center gap-2 group mx-auto"
          >
            View Challenges
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-2 translate-x-1.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
