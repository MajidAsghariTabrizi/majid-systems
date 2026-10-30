import os, paramiko
HOST, PORT = '87.107.152.67', 22
KEY = os.path.expanduser('~/.ssh/trader_vps')
cl = paramiko.SSHClient(); cl.set_missing_host_key_policy(paramiko.AutoAddPolicy())
k = paramiko.Ed25519Key.from_private_key_file(KEY)
cl.connect(HOST, PORT, username='root', pkey=k, timeout=25, look_for_keys=False, allow_agent=False)
cmds = [
  ('os', 'uname -r; grep PRETTY /etc/os-release'),
  ('res', 'nproc; free -m | head -2; df -h / | tail -1; uptime'),
  ('loadhist', 'sar -q 2>/dev/null | tail -5 || true'),
  ('io', 'iostat -x 1 2 2>/dev/null | grep -E "^Device|vda|sda" | tail -4'),
  ('oom', 'journalctl -k --since "-14 days" 2>/dev/null | grep -i -c "out of memory" || true'),
  ('trader_units', 'systemctl list-units "trader*" "m23*" --type=service --state=running --no-pager --no-legend'),
  ('trader_timers', 'systemctl list-timers "*trader*" "*eval*" "*backup*" --no-pager --no-legend 2>/dev/null | head -12'),
  ('trader_health', 'for s in trader-vnext-predict trader-market trader-micro trader-watchdog trader-brain m23-opportunity-shadow; do printf "%s: %s\n" "$s" "$(systemctl is-active $s 2>/dev/null)"; done'),
  ('docker', 'docker --version 2>/dev/null && docker ps --format "{{.Names}} {{.Image}}" 2>/dev/null | head -8; docker network ls --format "{{.Name}}" 2>/dev/null'),
  ('docker_net', 'iptables -L DOCKER-USER -n 2>/dev/null | head -5; iptables -L DOCKER -n 2>/dev/null | head -8'),
  ('ports', 'ss -tlnp | head -20'),
  ('fw', 'ufw status 2>/dev/null | head -5'),
  ('to_a', 'ip route get 171.22.24.45 2>/dev/null; ping -c 2 -W 2 171.22.24.45 2>/dev/null | tail -2'),
  ('nginx_b', 'systemctl is-active nginx 2>/dev/null; nginx -v 2>&1 | head -1'),
  ('diskmax', 'df -h /var/lib 2>/dev/null | tail -1'),
]
for tag, cmd in cmds:
    si, so, se = cl.exec_command(cmd, timeout=90)
    out = so.read().decode('utf-8', 'replace').strip(); err = se.read().decode('utf-8', 'replace').strip()
    print('===== ' + tag + ' =====')
    print(out[:1800] if out else ('(stderr) ' + err[:300] if err else '(empty)'))
cl.close()