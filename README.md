# CTF Pi

A Capture The Flag platform running on a Raspberry Pi. Built as a university project for Project IV - Mobile and Networked Environments.

## What is it

A CTF web app where users log in, browse challenges, and interact with the server through a custom binary protocol. The whole thing runs on a Raspberry Pi with physical LED indicators for server status.

## How it works

```
Browser (React) <--WebSocket--> Node.js Middleware <--TCP Binary Protocol--> C++ Server <--SQL--> PostgreSQL
```

- The **C++ backend** listens on port 8080 using raw TCP sockets and a custom packet format (12-byte header + payload)
- The **Node.js middleware** bridges WebSocket (port 3000) to TCP, translating JSON to/from binary packets
- The **React frontend** connects via WebSocket and sends commands like LOGIN, REQUEST_FLAG_IMAGE, TOGGLE_MAINTENANCE
- **Nginx** sits in front on port 80 serving the built frontend as a SPA
- **PostgreSQL** stores login attempts and nginx access logs
- **GPIO LEDs** on the Pi show server status (green = online, red = down, yellow = maintenance, white = SSH users connected)

## Packet Format

Every message between client and server uses this structure:

```
| Command ID (4 bytes) | Payload Size (4 bytes) | CRC32 (4 bytes) | Payload (variable) |
```

Commands: `LOGIN (100)`, `TOGGLE_MAINTENANCE (101)`, `SET_ONLINE (102)`, `REQUEST_FLAG_IMAGE (103)`, `ACK (200)`, `ERROR (400)`

## Server State Machine

The server has three states: `ONLINE`, `MAINTENANCE`, and `OFFLINE`. Clients can change the state by sending commands (e.g. TOGGLE_MAINTENANCE from the Challenges page). Login is not a state transition.

## Project Structure

```
Backend/
  server.cpp          - C++ TCP server (main application logic)
  packet.h            - Binary packet definition (header, serialization, CRC32)
  CMakeLists.txt      - Build config
  db_config.json      - Database credentials (not committed)
  tests/              - Google Test packet tests

Frontend/CTF/
  src/pages/          - React pages (Login, Home, Challenges, About, ChallengeDetail)
  src/components/     - Header, Button, magicui components
  src/api/            - WebSocket context and command definitions
  public/             - Static assets (team photos, icons)

Middleware/
  middleware.js       - WebSocket <-> TCP bridge + health endpoint on :3001

start.py              - Launches everything + controls GPIO LEDs
maintain.py           - Alternative launcher for maintenance mode
nginx_to_pg.py        - Tails nginx logs and inserts into PostgreSQL
```

## Setup

See [SETUP.md](SETUP.md) for full instructions. Quick version:

```bash
# Backend
cd Backend && mkdir build && cd build
cmake .. && make
cp ../../db_config.example.json db_config.json  # edit with your creds
./bin/ctf_server

# Frontend (build on your dev machine, not the Pi)
cd Frontend/CTF
npm install && npm run build
# copy dist/ to the Pi's /var/www/html/

# Middleware
cd Middleware && npm install && node middleware.js
```

## Running on the Pi

The `ctf.service` systemd unit runs `start.py` which launches the C++ server, middleware, and manages the GPIO LEDs. It auto-starts on boot.

```bash
sudo systemctl start ctf
sudo systemctl status ctf
```

## Tests

```bash
# Backend (packet tests)
cd Backend/build && cmake .. && make && ctest

# Frontend
cd Frontend/CTF && npm test

# Middleware
cd Middleware && node system_tests.js
```

## Team

- Jaden Mardini
- Ahmed Somaan
- Michael Thomson
- Mohamed Al-Husainawi
