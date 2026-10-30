#!/usr/bin/env python3
"""A-side: autossh tunnel A->B (key-restricted tunnel user), nginx /_q/
first-party proxy + stats server block, autossh service."""
import io, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
def run(cmd, timeout=300, check=True, label=''):
    print('>> ' + (label or cmd[:90]), flush=True)
    si, so, se = a.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8', 'replace'); err = se.read().decode('utf-8', 'replace')
    code = so.channel.recv_exit_status()
    print((out.strip()[:900] if out.strip() else '') + ((' E ' + err.strip()[:300]) if err.strip() else ''), flush=True)
    if check and code != 0: print(f'!! FAILED {code} at {label}', flush=True); sys.exit(1)
    return out
# 1) dedicated tunnel key on A
run('test -f /root/.ssh/umami_tunnel || ssh-keygen -t ed25519 -N "" -C umami-tunnel -f /root/.ssh/umami_tunnel', label='tunnel-key')
pub = run('cat /root/.ssh/umami_tunnel.pub', label='pub').strip()
# 2) authorize on B (restricted: forward to 127.0.0.1:3001 only, from A only) - via B key from A? no: use local B key from workstation
print('PUBKEY=' + pub, flush=True)
run('dpkg -s autossh >/dev/null 2>&1 || DEBIAN_FRONTEND=noninteractive apt-get install -y -qq autossh', timeout=600, label='autossh-install')
# 3) autossh systemd service
unit = '''[Unit]
Description=Umami analytics tunnel to stats backend (A->B, key auth)
After=network-online.target
Wants=network-online.target

[Service]
User=root
ExecStart=/usr/bin/autossh -M 0 -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=accept-new -i /root/.ssh/umami_tunnel -L 127.0.0.1:3010:127.0.0.1:3001 tunnel@87.107.152.67
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
'''
run("mkdir -p /etc/systemd/system && cat > /etc/systemd/system/umami-tunnel.service <<'UNIT'\n" + unit + "UNIT", label='tunnel-unit')
# 4) nginx: /_q proxy + stats server block (activated when DNS lands)
nq = '''
# --- Quantiviq first-party analytics proxy (2026-10-30) ---
# script: cacheable; send: never cached; both fail OPEN (short timeouts)
location = /_q/script.js {
    proxy_pass http://127.0.0.1:3010/script.js;
    proxy_connect_timeout 3s;
    proxy_read_timeout 5s;
    proxy_intercept_errors off;
    add_header Cache-Control "public, max-age=3600, stale-while-revalidate=86400";
    add_header X-Robots-Tag "noindex" always;
}
location /_q/ {
    proxy_pass http://127.0.0.1:3010/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_connect_timeout 3s;
    proxy_read_timeout 10s;
    proxy_intercept_errors off;
    client_max_body_size 64k;
}
'''
run("mkdir -p /etc/nginx/snippets && cat > /etc/nginx/snippets/quantiviq-analytics.conf <<'NQ'\n" + nq + "NQ", label='nginx-snippet')
run("grep -q 'include snippets/quantiviq-analytics.conf' /etc/nginx/sites-enabled/quantiviq || sed -i 's|location / {\\n|&|' /etc/nginx/sites-enabled/quantiviq; python3 - <<'PY'\nimport re,io\np='/etc/nginx/sites-enabled/quantiviq'\ns=io.open(p).read()\nif 'quantiviq-analytics.conf' not in s:\n    s=s.replace('location / {', 'include snippets/quantiviq-analytics.conf;\\n\\n    location / {', 1)\n    io.open(p,'w').write(s)\n    print('included')\nelse:\n    print('already')\nPY", label='nginx-include')
stats = '''
# stats.quantiviq.xyz dashboard (activated when owner adds DNS A -> 171.22.24.45)
server {
    listen 443 ssl;
    server_name stats.quantiviq.xyz;
    ssl_certificate /etc/letsencrypt/live/quantiviq.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quantiviq.xyz/privkey.pem;
    add_header X-Robots-Tag "noindex, nofollow" always;
    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 3s;
        proxy_read_timeout 20s;
    }
}
'''
run("cat > /etc/nginx/sites-available/stats-quantiviq <<'ST'\n" + stats + "ST\nln -sf /etc/nginx/sites-available/stats-quantiviq /etc/nginx/sites-enabled/stats-quantiviq", label='stats-block')
run('nginx -t 2>&1 && systemctl reload nginx && echo RELOADED', label='nginx-reload')
print('A-SIDE PREP COMPLETE (tunnel key + service + nginx). Authorize pubkey on B next.', flush=True)
a.close()