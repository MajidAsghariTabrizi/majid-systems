#!/usr/bin/env python3
"""scripts/check-dual-vps-safety.py - G5: read-only dual-VPS safety snapshot.
Server A (website) + Server B (trading + analytics). Compares trader service
states, memory/load, analytics resource ceilings. Exits non-zero on trader regression."""
import io, os, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
TRADER = ['trader-vnext-predict', 'trader-market', 'trader-micro', 'trader-watchdog', 'trader-brain', 'm23-opportunity-shadow']
fails = []
KEYB = os.path.expanduser('~/.ssh/trader_vps')
b = paramiko.SSHClient(); b.set_missing_host_key_policy(paramiko.AutoAddPolicy())
b.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEYB), timeout=25, look_for_keys=False, allow_agent=False)
def brun(cmd):
    _, so, _ = b.exec_command(cmd, timeout=120)
    return so.read().decode('utf-8', 'replace')
states = {}
for line in brun('for s in ' + ' '.join(TRADER) + '; do echo $s=$(systemctl is-active $s); done').split():
    k, _, v = line.partition('=')
    states[k] = v
for s in TRADER:
    ok = states.get(s) == 'active'
    print(('PASS' if ok else 'FAIL') + ' trader service ' + s + '=' + states.get(s, '?'))
    if not ok: fails.append(s)
up = brun('uptime; free -m | head -2; systemctl show umami -p MemoryCurrent -p MemoryMax; systemctl is-active umami umami-tunnel 2>/dev/null || true')
print('--- B health ---'); print(up.strip())
b.close()
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
_, so, _ = a.exec_command('uptime; systemctl is-active majid-systems umami-tunnel; free -m | head -2; curl -s -o /dev/null -w "site:%{http_code}" https://quantiviq.xyz/en', timeout=120)
print('--- A health ---'); print(so.read().decode('utf-8', 'replace').strip())
a.close()
if fails:
    print('SAFETY CHECK FAILED: ' + ', '.join(fails)); sys.exit(1)
print('DUAL-VPS SAFETY: PASS')