import subprocess, signal, sys, os, time
from gpiozero import LED

BASE = os.path.expanduser("~/Server-Client-CTFpi")

for port in [8080, 3000]:
    subprocess.run(["fuser", "-k", f"{port}/tcp"], stderr=subprocess.DEVNULL)
time.sleep(1)

procs = [
    subprocess.Popen(["./bin/ctf_server"], cwd=f"{BASE}/Backend/build"),
    subprocess.Popen(["node", "middleware.js"], cwd=f"{BASE}/Middleware"),
]

green = LED(17, initial_value=False)
red = LED(24, initial_value=False)
whites = [LED(16, initial_value=False), LED(26, initial_value=False)]

def set_leds(online):
    if online:
        green.on(); red.off()
    else:
        green.off(); red.on()

def check_ssh_users():
    try:
        out = subprocess.check_output(["who"], text=True)
        ips = set()
        for line in out.strip().splitlines():
            if "(" in line:
                ips.add(line.split("(")[-1].rstrip(")"))
        count = min(len(ips), 2)
        for i, led in enumerate(whites):
            led.on() if i < count else led.off()
    except Exception:
        pass

set_leds(True)

def cleanup(*_):
    set_leds(False)
    for w in whites:
        w.off()
    for led in [red, green] + whites:
        led.pin.close = lambda: None
    for p in procs:
        p.terminate()
    for p in procs:
        p.wait()
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

print("All services running. Green LED on.")
while True:
    for p in procs:
        if p.poll() is not None:
            print("A service died. Red LED on.")
            set_leds(False)
            cleanup()
    check_ssh_users()
    time.sleep(2)
