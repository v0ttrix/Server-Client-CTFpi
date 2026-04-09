import subprocess, signal, sys, os, time, threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from gpiozero import LED

BASE = "/home/pi/Server-Client-CTFpi"

for port in [8080, 3000]:
    subprocess.run(["fuser", "-k", f"{port}/tcp"], stderr=subprocess.DEVNULL)
time.sleep(1)

procs = [
    subprocess.Popen(["./bin/ctf_server"], cwd=f"{BASE}/Backend/build"),
    subprocess.Popen(["node", "middleware.js"], cwd=f"{BASE}/Middleware"),
]

yellow = LED(23, initial_value=False)
green = LED(17, initial_value=False)
red = LED(24, initial_value=False)

green.off()
red.off()
yellow.on()

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b"{\"maintenance\":true}")
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
    def log_message(self, *args):
        pass

server = HTTPServer(("0.0.0.0", 3001), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()

def cleanup(*_):
    yellow.off()
    server.shutdown()
    for p in procs:
        p.terminate()
    for p in procs:
        p.wait()
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

print("Maintenance mode: Yellow LED on. Backend running. Status on :3001")
for p in procs:
    p.wait()
