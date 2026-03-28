## DBeaver SSH Connection

### Main Tab
- Host: `localhost`
- Port: `5432`
- Database: `ctf_db`
- Username: `postgres`
- Password: `<your_postgres_password>`

### SSH Tab
- ✓ Use SSH Tunnel
- Host/IP: `<raspberry_pi_ip>`
- Port: `22`
- Username: `pi`
- Authentication: Private Key
- Private Key: `~/.ssh/id_rsa`

### Test Connection
Click "Test Connection" to verify.

### Query Logs
```sql
SELECT * FROM ctf.nginx_logs ORDER BY timestamp DESC LIMIT 50;
```
