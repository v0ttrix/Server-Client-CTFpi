import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../api/WebSocket";
import { Command } from "../api/client";
import { GlowCard } from "../components/magicui/glow-card";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { isConnected, isAuthenticated, isMaintenance, sendCmd } =
    useWebSocket();

  const handleLogin = (e) => {
    e.preventDefault();
    sendCmd(Command.LOGIN, `${username}:${password}`);
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated, navigate]);

  const statusText = isMaintenance
    ? "UNDER MAINTENANCE"
    : isConnected
      ? "ONLINE"
      : "OFFLINE";

  const statusColor = isMaintenance
    ? "text-yellow-500"
    : isConnected
      ? "text-green-500"
      : "text-red-500";

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4 font-mono">
      <GlowCard
        glowColor="green"
        customSize={true}
        className="w-full max-w-md !p-0 !grid-rows-1 relative z-10"
      >
        <div className="bg-neutral-900/60 p-10 px-12 rounded-2xl w-full h-full relative z-10">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-green-500 tracking-widest uppercase">
                CTF Login
              </h2>
              <p className="text-sm text-gray-400">
                System Status:{" "}
                <span className={`font-semibold ${statusColor}`}>
                  {statusText}
                </span>
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5 mt-4">
                <input
                  className="w-full bg-transparent border-b-2 border-gray-600 text-green-500 px-2 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500 transition-colors"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  className="w-full bg-transparent border-b-2 border-gray-600 text-green-500 px-2 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500 transition-colors"
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 px-4 mt-6 rounded-md transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] disabled:hover:shadow-none"
                type="submit"
                disabled={!isConnected || isMaintenance}
              >
                Access Terminal
              </button>
            </form>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
