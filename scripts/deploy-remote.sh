#!/usr/bin/env bash
# ============================================================
# majid-systems remote deploy script
# ----------------------------------------------------
# Idempotent. Designed to be run by a non-root deploy user
# (`phoenix`) with sudo NOPASSWD on a fresh Ubuntu 24.04 host.
#
# Usage (from any host that can SSH to the target):
#   ssh -t phoenix@<host> 'bash -s' < scripts/deploy-remote.sh
#
# Or run interactively on the target after `cd /opt/majid-systems`.
# ============================================================
set -euo pipefail

REPO_URL="https://github.com/MajidAsghariTabrizi/majid-systems.git"
APP_DIR="/opt/majid-systems"
SERVICE_NAME="majid-systems"
APP_PORT=3000
DOMAIN="quantiviq.xyz"
LE_EMAIL="${LE_EMAIL:-admin@quantiviq.xyz}"

log() { printf "\n\033[1;36m==>\033[0m %s\n" "$*"; }
warn() { printf "\n\033[1;33m[warn]\033[0m %s\n" "$*"; }
err()  { printf "\n\033[1;31m[err]\033[0m %s\n" "$*" >&2; }

# ---- 1. Root-only prerequisites (idempotent) --------------------
if [[ $EUID -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo -E"
fi

log "Ensuring base packages"
$SUDO apt-get update -y
$SUDO apt-get install -y nginx certbot python3-certbot-nginx

# Node.js 20 LTS via NodeSource (idempotent — script is no-op if present)
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v 2>/dev/null)" != v20.* && "$(node -v 2>/dev/null)" != v2[1-9].* ]]; then
  log "Installing Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
  $SUDO apt-get install -y nodejs
fi
node -v
npm -v

# ---- 2. App directory + ownership ------------------------------
log "Preparing ${APP_DIR}"
$SUDO mkdir -p "$APP_DIR"
$SUDO chown -R "$(id -un)":"$(id -gn)" "$APP_DIR"

# ---- 3. Clone / pull the repo ----------------------------------
if [[ -d "$APP_DIR/.git" ]]; then
  log "Pulling latest"
  git -C "$APP_DIR" fetch --prune origin
  git -C "$APP_DIR" reset --hard origin/main
else
  log "Cloning"
  git clone "$REPO_URL" "$APP_DIR"
fi

# ---- 4. Install + build ----------------------------------------
log "Installing dependencies (production)"
cd "$APP_DIR"
# Wipe any stale caches / partial builds
rm -rf .next node_modules
npm ci --omit=dev

log "Building"
npm run build

# ---- 5. systemd unit -------------------------------------------
log "Ensuring systemd unit /etc/systemd/system/${SERVICE_NAME}.service"
UNIT=/etc/systemd/system/${SERVICE_NAME}.service
if [[ ! -f "$UNIT" ]]; then
  $SUDO tee "$UNIT" >/dev/null <<EOF
[Unit]
Description=Majid Systems Portfolio (Next.js)
After=network.target

[Service]
Type=simple
User=$(id -un)
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
Environment=NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
Environment=NEXT_PUBLIC_GITHUB_USER=MajidAsghariTabrizi
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p ${APP_PORT}
Restart=on-failure
RestartSec=5s
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=${APP_DIR}/.next

[Install]
WantedBy=multi-user.target
EOF
  $SUDO systemctl daemon-reload
fi
$SUDO systemctl enable --now ${SERVICE_NAME}.service
sleep 3
$SUDO systemctl --no-pager --full status ${SERVICE_NAME}.service | head -20 || true

# ---- 6. nginx site (idempotent) -------------------------------
log "Writing nginx site /etc/nginx/sites-available/quantiviq"
$SUDO tee /etc/nginx/sites-available/quantiviq >/dev/null <<'NGINX'
server {
    listen 80;
    server_name quantiviq.xyz www.quantiviq.xyz;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name quantiviq.xyz www.quantiviq.xyz;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "interest-cohort=()" always;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
$SUDO ln -sf /etc/nginx/sites-available/quantiviq /etc/nginx/sites-enabled/quantiviq
$SUDO rm -f /etc/nginx/sites-enabled/default
$SUDO nginx -t
$SUDO systemctl reload nginx

# ---- 7. TLS cert via Let's Encrypt (only when DNS is correct) -
if $SUDO certbot certificates 2>/dev/null | grep -q "No certificates found"; then
  log "Attempting Let's Encrypt certificate"
  if ! $SUDO certbot --nginx \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --non-interactive --agree-tos -m "$LE_EMAIL" --redirect 2>&1 | tail -20; then
    warn "Certbot failed. Most likely cause: DNS for ${DOMAIN} does not yet point to this host."
    warn "Update the A records at the registrar to $(curl -4 -s https://ifconfig.me) and re-run:"
    warn "    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${LE_EMAIL} --redirect"
  fi
fi

# ---- 8. Smoke tests -------------------------------------------
log "Smoke tests"
curl -s -o /dev/null -w "  http://127.0.0.1:${APP_PORT}/            -> %{http_code}\n" "http://127.0.0.1:${APP_PORT}/"
curl -s -o /dev/null -w "  http://127.0.0.1:${APP_PORT}/work/phoenix -> %{http_code}\n" "http://127.0.0.1:${APP_PORT}/work/phoenix"
curl -s -o /dev/null -w "  http://127.0.0.1:${APP_PORT}/sitemap.xml  -> %{http_code}\n" "http://127.0.0.1:${APP_PORT}/sitemap.xml"

log "Done"
echo
echo "Public site (after DNS):  https://${DOMAIN}"
echo "App internal port:        127.0.0.1:${APP_PORT}"
echo "Logs:                     sudo journalctl -u ${SERVICE_NAME}.service -f"