import sys, paramiko
sys.stdout.reconfigure(encoding='utf-8')
pw = open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password').read().strip()
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('171.22.24.45', username='root', password=pw)
cmds = [
  'systemctl cat majid-systems.service | grep -E "WorkingDirectory|EnvironmentFile|ExecStart"',
  'PRJ=$(systemctl show -p WorkingDirectory --value majid-systems.service); echo PRJ=$PRJ; ls -la $PRJ/.env* 2>/dev/null',
  'PRJ=$(systemctl show -p WorkingDirectory --value majid-systems.service); grep -hE "SMTP|LEAD_NOTIFY|QV_ADMIN|QV_LEAD|NEXT_PUBLIC_SITE" $PRJ/.env* 2>/dev/null | sed "s/=.*/=<set>/"',
  'PRJ=$(systemctl show -p WorkingDirectory --value majid-systems.service); ls $PRJ/.data 2>/dev/null && head -c 200 $PRJ/.data/leads.jsonl 2>/dev/null',
]
for cmd in cmds:
    _, o, e = c.exec_command(cmd)
    print('$ ' + cmd.split(chr(36))[-1][:60])
    print(o.read().decode() or e.read().decode())
c.close()