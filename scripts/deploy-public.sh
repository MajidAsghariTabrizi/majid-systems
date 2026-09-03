#!/usr/bin/env bash
# ============================================================
# majid-systems: public deploy script
#
# Target server:  171.22.24.45 (root)
# Working dir:    /opt/majid-systems
# Service:        majid-systems.service (next start on 127.0.0.1:3000)
# Nginx:          /etc/nginx/sites-available/quantiviq
#                 / -> portfolio, /smart-trader/ -> existing SmartTrader
# TLS:            reuses /etc/letsencrypt/live/quantiviq.xyz/
# Cert coverage:  quantiviq.xyz (apex only); www.quantiviq.xyz is 301 -> apex
#
# Designed to be run from a local machine that has paramiko and
# SSH password access to root@171.22.24.45:
#
#   python scripts/public_deploy.py "ORDIbehesht1370#+"
#
# Or interactively:
#   python scripts/public_deploy.py
#   (it will prompt for the password)
# ============================================================
set -euo pipefail

REPO_URL="https://github.com/MajidAsghariTabrizi/majid-systems.git"
APP_DIR="/opt/majid-systems"
APP_PORT=3000
SERVICE_NAME="majid-systems"
SITE_NAME="quantiviq"
HOST="171.22.24.45"
USER="root"

log()  { printf "\n\033[1;36m==>\033[0m %s\n" "$*"; }
warn() { printf "\n\033[1;33m[warn]\033[0m %s\n" "$*"; }
err()  { printf "\n\033[1;31m[err]\033[0m %s\n" "$*" >&2; }

# ---- 1. Remote: install Node 20 LTS if missing ----------------
log "Ensuring Node.js 20 LTS on $HOST"
$SSH "$HOST" bash -s <<REMOTE
set -e
if ! command -v node >/dev/null 2>&1 || [[ "\$(node -v 2>/dev/null)" != v20.* && "\$(node -v 2>/dev/null)" != v2[1-9].* ]]; then
  echo "  installing Node 20 via NodeSource"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v
REMOTE

# ---- 2. Remote: clone / pull repo ------------------------------
log "Cloning or pulling $REPO_URL -> $APP_DIR"
$SSH "$HOST" bash -s <<REMOTE
set -e
mkdir -p "$APP_DIR"
chown -R root:root "$APP_DIR" || true
if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR"
  git fetch --prune origin
  git reset --hard origin/main
else
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"
git log --oneline -3
REMOTE

# ---- 3. Remote: install + build --------------------------------
log "Installing dependencies (production) and building"
$SSH "$HOST" bash -s <<REMOTE
set -e
cd "$APP_DIR"
rm -rf .next
if ! npm ci --omit=dev 2>&1 | tail -5; then
  echo "  npm ci failed, falling back to npm install --omit=dev"
  npm install --omit=dev
fi
echo "--- build ---"
npm run build 2>&1 | tail -20
REMOTE

# ---- 4. Remote: write systemd service --------------------------
log "Writing systemd unit /etc/systemd/system/${SERVICE_NAME}.service"
$SSH "$HOST" bash -s <<REMOTE
set -e
cat > /etc/systemd/system/${SERVICE_NAME}.service <<'UNIT'
[Unit]
Description=Majid Systems Portfolio (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
Environment=NEXT_PUBLIC_SITE_URL=https://quantiviq.xyz
Environment=NEXT_PUBLIC_GITHUB_USER=MajidAsghariTabrizi
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p ${APP_PORT}
Restart=on-failure
RestartSec=5s
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now ${SERVICE_NAME}.service
sleep 4
systemctl --no-pager --full status ${SERVICE_NAME}.service | head -15
REMOTE

# ---- 5. Remote: copy nginx site config -------------------------
log "Uploading nginx site nginx/${SITE_NAME}.conf -> /etc/nginx/sites-available/${SITE_NAME}"
scp "$(dirname "$0")/../nginx/${SITE_NAME}.conf" "$HOST:/etc/nginx/sites-available/${SITE_NAME}"
$SSH "$HOST" bash -s <<REMOTE
set -e
# remove legacy / duplicate configs that cause "conflicting server name" warnings
rm -f /etc/nginx/sites-enabled/${SITE_NAME}.bak
rm -f /etc/nginx/sites-enabled/${SITE_NAME}.bak-pre-portfolio
rm -f /etc/nginx/sites-available/${SITE_NAME}.bak-pre-portfolio
ln -sf /etc/nginx/sites-available/${SITE_NAME} /etc/nginx/sites-enabled/${SITE_NAME}
nginx -t
systemctl reload nginx
REMOTE

# ---- 5b. Ensure Let's Encrypt cert covers apex + www -----------
log "Ensuring Let's Encrypt cert covers quantiviq.xyz and www.quantiviq.xyz"
$SSH "$HOST" bash -s <<REMOTE
set -e
if sudo certbot certificates 2>/dev/null | grep -A4 "quantiviq.xyz-0002" | grep -q "www.quantiviq.xyz"; then
  echo "  cert already covers www.quantiviq.xyz"
else
  echo "  expanding cert to include www.quantiviq.xyz"
  sudo certbot certonly --webroot -w /var/www/html \\
    -d quantiviq.xyz -d www.quantiviq.xyz \\
    --expand --non-interactive --agree-tos -m admin@quantiviq.xyz 2>&1 | tail -5
fi
REMOTE

# ---- 6. Remote: smoke tests ------------------------------------
log "Smoke tests"
$SSH "$HOST" bash -s <<REMOTE
set -e
echo "PORTFOLIO (via HTTPS, Host: quantiviq.xyz):"
for r in / /work /work/phoenix /about /contact /sitemap.xml /robots.txt /manifest.webmanifest; do
  code=\$(curl -sk -o /dev/null -w '%{http_code}' -H 'Host: quantiviq.xyz' "https://127.0.0.1\$r")
  printf "  %-30s -> %s\n" "\$r" "\$code"
done
echo
echo "SMARTTRADER (preserved at /smart-trader/):"
for r in /smart-trader/ /smart-trader/dashboard /smart-trader/landing /smart-trader/login /smart-trader/api/owner/status /smart-trader/static/css/owner.css; do
  code=\$(curl -sk -o /dev/null -w '%{http_code}' -H 'Host: quantiviq.xyz' "https://127.0.0.1\$r")
  printf "  %-40s -> %s\n" "\$r" "\$code"
done
echo
echo "Portfolio title: \$(curl -sk -H 'Host: quantiviq.xyz' https://127.0.0.1/ | grep -oE '<title>[^<]+</title>' | head -1)"
REMOTE

log "Public deployment complete"
log "Public URL: https://quantiviq.xyz/"
log "SmartTrader: https://quantiviq.xyz/smart-trader/"
