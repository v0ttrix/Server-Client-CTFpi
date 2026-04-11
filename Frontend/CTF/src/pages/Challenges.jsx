import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../api/WebSocket";
import { Command } from "../api/client";
import { GlowCard } from "../components/magicui/glow-card";

const challengesData = [
  {
    id: 1,
    title: "Sanity Check",
    description:
      "Welcome to the platform. Submit the flag hidden in the source code to prove you are ready.",
    points: 10,
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "SQLi 101",
    description:
      "The admin portal is locked down tight. Prove you can bypass the login mechanism using standard SQL injection techniques.",
    points: 50,
    difficulty: "Easy",
  },
  {
    id: 3,
    title: "Crypto Basics",
    description:
      "A transmission was intercepted, but its encoded in a heavily layered base64 format. Can you decode the payload?",
    points: 100,
    difficulty: "Medium",
  },
  {
    id: 4,
    title: "Buffer Overflow",
    description:
      "Smash the stack and carefully override the instruction pointer to redirect execution flow. You have the binary, get the flag.",
    points: 200,
    difficulty: "Hard",
  },
  {
    id: 5,
    title: "Directory Traversal",
    description:
      "A vulnerable file upload script allows path traversal. Exploit it to read /etc/passwd from the server.",
    points: 150,
    difficulty: "Medium",
  },
  {
    id: 6,
    title: "XSS Fundamentals",
    description:
      "Steal the admin cookie by injecting an alerting payload into the forums comment section. Watch your sanitation.",
    points: 100,
    difficulty: "Medium",
  },
  {
    id: 7,
    title: "Hidden in Plain Sight",
    description:
      "Inspect the DOM closely. The developer left a careless console.log comment referencing an internal API route.",
    points: 50,
    difficulty: "Easy",
  },
  {
    id: 8,
    title: "Reverse Engineering",
    description:
      "Decompile the provided crackme binary and find the hardcoded password string to authorize execution.",
    points: 300,
    difficulty: "Hard",
  },
  {
    id: 9,
    title: "Forensics 101",
    description:
      "A suspicious file transfer happened earlier. Analyze the network pcap file to extract the hidden PDF.",
    points: 120,
    difficulty: "Medium",
  },
  {
    id: 10,
    title: "RCE Me",
    description:
      "The grand finale. Find and exploit the remote code execution vulnerability in the eval() shell function.",
    points: 500,
    difficulty: "Hard",
  },
];

const difficultyStyles = {
  Easy: {
    text: "text-green-400",
    glow: "green",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  Medium: {
    text: "text-orange-400",
    glow: "orange",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  Hard: {
    text: "text-red-400",
    glow: "red",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

export default function Challenges() {
  const { sendCmd, lastMessage } = useWebSocket();
  const navigate = useNavigate();
  const [flagImage, setFlagImage] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.isImage) {
        setFlagImage(`data:image/jpeg;base64,${lastMessage.payload}`);
        setStatus("Flag image downloaded successfully!");
      } else {
        setStatus(`Server: ${lastMessage.payload || lastMessage.error}`);
      }
    }
  }, [lastMessage]);

  return (
    <div className="min-h-[calc(100vh-70px)] bg-transparent text-gray-300 font-mono p-6 sm:p-12 mb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-green-500/30 pb-4 gap-4">
        <h1 className="text-4xl font-bold text-green-500 uppercase tracking-widest">
          Active Challenges
        </h1>

        {/* Legacy Server Controls from previous version */}
        <div className="flex space-x-4">
          <button
            className="text-xs uppercase tracking-widest bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-3 py-2 rounded hover:bg-yellow-500 hover:text-black transition-colors"
            onClick={() => sendCmd(Command.TOGGLE_MAINTENANCE, "")}
          >
            Toggle Maintenance
          </button>
          <button
            className="text-xs uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/50 px-3 py-2 rounded hover:bg-blue-500 hover:text-black transition-colors"
            onClick={() => sendCmd(Command.REQUEST_FLAG_IMAGE, "")}
          >
            Download Network Flag
          </button>
        </div>
      </div>

      {status && (
        <div className="mb-8 p-4 bg-black/60 border border-green-500/30 rounded-lg text-sm">
          System Status: <b className="text-white">{status}</b>
          {flagImage && (
            <div className="mt-4 border border-gray-700/50 rounded overflow-hidden max-w-sm">
              <img
                src={flagImage}
                alt="CTF Flag Payload"
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challengesData.map((chal) => {
          const style = difficultyStyles[chal.difficulty];

          return (
            <div
              key={chal.id}
              role="button"
              tabIndex={0}
              className="group h-full"
              onClick={() => navigate(`/challenges/${chal.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/challenges/${chal.id}`);
                }
              }}
            >
              <GlowCard
                glowColor={style.glow}
                customSize={true}
                className="h-full flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-2 p-0!"
              >
                <div className="p-6 bg-black/60 rounded-2xl h-full flex flex-col z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      {chal.title}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded border ${style.text} ${style.bg} ${style.border} uppercase tracking-wider`}
                    >
                      {chal.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                    {chal.description}
                  </p>
                  <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/10 group-hover:border-green-500/50 transition-colors duration-300">
                    <span className="text-green-500 font-bold font-mono">
                      {chal.points}{" "}
                      <span className="text-xs text-gray-500 font-normal">
                        PTS
                      </span>
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-green-400 transition-colors flex items-center gap-1">
                      Attempt
                      <svg
                        className="w-3 h-3 group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </div>
                </div>
              </GlowCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
