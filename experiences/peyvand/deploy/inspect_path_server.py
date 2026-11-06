from pathlib import Path
import json
from inspect_infrastructure import connect
c=connect()
try:
 _,o,e=c.exec_command('cat /etc/nginx/sites-available/quantiviq',timeout=20)
 b=o.read();err=e.read();code=o.channel.recv_exit_status()
 if code:raise RuntimeError(err.decode())
 (Path(__file__).parent/'main-nginx-inspection.conf').write_bytes(b)
 for i,line in enumerate(b.decode().splitlines(),1):
  if any(s in line for s in ['server {','server_name','listen ','location ','include ','proxy_pass','root ','}']):print(f'{i}: {line}')
finally:c.close()
