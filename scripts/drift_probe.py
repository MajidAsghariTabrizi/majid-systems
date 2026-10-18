"""Read-only drift probe: deployed git revision + service health."""
import os
import sys
import importlib.util

spec = importlib.util.spec_from_file_location("pd", os.path.join("scripts", "public_deploy.py"))
pd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pd)

pw = os.environ.get("SSH_PASSWORD")
if not pw:
    print("NO_SSH_PASSWORD")
    sys.exit(1)

client = pd.connect(pw)
try:
    pd.run(
        client,
        "bash -c 'cd /opt/majid-systems && git log --oneline -2 && "
        "systemctl is-active majid-systems && "
        "curl -sk -H \"Host: quantiviq.xyz\" https://127.0.0.1/api/lead'",
    )
finally:
    client.close()
