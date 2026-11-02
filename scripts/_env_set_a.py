import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')
pw = open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password').read().strip()
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('171.22.24.45', username='root', password=pw)
token = sys.argv[1]
cmd = 'grep -q LEAD_NOTIFY_EMAIL= /opt/majid-systems/.env.production || printf "\nLEAD_NOTIFY_EMAIL=tabrizi1991@gmail.com\nQV_ADMIN_TOKEN=%s\n" "$token" >> /opt/majid-systems/.env.production; grep -cE "LEAD_NOTIFY_EMAIL=|QV_ADMIN_TOKEN=" /opt/majid-systems/.env.production' % token
_, o, e = c.exec_command(cmd)
print('vars written:', o.read().decode().strip(), e.read().decode().strip())
_, o, _ = c.exec_command('systemctl restart majid-systems && sleep 3 && systemctl is-active majid-systems')
print('service:', o.read().decode().strip())
_, o, _ = c.exec_command('sleep 2; curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/en/solutions; echo; curl -s http://127.0.0.1:3000/api/lead')
print('local-after-restart:', o.read().decode().strip())
# trading services safety
_, o, _ = c.exec_command('ssh -i /root/.ssh/trader_vps -o StrictHostKeyChecking=no root@87.107.152.67 "systemctl is-active umami" 2>/dev/null || echo skip')
print('umami (B):', o.read().decode().strip())
c.close()