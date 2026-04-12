// Middleware/system_tests.js
// System tests for the C++ backend over raw TCP
// Requires: backend server running on localhost:8080
// Run with: node --test system_tests.js

const { describe, it } = require('node:test');
const assert = require('node:assert');
const net = require('net');
const crc32 = require('crc-32');

const TCP_PORT = 8080;
const TCP_HOST = '127.0.0.1';
const HEADER_SIZE = 12;

// Command IDs matching packet.h
const Command = {
    NONE: 0,
    LOGIN: 100,
    TOGGLE_MAINTENANCE: 101,
    SET_ONLINE: 102,
    REQUEST_FLAG_IMAGE: 103,
    ACK: 200,
    ERROR: 400
};

// Build a binary packet matching the NetworkPacket format
function buildPacket(commandID, payload) {
    const payloadBuffer = Buffer.from(payload, 'utf-8');
    const header = Buffer.alloc(HEADER_SIZE);
    header.writeUInt32BE(commandID, 0);
    header.writeUInt32BE(payloadBuffer.length, 4);
    header.writeUInt32BE(crc32.buf(payloadBuffer) >>> 0, 8);
    return Buffer.concat([header, payloadBuffer]);
}

// Parse a response packet from the server
function parsePacket(buffer) {
    if (buffer.length < HEADER_SIZE) throw new Error('Response too small');
    return {
        command: buffer.readUInt32BE(0),
        payloadSize: buffer.readUInt32BE(4),
        crc: buffer.readUInt32BE(8),
        payload: buffer.subarray(HEADER_SIZE).toString('utf-8')
    };
}

// Helper: connect, send a packet, receive response
function sendAndReceive(packet, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timer = setTimeout(() => { client.destroy(); reject(new Error('Timeout')); }, timeout);
        let receiveBuffer = Buffer.alloc(0);

        client.connect(TCP_PORT, TCP_HOST, () => {
            client.write(packet);
        });

        client.on('data', (data) => {
            receiveBuffer = Buffer.concat([receiveBuffer, data]);
            if (receiveBuffer.length >= HEADER_SIZE) {
                const payloadSize = receiveBuffer.readUInt32BE(4);
                if (receiveBuffer.length >= HEADER_SIZE + payloadSize) {
                    clearTimeout(timer);
                    client.destroy();
                    resolve(receiveBuffer);
                }
            }
        });

        client.on('error', (err) => { clearTimeout(timer); reject(err); });
    });
}

// Helper: just connect, no send
function connectOnly(timeout = 2000) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timer = setTimeout(() => { client.destroy(); reject(new Error('Timeout')); }, timeout);
        client.connect(TCP_PORT, TCP_HOST, () => {
            clearTimeout(timer);
            resolve(client);
        });
        client.on('error', (err) => { clearTimeout(timer); reject(err); });
    });
}

describe('Backend System Tests', () => {

    // Test 1: Server accepts TCP connections
    it('should accept a TCP connection on port 8080', async () => {
        const client = await connectOnly();
        assert.ok(client);
        client.destroy();
    });

    // Test 2: LOGIN returns an ACK response
    it('should respond to LOGIN with an ACK', async () => {
        const packet = buildPacket(Command.LOGIN, 'testuser:testpass');
        const response = parsePacket(await sendAndReceive(packet));
        assert.strictEqual(response.command, Command.ACK);
    });

    // Test 3: LOGIN ACK contains "Login successful"
    it('should return Login successful message on LOGIN', async () => {
        const packet = buildPacket(Command.LOGIN, 'testuser:testpass');
        const response = parsePacket(await sendAndReceive(packet));
        assert.ok(response.payload.includes('Login successful'), `Got: ${response.payload}`);
    });

    // Test 4: LOGIN with empty payload still gets a response
    it('should handle LOGIN with empty payload without crashing', async () => {
        const packet = buildPacket(Command.LOGIN, '');
        const response = parsePacket(await sendAndReceive(packet));
        assert.ok(response.command === Command.ACK || response.command === Command.ERROR);
    });

    // Test 5: TOGGLE_MAINTENANCE returns an ACK
    it('should respond to TOGGLE_MAINTENANCE with an ACK', async () => {
        // Login first
        const login = buildPacket(Command.LOGIN, 'admin:admin');
        await sendAndReceive(login);

        const packet = buildPacket(Command.TOGGLE_MAINTENANCE, '');
        const response = parsePacket(await sendAndReceive(packet));
        assert.strictEqual(response.command, Command.ACK);
    });

    // Test 6: REQUEST_FLAG_IMAGE returns a large payload
    it('should return a large payload for REQUEST_FLAG_IMAGE', async () => {
        const login = buildPacket(Command.LOGIN, 'admin:admin');
        await sendAndReceive(login);

        const packet = buildPacket(Command.REQUEST_FLAG_IMAGE, '');
        const response = parsePacket(await sendAndReceive(packet, 10000));
        assert.ok(response.payloadSize > 5000, `Expected large payload, got ${response.payloadSize} bytes`);
    });

    // Test 7: Response header CRC matches payload
    it('should return a valid CRC in the response header', async () => {
        const packet = buildPacket(Command.LOGIN, 'crctest:pass');
        const raw = await sendAndReceive(packet);
        const response = parsePacket(raw);
        const payloadBuf = raw.subarray(HEADER_SIZE, HEADER_SIZE + response.payloadSize);
        const expectedCrc = crc32.buf(payloadBuf) >>> 0;
        assert.strictEqual(response.crc, expectedCrc);
    });

    // Test 8: Sending a truncated header doesn't crash the server
    it('should survive a truncated header without crashing', async () => {
        await new Promise((resolve, reject) => {
            const client = new net.Socket();
            client.connect(TCP_PORT, TCP_HOST, () => {
                client.write(Buffer.from([0x00, 0x01, 0x02])); // Only 3 bytes, not 12
                setTimeout(() => { client.destroy(); resolve(); }, 500);
            });
            client.on('error', () => { client.destroy(); resolve(); }); // Server closing connection is OK
        });
        // Verify server is still alive by connecting again
        const client = await connectOnly();
        assert.ok(client);
        client.destroy();
    });

    // Test 9: Two clients can connect simultaneously
    it('should handle two simultaneous client connections', async () => {
        const client1 = await connectOnly();
        const client2 = await connectOnly();
        assert.ok(client1);
        assert.ok(client2);
        client1.destroy();
        client2.destroy();
    });

    // Test 10: Server survives client disconnect mid-transfer
    it('should stay alive after a client disconnects abruptly', async () => {
        const client = await connectOnly();
        // Send partial packet then kill connection
        client.write(Buffer.alloc(6, 0xFF));
        client.destroy();

        // Wait a moment then verify server is still up
        await new Promise(r => setTimeout(r, 300));
        const client2 = await connectOnly();
        assert.ok(client2);
        client2.destroy();
    });
});
