#!/usr/bin/env python3
import psycopg2
import json
import sys
import re

def parse_log(line):
    match = re.match(r'(\S+) .* \[([^\]]+)\] "([^"]*)" (\d+) .* "([^"]*)"', line)
    if match:
        return (match.group(1), match.group(3), int(match.group(4)), match.group(5))
    return None

config = json.load(open('/home/pi/Server-Client-CTFpi/Backend/db_config.json'))['database']
conn = psycopg2.connect(**config)
cur = conn.cursor()

for line in sys.stdin:
    data = parse_log(line.strip())
    if data:
        cur.execute("INSERT INTO ctf.nginx_logs (ip, request, status, user_agent) VALUES (%s, %s, %s, %s)", data)
        conn.commit()

conn.close()
