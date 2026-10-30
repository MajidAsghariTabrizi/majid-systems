import io, paramiko
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('171.22.24.45', port=22, username='root', password=pw, timeout=15)
cmds = [
  ('vantage', 'for u in / /en /fa /robots.txt /sitemap.xml /en/mind /en/insights; do code=$(curl -s -o /dev/null -w "%{http_code} %{time_total}s %{size_download}b" --resolve quantiviq.xyz:443:127.0.0.1 https://quantiviq.xyz$u); echo "$u -> $code"; done'),
  ('botlog', 'ls /var/log/nginx/ | head; for f in /var/log/nginx/access.log /var/log/nginx/quantiviq/access.log; do [ -f $f ] && echo "== $f" && tail -n 50000 $f | grep -o -i -E "Googlebot|Bingbot|GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|PerplexityBot|Amazonbot|applebot|YandexBot" | sort | uniq -c | sort -rn | head -12; done'),
  ('recent_googlebot', 'grep -h Googlebot /var/log/nginx/access.log 2>/dev/null | tail -5; grep -h Googlebot /var/log/nginx/quantiviq/access.log 2>/dev/null | tail -5'),
  ('logformat', 'grep -R "log_format\|access_log" /etc/nginx/nginx.conf /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^\s*#" | head -6'),
  ('verify_gb', 'for ip in $(grep -h -o -E "^([0-9.]+)" <(grep -h Googlebot /var/log/nginx/access.log 2>/dev/null | tail -50) | sort -u | head 3); do host $ip; done 2>/dev/null | head -5'),
]
for tag, cmd in cmds:
    si, so, se = c.exec_command(cmd, timeout=90)
    out = so.read().decode('utf-8', 'replace').strip(); err = se.read().decode('utf-8', 'replace').strip()
    print('===== ' + tag + ' =====')
    print(out[:2400] if out else ('(stderr) ' + err[:300] if err else '(empty)'))
c.close()