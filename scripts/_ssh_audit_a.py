import io, sys, paramiko
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('171.22.24.45', port=22, username='root', password=pw, timeout=15)
cmds = [
  ('os', 'uname -a && cat /etc/os-release | head -2'),
  ('res', 'nproc; free -m | head -2; df -h / | tail -1; uptime'),
  ('io', 'iostat -x 1 2 2>/dev/null | tail -8 || vmstat 1 2 | tail -3'),
  ('services', 'systemctl list-units --type=service --state=running --no-pager --no-legend | awk \'{print $1}\''),
  ('timers', 'systemctl list-timers --no-pager --no-legend 2>/dev/null | head -15'),
  ('ports', 'ss -tlnp | awk \'NR==1 || /LISTEN/' ),
  ('fw', 'ufw status verbose 2>/dev/null | head -20; iptables -L INPUT -n 2>/dev/null | head -12'),
  ('nginx', 'nginx -v 2>&1; ls /etc/nginx/sites-enabled/ 2>/dev/null; ls /etc/nginx/conf.d/ 2>/dev/null'),
  ('nginxsite', 'grep -R -h "server_name\|listen\|proxy_pass\|location" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | grep -v "^\s*#" | head -60'),
  ('certs', 'certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains|Expiry" | head -12'),
  ('docker', 'docker --version 2>/dev/null; docker ps --format "{{.Names}} {{.Image}} {{.Ports}}" 2>/dev/null | head'),
  ('app', 'cd /opt/majid-systems 2>/dev/null && git log -1 --format="%h %s" && systemctl is-active majid-systems'),
  ('logtail', 'journalctl -u majid-systems -n 3 --no-pager 2>/dev/null | tail -3'),
  ('sshauth', 'grep -E "^(PasswordAuthentication|PermitRootLogin|PubkeyAuthentication)" /etc/ssh/sshd_config'),
  ('analytic', 'ls /opt 2>/dev/null; ls /root 2>/dev/null | head'),
  ('crawlgrep', 'grep -R "GPTBot\|OAI\|ChatGPT\|noindex\|robots" /etc/nginx/ 2>/dev/null | grep -v "^\s*#" | head -10'),
  ('acme', 'systemctl list-timers --no-pager 2>/dev/null | grep -i -E "certbot|acme"'),
  ('bhistory', 'last -n 5 2>/dev/null | head -6'),
]
for tag, cmd in cmds:
    si, so, se = c.exec_command(cmd, timeout=60)
    out = so.read().decode('utf-8', 'replace').strip(); err = se.read().decode('utf-8', 'replace').strip()
    print('===== ' + tag + ' =====')
    print(out[:2200] if out else ('(stderr) ' + err[:400] if err else '(empty)'))
c.close()