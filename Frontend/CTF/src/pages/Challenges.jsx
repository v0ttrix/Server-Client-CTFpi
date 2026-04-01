import { useState, useEffect } from 'react';
import { useWebSocket } from '../api/WebSocketContext';
import { Command } from '../api/client';

export default function Challenges() {
    const { sendCmd, lastMessage } = useWebSocket();
    const [flagImage, setFlagImage] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.isImage) {
                // The middleware converts binary to base64, so we can render it directly
                setFlagImage(`data:image/jpeg;base64,${lastMessage.payload}`);
                setStatus('Flag image downloaded successfully!');
            } else {
                setStatus(`Server: ${lastMessage.payload || lastMessage.error}`);
            }
        }
    }, [lastMessage]);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Active Challenges</h2>
            <p>System Status: <b>{status}</b></p>
            
            <button onClick={() => sendCmd(Command.TOGGLE_MAINTENANCE, '')}>
                Trigger Server Maintenance Mode
            </button>
            <button onClick={() => sendCmd(Command.REQUEST_FLAG_IMAGE, '')} style={{ marginLeft: '10px' }}>
                Download 1MB Flag
            </button>

            <div style={{ marginTop: '20px' }}>
                {flagImage && <img src={flagImage} alt="CTF Flag" style={{ maxWidth: '100%' }} />}
            </div>
        </div>
    );
}