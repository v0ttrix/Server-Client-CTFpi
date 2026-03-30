import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../api/WebSocketContext';
import { Command } from '../api/client';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { isConnected, isAuthenticated, sendCmd } = useWebSocket();

    const handleLogin = (e) => {
        e.preventDefault();
        sendCmd(Command.LOGIN, `${username}:${password}`);
    };

    useEffect(() => {
        if (isAuthenticated) navigate('/home');
    }, [isAuthenticated, navigate]);

    return (
        <div style={{ padding: '20px' }}>
            <h2>CTF Login</h2>
            <p>Status: {isConnected ? '🟢 Server Connected' : '🔴 Server Offline'}</p>
            <form onSubmit={handleLogin}>
                <input placeholder="Username" onChange={e => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={!isConnected}>Login</button>
            </form>
        </div>
    );
}