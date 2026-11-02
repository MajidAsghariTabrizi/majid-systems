import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')
pw = open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password').read().strip()
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('171.22.24.45', username='root', password=pw)
token = open(r'C:\Users\ma.asghari\.dsh\var\qv-admin.token').read().strip()
cmds = [
  'tail -1 /opt/majid-systems/.data/leads.jsonl',
  'ls -la /opt/majid-systems/.data/ | tail -5',
  'tail -1 /opt/majid-systems/.data/outbox.jsonl 2>/dev/null | head -c 400',
]
for cmd in cmds:
    _, o, e = c.exec_command(cmd)
    print(o.read().decode() or e.read().decode())
_, o, _ = c.exec_command('curl -s -H "x-admin-token: %s" http://127.0.0.1:3000/api/admin/requests | head -c 500' % token)
print('ADMIN:', o.read().decode())
c.close()