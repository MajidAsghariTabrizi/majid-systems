import io, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
sftp = a.open_sftp()
with sftp.open('/root/.umami-mcp-key') as f: key = f.read().decode().strip()
with open(r'C:\Users\ma.asghari\.dsh\var\umami-mcp.key', 'w') as f: f.write(key)
print('KEY_LEN=' + str(len(key)), 'PREFIX=' + key[:14])
a.close()