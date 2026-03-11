## Raspberry Pi Setup

```bash
sudo apt update
sudo apt install postgresql nginx python3-pip
pip3 install psycopg2-binary

cd /home/pi
git clone https://github.com/v0ttrix/Server-Client-CTFpi.git
cd Server-Client-CTFpi/Backend

psql -U postgres -d postgres -f nginx_logs_schema.sql

cp db_config.example.json db_config.json
nano db_config.json

chmod +x nginx_log_parser.py
```

## Nginx Config

Recommended (distro-managed include file):

```bash
sudo cp nginx.conf.example /etc/nginx/conf.d/ctf.conf
sudo nginx -t
sudo systemctl reload nginx
```

Alternative (full standalone nginx.conf):

```bash
sudo cp nginx.full.conf.example /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

## Run

```bash
tail -F /var/log/nginx/access.log | ./nginx_log_parser.py &
```

## Auto-start

```bash
sudo nano /etc/systemd/system/nginx-logger.service
```

```ini
[Unit]
Description=Nginx to PostgreSQL Logger
After=postgresql.service nginx.service

[Service]
ExecStart=/bin/bash -c 'tail -F /var/log/nginx/access.log | /home/pi/Server-Client-CTFpi/Backend/nginx_log_parser.py'
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable nginx-logger
sudo systemctl start nginx-logger
```
