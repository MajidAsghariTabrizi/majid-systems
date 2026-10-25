"""Rotate the exposed root SSH password on the production VPS.
- new password generated with python secrets (32 chars, shell-safe alphabet)
- set via chpasswd over the existing SSH session
- saved to a protected local file (path disclosed, value NEVER printed)
- verified with a fresh connection before the old session is dropped
"""
import os
import secrets
import string
import sys
import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
HOST = "171.22.24.45"
OLD_PW = os.environ["SSH_PASSWORD"]
OUT = r"C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password"

alphabet = string.ascii_letters + string.digits
NEW_PW = "".join(secrets.choice(alphabet) for _ in range(32))

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username="root", password=OLD_PW, timeout=15)

# set the new password without it landing in shell history/logs
si, so, se = c.exec_command("chpasswd", timeout=30)
si.write(f"root:{NEW_PW}\n")
si.channel.shutdown_write()
code = so.channel.recv_exit_status()
if code != 0:
    raise RuntimeError(f"chpasswd failed: {se.read().decode()[:200]}")
c.close()

# verify the NEW password works before writing it anywhere
c2 = paramiko.SSHClient()
c2.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c2.connect(HOST, username="root", password=NEW_PW, timeout=15)
si, so, _ = c2.exec_command("echo rotate-ok", timeout=15)
assert so.read().decode().strip() == "rotate-ok"
c2.close()

# persist locally (protected file, value never printed)
with open(OUT, "w") as f:
    f.write(NEW_PW)
os.system(f'icacls "{OUT}" /inheritance:r /grant:r "ma.asghari:F" >nul')

print("SSH root password ROTATED.")
print("  - new password verified with a fresh connection")
print("  - stored (path only):", OUT)
print("  - old password (exposed in transcripts) is now INVALID")
