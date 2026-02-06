##!/usr/bin/env python3
import argparse
import subprocess
##build the systemd unit file content with the provided runtime settings.
def build_service_content(server_path: str, user: str, working_dir: str) -> str:
    return f"""[Unit]
Description=CTF Web Server
After=network.target
[Service]
Type=simple
User={user}
WorkingDirectory={working_dir}
ExecStart={server_path}
Restart=on-failure
RestartSec=5
[Install]
WantedBy=multi-user.target
"""
##this will parse CLI options so this script can be reused across devices/environment
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=
        (
            "Create and enable a systemd service to auto-start the C server. "
            "If your server uses WEB_ROOT='./build', set --working-dir to the repo root."
        )
    )
    parser.add_argument(
        "--server-path",
        default="/home/ctf-pi/server",
        help="Absolute path to the server binary (default: /home/ctf-pi/server)",
    )
    parser.add_argument(
        "--service-name",
        default="myserver",
        help="Systemd service name (default: myserver)",
    )
    parser.add_argument(
        "--user",
        default="ctf-pi",
        help="Linux user to run the service (default: ctf-pi)",
    )
    parser.add_argument(
        "--working-dir",
        default="/home/ctf-pi",
        help="Working directory for the server (default: /home/ctf-pi)",
    )
    return parser.parse_args()


def main() -> int:              ##create/install/enable the systemd service
    args = parse_args()
    service_file_path = f"/etc/systemd/system/{args.service_name}.service"
    service_content = build_service_content(
        server_path=args.server_path,
        user=args.user,
        working_dir=args.working_dir,
    )
    print(f"Creating systemd service file at {service_file_path}...")

    try:                            ##write the unit file to a temp location first
        with open(f"/tmp/{args.service_name}.service", "w", encoding="utf-8") as f:
            f.write(service_content)
        subprocess.run( ##move into systemd's unit directory ----requires sudo privileges
            ["sudo", "mv", f"/tmp/{args.service_name}.service", service_file_path],
            check=True,
        )

      
        print("Reloading systemd daemon...")  ##reload systemd to pick up the new unit file
        subprocess.run(["sudo", "systemctl", "daemon-reload"], check=True)
        print(f"Enabling {args.service_name} service...")        ##enable service to start on boot
        subprocess.run(["sudo", "systemctl", "enable", args.service_name], check=True)
        print(f"Starting {args.service_name} service...") ##launch the service on startup
        subprocess.run(["sudo", "systemctl", "start", args.service_name], check=True)
        print("\n✓ Service installed and started successfully!")
        print("\nUseful commands:")
        print(f"  Check status: sudo systemctl status {args.service_name}")
        print(f"  Stop service: sudo systemctl stop {args.service_name}")
        print(f"  Restart service: sudo systemctl restart {args.service_name}")
        print(f"  View logs: sudo journalctl -u {args.service_name} -f")

    except subprocess.CalledProcessError as e:
        print(f"Error: {e}") ##surface any systemctl/mv failure
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
