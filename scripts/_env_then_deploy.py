import io, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
sftp = a.open_sftp()
with sftp.open('/opt/majid-systems/.env.production', 'w') as f:
    f.write('NEXT_PUBLIC_UMAMI_WEBSITE_ID=24264632-11ad-4bcf-a899-82ebbe58f77a' + chr(10))
print('env written', flush=True)
_, so, _ = a.exec_command('cat /opt/majid-systems/.env.production; ls -la /opt/majid-systems/.env.production | awk \'' + chr(39) + '{print $1}' + chr(39) + '\'', timeout=30)
print(so.read().decode())
a.close()