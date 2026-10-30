import os, paramiko, sys
KEY = os.path.expanduser('~/.ssh/trader_vps')
cl = paramiko.SSHClient(); cl.set_missing_host_key_policy(paramiko.AutoAddPolicy())
cl.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)
def run(cmd, timeout=900):
    _, so, se = cl.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8','replace'); err = se.read().decode('utf-8','replace')
    code = so.channel.recv_exit_status()
    print('>> ' + cmd[:90]); print((out + err).strip()[:600]); print('exit', code)
    return code, out
run('export PATH=/opt/node/bin:$PATH; which corepack && corepack --version')
run('export PATH=/opt/node/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0; corepack enable 2>&1 | head -2; corepack prepare yarn@4.9.2 --activate 2>&1 | tail -2')
run('export PATH=/opt/node/bin:$PATH; yarn --version; cd /opt/umami && grep packageManager package.json')
cl.close()