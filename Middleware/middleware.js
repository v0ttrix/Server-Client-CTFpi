const net = require('net');
const WebSocket = require('ws');
const crc32 = require('crc-32');

const TCP_PORT = 8080;
const TCP_HOST = '127.0.0.1'; 
const WS_PORT = 3000;

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
    const tcpClient = new net.Socket();
    tcpClient.connect(TCP_PORT, TCP_HOST);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const payloadBuffer = Buffer.from(data.payload || '', 'utf-8');
            const headerBuffer = Buffer.alloc(12);
            
            headerBuffer.writeUInt32BE(data.command, 0); 
            headerBuffer.writeUInt32BE(payloadBuffer.length, 4);
            headerBuffer.writeUInt32BE(crc32.buf(payloadBuffer) >>> 0, 8);

            tcpClient.write(Buffer.concat([headerBuffer, payloadBuffer]));
        } catch (err) { console.error('Parse Error:', err); }
    });

    let receiveBuffer = Buffer.alloc(0);

    tcpClient.on('data', (data) => {
        receiveBuffer = Buffer.concat([receiveBuffer, data]);

        while (receiveBuffer.length >= 12) {
            const commandID = receiveBuffer.readUInt32BE(0);
            const payloadSize = receiveBuffer.readUInt32BE(4);
            
            if (receiveBuffer.length >= 12 + payloadSize) {
                const payloadBuffer = receiveBuffer.subarray(12, 12 + payloadSize);
                
                // If it's a huge payload (like our 1MB image), we convert to Base64 so React can display it
                const isImage = payloadSize > 5000; 
                const payloadContent = isImage ? payloadBuffer.toString('base64') : payloadBuffer.toString('utf-8');

                ws.send(JSON.stringify({ command: commandID, payload: payloadContent, isImage }));
                receiveBuffer = receiveBuffer.subarray(12 + payloadSize);
            } else {
                break; 
            }
        }
    });

    ws.on('close', () => tcpClient.destroy());
    tcpClient.on('error', () => ws.send(JSON.stringify({ error: 'TCP Server Offline' })));
});
console.log(` Middleware listening on ws://localhost:${WS_PORT}`);