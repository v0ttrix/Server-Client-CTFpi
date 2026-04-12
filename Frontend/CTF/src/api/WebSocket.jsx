import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Command } from "./client.js";

const WebSocketContext = createContext(null);
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";
const MAINTAIN_URL = WS_URL.replace("ws://", "http://").replace("wss://", "https://").replace(/:\d+/, ":3001");

export function WebSocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        // Check maintenance right away
        fetch(MAINTAIN_URL)
            .then(r => r.json())
            .then(data => { if (data.maintenance) setIsMaintenance(true); })
            .catch(() => {});

        ws.current = new WebSocket(WS_URL);
        ws.current.onopen = () => { setIsConnected(true); setIsMaintenance(false); };
        ws.current.onclose = () => {
            setIsConnected(false);
            setIsAuthenticated(false);
            fetch(MAINTAIN_URL)
                .then(r => r.json())
                .then(data => setIsMaintenance(!!data.maintenance))
                .catch(() => setIsMaintenance(false));
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLastMessage(data);
            if (data.command === Command.ACK && data.payload.includes("Login successful")) {
                setIsAuthenticated(true);
            }
            if (data.command === Command.ACK && data.payload.includes("maintenance")) {
                setIsMaintenance(true);
            }
        };
        return () => ws.current?.close();
    }, []);

    const sendCmd = (cmd, payload) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ command: cmd, payload }));
        }
    };

    const logout = () => setIsAuthenticated(false);

    return (
        <WebSocketContext.Provider value={{ isConnected, isAuthenticated, isMaintenance, sendCmd, lastMessage, logout }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => useContext(WebSocketContext);
