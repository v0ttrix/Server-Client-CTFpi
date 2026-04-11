import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWebSocket } from "../api/WebSocket";
import { Command } from "../api/client";
import { GlowCard } from "../components/magicui/glow-card";
import { Button } from "../components/Button";
import { motion } from "motion/react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [inputShake, setInputShake] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, isAuthenticated, isMaintenance, sendCmd } =
    useWebSocket();

  useEffect(() => {
    document.title = "CTF Pi | Login";
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!isConnected || isMaintenance) {
      triggerShake();
      return;
    }

    if (!username || !password) {
      setInputShake(true);
      setTimeout(() => setInputShake(false), 500);
      return;
    }

    sendCmd(Command.LOGIN, `${username}:${password}`);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/home";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const statusText = isMaintenance
    ? "MAINTENANCE"
    : isConnected
      ? "ONLINE"
      : "OFFLINE";

  const statusColor = isMaintenance
    ? "text-yellow-500"
    : isConnected
      ? "text-green-500"
      : "text-red-500";

  const isSystemReady = isConnected && !isMaintenance;

  const handleFormInteraction = () => {
    if (!isSystemReady) triggerShake();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono relative overflow-hidden">
      <GlowCard
        glowColor="green"
        customSize={true}
        className="w-full max-w-md p-0! grid-rows-1! relative z-10"
      >
        <div className="bg-black/60 p-10 px-12 rounded-2xl w-full h-full relative z-10">
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
            <form 
              onSubmit={handleLogin} 
              className="space-y-6" 
              noValidate
              onClickCapture={handleFormInteraction}
              onFocusCapture={handleFormInteraction}
            >
              <div className="space-y-5 mt-4">
                <motion.input
                  className={`w-full bg-transparent border-b-2 ${
                    !isSystemReady ? "text-gray-500 border-gray-700 cursor-not-allowed" : "text-green-500 focus:border-green-500"
                  } px-2 py-2 focus:outline-none placeholder-gray-500 transition-colors ${
                    isSubmitted && !username && isSystemReady
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Username"
                  readOnly={!isSystemReady}
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
                  className={`w-full bg-transparent border-b-2 ${
                    !isSystemReady ? "text-gray-500 border-gray-700 cursor-not-allowed" : "text-green-500 focus:border-green-500"
                  } px-2 py-2 focus:outline-none placeholder-gray-500 transition-colors ${
                    isSubmitted && !password && isSystemReady
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  type="password"
                  placeholder="Password"
                  readOnly={!isSystemReady}
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
              <Button 
                className={`w-full mt-6 ${
                  !isSystemReady 
                    ? "cursor-not-allowed hover:bg-red-500! hover:shadow-[0_15px_20px_rgba(239,68,68,0.4)]! hover:text-white" 
                    : ""
                }`} 
                type="submit" 
              >
                {!isSystemReady ? "SYSTEM UNAVAILABLE" : "ACCESS TERMINAL"}
              </Button>
            </form>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
