import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { challengesData, difficultyStyles } from "./Challenges";

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const challenge = challengesData.find((c) => c.id === parseInt(id));
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem("completedChallenges") || "[]");
    if (completed.includes(parseInt(id))) setIsCompleted(true);
  }, [id]);

  if (!challenge) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center font-mono text-center p-4 text-green-500">
        <h1 className="text-4xl font-bold uppercase mb-4 tracking-widest text-red-500">404 - Challenge Not Found</h1>
        <Button to="/challenges" className="mt-4">Back to Challenges</Button>
      </div>
    );
  }

  const style = difficultyStyles[challenge.difficulty];

  const handleComplete = () => {
    const completed = JSON.parse(localStorage.getItem("completedChallenges") || "[]");
    if (!completed.includes(challenge.id)) {
      completed.push(challenge.id);
      localStorage.setItem("completedChallenges", JSON.stringify(completed));
    }
    navigate("/challenges");
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center font-mono p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="bg-black/60 border border-green-500/30 rounded-2xl p-8 sm:p-12 w-full shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden">
        {/* Decorative accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-green-500/20 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-500 tracking-widest uppercase">
            {challenge.title}
          </h1>
          <div className="flex gap-3 items-center">
            <span className={`text-xs font-bold px-3 py-1 rounded border ${style.text} ${style.bg} ${style.border} uppercase tracking-wider`}>
              {challenge.difficulty}
            </span>
            <span className="text-green-500 border border-green-500/30 bg-green-500/10 px-3 py-1 rounded text-xs font-bold font-mono uppercase">
              {challenge.points} PTS
            </span>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Objective Overview</h2>
            <p className="text-gray-300 text-lg leading-relaxed bg-black/40 p-5 rounded-lg border border-white/5">
              {challenge.description}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-6 mt-4 border-t border-green-500/20">
            <Button onClick={handleComplete} className={isCompleted ? "opacity-50" : ""}>
              {isCompleted ? "Completed ✓" : "Mark as Completed"}
            </Button>
            <Button onClick={() => navigate("/challenges")} style={{ background: 'transparent', color: '#9ca3af', border: '1px solid #374151', boxShadow: 'none' }}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
