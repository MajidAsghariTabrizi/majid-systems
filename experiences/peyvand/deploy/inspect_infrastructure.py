"""Read-only PEYVAND infrastructure inspection. Credentials stay in memory."""
from pathlib import Path
import json, paramiko

HOST = '171.22.24.45'
REMOTE = r'''
from pathlib import Path
import datetime, hashlib, json, re, socket, subprocess
def run(args):
 p=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=20)
 return {'code':p.returncode,'stdout':p.stdout.decode(errors='replace').strip(),'stderr':p.stderr.decode(errors='replace').strip()[-500:]}
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
out={'inspected_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'host':'171.22.24.45','mode':'read-only','sites':[],'certificates':[]}
for p in sorted(Path('/etc/nginx/sites-enabled').glob('*')):
 if not p.is_file():continue
 text=p.read_text(); lines=[]
 for line in text.splitlines():
  if re.match(r'\s*(server_name|listen|ssl_certificate\s|root\s)',line):lines.append(line.strip())
 out['sites'].append({'path':str(p),'resolved':str(p.resolve()),'sha256':sha(p),'directives':lines})
for p in sorted(Path('/etc/letsencrypt/live').glob('*/cert.pem')):
 out['certificates'].append({'path':str(p),'public_certificate':run(['openssl','x509','-in',str(p),'-noout','-dates','-ext','subjectAltName'])})
out['nginx_test']=run(['nginx','-t'])
out['services']={s:run(['systemctl','is-active',s])['stdout'] for s in ['nginx','majid-systems','quantiviq-mind']}
out['main_head']=run(['git','-C','/opt/majid-systems','rev-parse','HEAD'])['stdout']
out['main_env_sha256']=sha('/opt/majid-systems/.env.production')
out['main_effective_unit_sha256']=hashlib.sha256(subprocess.check_output(['systemctl','cat','majid-systems'])).hexdigest()
out['certbot_available']=run(['which','certbot'])['code']==0
out['dns_credential_name_candidates']=[str(p)for root in ['/root/.config','/etc/letsencrypt','/root']if Path(root).is_dir()for p in Path(root).glob('*')if p.is_file()and re.search('parspack|dns|cloudflare',p.name,re.I)]
try:out['peyvand_addresses']=sorted({x[4][0]for x in socket.getaddrinfo('peyvand.quantiviq.xyz',443)})
except OSError as e:out['peyvand_dns_error']=str(e)
print(json.dumps(out,indent=2))
'''

def connect():
 c=paramiko.SSHClient();c.load_system_host_keys();c.load_host_keys(str(Path.home()/'.ssh/known_hosts'));c.set_missing_host_key_policy(paramiko.RejectPolicy())
 password=(Path.home()/'.dsh/var/quantiviq-ssh.password').read_text(encoding='utf-8').strip()
 try:c.connect(HOST,username='root',password=password,timeout=20,banner_timeout=20,auth_timeout=20,look_for_keys=False,allow_agent=False)
 finally:password=None
 return c

def inspect():
 c=connect()
 try:
  i,o,e=c.exec_command('python3 -',timeout=90);i.write(REMOTE);i.flush();i.channel.shutdown_write()
  raw=o.read();err=e.read().decode();code=o.channel.recv_exit_status()
  if code:raise RuntimeError(err)
  result=json.loads(raw)
  (Path(__file__).parent/'infrastructure-inspection.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
  print(json.dumps(result,indent=2))
 finally:c.close()

if __name__=='__main__':inspect()
