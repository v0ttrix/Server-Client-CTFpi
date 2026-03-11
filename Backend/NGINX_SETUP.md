## Setup

```bash
psql -U postgres -d postgres -f nginx_logs_schema.sql
pip3 install psycopg2-binary
```

## Nginx Config Options

Use one of these approaches:

1. Distro-managed Nginx (recommended on Linux hosts):

```bash
sudo cp nginx.conf.example /etc/nginx/conf.d/ctf.conf
sudo nginx -t
sudo systemctl reload nginx
```

2. Full standalone config (useful for containers/self-managed Nginx):

```bash
sudo cp nginx.full.conf.example /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

## Run

```bash
tail -F /var/log/nginx/access.log | ./nginx_log_parser.py
```

## Query

```sql
SELECT * FROM ctf.nginx_logs ORDER BY timestamp DESC LIMIT 10;
```
