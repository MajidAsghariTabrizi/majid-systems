#!/usr/bin/env bash
# ============================================================
# majid-systems: enable HTTPS once DNS is pointing here
# Run this AFTER updating the A record at the registrar.
# ============================================================
set -euo pipefail

DOMAIN="quantiviq.xyz"
LE_EMAIL="${LE_EMAIL:-admin@quantiviq.xyz}"

# ---- 0. Verify DNS points to this server ----
THIS_IP=$(curl -4 -s --max-time 8 https://ifconfig.me)
DNS_IP=$(getent hosts "$DOMAIN" | awk '{print $1}' | head -1)
echo "This server public IP:  $THIS_IP"
echo "DNS resolves $DOMAIN to: $DNS_IP"
if [[ "$DNS_IP" != "$THIS_IP" ]]; then
  echo "ERROR: DNS does not point to this server. Update the A record first." >&2
  exit 1
fi

# ---- 1. Get the certificate (HTTP-01) ----
sudo certbot --nginx \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos -m "$LE_EMAIL" --redirect

# ---- 2. Rewrite nginx to terminate TLS + proxy to app ----
cat > /tmp/quantiviq-ssl.conf <<'NGINX'
server {
    listen 80;
    listen [::]:80;
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
    listen [::]:443 ssl http2;
    server_name quantiviq.xyz www.quantiviq.xyz;

    ssl_certificate /etc/letsencrypt/live/quantiviq.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quantiviq.xyz/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "interest-cohort=()" always;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

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

sudo cp /tmp/quantiviq-ssl.conf /etc/nginx/sites-available/quantiviq
sudo nginx -t
sudo systemctl reload nginx

# ---- 3. Smoke test ----
echo "=== HTTPS smoke test ==="
curl -s -o /dev/null -w "  https://${DOMAIN}/         -> %{http_code}\n" "https://${DOMAIN}/"
curl -s -o /dev/null -w "  https://${DOMAIN}/work     -> %{http_code}\n" "https://${DOMAIN}/work"
curl -s -o /dev/null -w "  https://${DOMAIN}/sitemap  -> %{http_code}\n" "https://${DOMAIN}/sitemap.xml"

echo "DONE: HTTPS enabled for $DOMAIN"
