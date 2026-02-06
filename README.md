Backend:
- **C Server** (server.c) - Low-level HTTP server serving static files from ./build
  - Handles CTF challenges with struct-based data model
  - support for HTML/CSS/JS/images
  - Custom protocol for CTF challenges
 
- **Python Service Manager** (autostart_service.py) - Systemd service automation
  - Auto-restart on failure
  - CLI-based configuration     

- **Access Control** (acl.json) - Tailscale ACL configuration
  - SSH access management for team members
  - Group-based permissions

Frontend:


Infrastructure:
- Systemd service (API_HOST.service) for daemon management
- Database(.env.example with DB credentials)
