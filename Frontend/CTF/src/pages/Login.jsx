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
  const [inputShake, setInputShake] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { isConnected, isAuthenticated, isMaintenance, sendCmd } =
    useWebSocket();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!username || !password) {
      setInputShake(true);
      setTimeout(() => setInputShake(false), 500);
      return;
    }

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
        size={40}
        className="opacity-50"
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
            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              <div className="space-y-5 mt-4">
                <motion.input
                  className={`w-full bg-transparent border-b-2 text-green-500 px-2 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500 transition-colors ${
                    isSubmitted && !username
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Username"
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  animate={
                    inputShake && !username
                      ? { x: [-10, 10, -8, 8, -5, 5, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.4 }}
                />
                <motion.input
                  className={`w-full bg-transparent border-b-2 text-green-500 px-2 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500 transition-colors ${
                    isSubmitted && !password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  type="password"
                  placeholder="Password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  animate={
                    inputShake && !password
                      ? { x: [-10, 10, -8, 8, -5, 5, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.4 }}
                />
              </div>
              <button
                className="w-full mt-6 py-[1.3em] px-[3em] text-[12px] uppercase tracking-[2.5px] font-bold text-black bg-white border-none rounded-[45px] shadow-[0px_8px_15px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out cursor-pointer outline-none hover:bg-green-500 hover:shadow-[0px_15px_20px_rgba(46,229,157,0.4)] hover:-translate-y-1.75 active:-translate-y-px"
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
