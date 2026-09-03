#!/usr/bin/env python3
"""
public_deploy.py - one-shot deploy of majid-systems to 171.22.24.45.

This script is the Windows-friendly equivalent of `bash deploy-public.sh`
because Windows OpenSSH doesn't have password support and sshpass is
not installed. It uses paramiko for everything: SFTP for file uploads
and SSH exec for commands.

Usage:
  python scripts/public_deploy.py <ssh_password>
  python scripts/public_deploy.py                (will prompt)
"""
import os
import sys
import getpass
import time
import paramiko

HOST = "171.22.24.45"
USER = "root"
PORT = 22

REPO_URL = "https://github.com/MajidAsghariTabrizi/majid-systems.git"
APP_DIR = "/opt/majid-systems"
APP_PORT = 3000
SERVICE_NAME = "majid-systems"


def connect(password):
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, port=PORT, username=USER, password=password,
              timeout=15, banner_timeout=15, auth_timeout=15)
    return c


def run(client, cmd, timeout=600, stream=False):
    si, so, se = client.exec_command(cmd, timeout=timeout)
    if stream:
        for line in iter(so.readline, b""):
            sys.stdout.write(line.decode("utf-8", errors="replace"))
            sys.stdout.flush()
        for line in iter(se.readline, b""):
            sys.stderr.write(line.decode("utf-8", errors="replace"))
            sys.stderr.flush()
    else:
        out = so.read().decode("utf-8", errors="replace")
        err = se.read().decode("utf-8", errors="replace")
        code = so.channel.recv_exit_status()
        if out:
            print(out, end="")
        if err:
            print(err, file=sys.stderr, end="")
        return code
    return so.channel.recv_exit_status()


def upload(client, local, remote):
    sftp = client.open_sftp()
    try:
        sftp.put(local, remote)
    finally:
        sftp.close()


def step(msg):
    print()
    print(f"==> {msg}")


def main():
    pw = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SSH_PASSWORD")
    if not pw:
        pw = getpass.getpass(f"SSH password for {USER}@{HOST}: ")
    client = connect(pw)
    try:
        step(f"Ensuring Node.js 20 on {HOST}")
        run(client,
            """bash -c '
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v
'""")

        step(f"Cloning or pulling {REPO_URL} -> {APP_DIR}")
        run(client, f"""bash -c '
set -e
mkdir -p {APP_DIR}
if [ -d {APP_DIR}/.git ]; then
  cd {APP_DIR}
  git fetch --prune origin
  git reset --hard origin/main
else
  git clone {REPO_URL} {APP_DIR}
fi
cd {APP_DIR}
git log --oneline -3
'""")

        step("Installing production deps and building")
        run(client, f"""bash -c '
cd {APP_DIR}
rm -rf .next
npm ci --omit=dev || npm install --omit=dev
echo --- build ---
npm run build
'""", timeout=600, stream=True)

        step("Writing systemd service")
        run(client, f"""bash -c '
cat > /etc/systemd/system/{SERVICE_NAME}.service <<UNIT
[Unit]
Description=Majid Systems Portfolio (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory={APP_DIR}
Environment=NODE_ENV=production
Environment=PORT={APP_PORT}
Environment=NEXT_PUBLIC_SITE_URL=https://quantiviq.xyz
Environment=NEXT_PUBLIC_GITHUB_USER=MajidAsghariTabrizi
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p {APP_PORT}
Restart=on-failure
RestartSec=5s
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now {SERVICE_NAME}.service
sleep 4
systemctl --no-pager --full status {SERVICE_NAME}.service | head -15
'""")

        step("Uploading nginx/quantiviq.conf and reloading nginx")
        here = os.path.dirname(os.path.abspath(__file__))
        nginx_conf = os.path.normpath(os.path.join(here, "..", "nginx", "quantiviq.conf"))
        upload(client, nginx_conf, "/etc/nginx/sites-available/quantiviq")
        run(client, """bash -c '
rm -f /etc/nginx/sites-enabled/quantiviq.bak
rm -f /etc/nginx/sites-enabled/quantiviq.bak-pre-portfolio
rm -f /etc/nginx/sites-available/quantiviq.bak-pre-portfolio
ln -sf /etc/nginx/sites-available/quantiviq /etc/nginx/sites-enabled/quantiviq
nginx -t
systemctl reload nginx
'""")

        step("Smoke tests (https://127.0.0.1 with Host: quantiviq.xyz)")
        run(client, """bash -c '
echo PORTFOLIO:
for r in / /work /work/phoenix /work/smart-trader /work/free-best-router /work/universal-engineering-agent /engineering /notes /open-source /about /contact /sitemap.xml /robots.txt /manifest.webmanifest; do
  c=$(curl -sk -o /dev/null -w "%{http_code}" -H "Host: quantiviq.xyz" "https://127.0.0.1$r")
  printf "  %-50s -> %s\\n" "$r" "$c"
done
echo
echo SMARTTRADER:
for r in /smart-trader/ /smart-trader/dashboard /smart-trader/landing /smart-trader/login /smart-trader/api/owner/status /smart-trader/static/css/owner.css; do
  c=$(curl -sk -o /dev/null -w "%{http_code}" -H "Host: quantiviq.xyz" "https://127.0.0.1$r")
  printf "  %-50s -> %s\\n" "$r" "$c"
done
echo
echo "Portfolio title: $(curl -sk -H "Host: quantiviq.xyz" https://127.0.0.1/ | grep -oE "<title>[^<]+</title>" | head -1)"
echo "SmartTrader title: $(curl -sk -H "Host: quantiviq.xyz" https://127.0.0.1/smart-trader/dashboard | grep -oE "<title>[^<]+</title>" | head -1)"
'""")

        print()
        print("=" * 60)
        print("PUBLIC DEPLOY COMPLETE")
        print("=" * 60)
        print("Portfolio:    https://quantiviq.xyz/")
        print("SmartTrader:  https://quantiviq.xyz/smart-trader/")
        print("=" * 60)
    finally:
        client.close()


if __name__ == "__main__":
    main()
