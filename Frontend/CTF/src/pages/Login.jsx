import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../api/WebSocket";
import { Command } from "../api/client";
import { GlowCard } from "../components/magicui/glow-card";
import { BGPattern } from "../components/magicui/bg-pattern";
import { motion } from "motion/react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const { isConnected, isAuthenticated, isMaintenance, sendCmd } =
    useWebSocket();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!isConnected || isMaintenance) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
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
    <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4 font-mono relative overflow-hidden">
      <BGPattern
        variant="dots"
        mask="fade-center"
        fill="#22c55e"
        size={24}
        className="opacity-20"
      />
      <GlowCard
        glowColor="green"
        customSize={true}
        className="w-full max-w-md p-0! grid-rows-1! relative z-10"
      >
        <div className="bg-neutral-900/60 p-10 px-12 rounded-2xl w-full h-full relative z-10">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-green-500 tracking-widest uppercase">
                CTF Login
              </h2>
              <p className="text-sm text-gray-200">
                System Status:{" "}
                <motion.span
                  className={`inline-block font-semibold ${statusColor}`}
                  animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {statusText}
                </motion.span>
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5 mt-4">
                <input
                  className="w-full bg-transparent border-b-2 border-gray-300 text-green-500 px-2 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500 transition-colors"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  className="w-full bg-transparent border-b-2 border-gray-300 text-green-500 px-2 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500 transition-colors"
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="w-full mt-6 py-[1.3em] px-[3em] text-[12px] uppercase tracking-[2.5px] font-medium text-black bg-white border-none rounded-[45px] shadow-[0px_8px_15px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out cursor-pointer outline-none hover:bg-green-500 hover:shadow-[0px_15px_20px_rgba(46,229,157,0.4)] hover:text-white hover:-translate-y-[7px] active:-translate-y-[1px]"
                type="submit"
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
