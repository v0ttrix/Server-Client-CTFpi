#!/usr/bin/env python3
import subprocess, re, psycopg2, time

CONN = "dbname=ctfpi_db user=postgres password=0000 host=localhost"
LOG = "/var/log/nginx/access.log"
PATTERN = re.compile(
    r'(?P<ip>\S+) - \S+ \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d+) \S+ "[^"]*" "(?P<ua>[^"]*)"'
)

proc = subprocess.Popen(["tail", "-F", LOG], stdout=subprocess.PIPE, text=True)
conn = psycopg2.connect(CONN)
conn.autocommit = True

for line in proc.stdout:
    m = PATTERN.match(line.strip())
    if not m:
        continue
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO ctf.nginx_logs (ip, method, path, status, user_agent, raw_line) VALUES (%s,%s,%s,%s,%s,%s)",
                (m["ip"], m["method"], m["path"], int(m["status"]), m["ua"], line.strip())
            )
    except Exception as e:
        print(f"DB error: {e}")
        try:
            conn = psycopg2.connect(CONN)
            conn.autocommit = True
        except:
            time.sleep(5)
