#!/usr/bin/env python3
"""Quick SSH helper for the user to run commands on 171.22.24.45."""
import os, sys, getpass, paramiko
HOST, USER, PORT = "171.22.24.45", "root", 22
pw = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SSH_PASSWORD")
if not pw: pw = getpass.getpass(f"SSH password for {USER}@{HOST}: ")
cmd = " ".join(sys.argv[2:]) or "whoami && hostname"
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, port=PORT, username=USER, password=pw, timeout=10, banner_timeout=10, auth_timeout=10)
si, so, se = c.exec_command(cmd, timeout=120)
print(so.read().decode("utf-8", errors="replace"), end="")
err = se.read().decode("utf-8", errors="replace")
if err: print(err, file=sys.stderr, end="")
c.close()
