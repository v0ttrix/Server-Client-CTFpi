CREATE TABLE ctf.nginx_logs (
    id SERIAL PRIMARY KEY,
    ip INET,
    timestamp TIMESTAMP DEFAULT NOW(),
    request TEXT,
    status INT,
    user_agent TEXT
);

CREATE INDEX idx_nginx_ip ON ctf.nginx_logs(ip);
CREATE INDEX idx_nginx_time ON ctf.nginx_logs(timestamp);
