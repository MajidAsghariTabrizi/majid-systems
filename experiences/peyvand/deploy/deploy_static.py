"""Independent, guarded PEYVAND static hosting; never deploys the main application.

  python deploy_static.py --inspect
  python deploy_static.py --stage C:/absolute/export/out --release <hex-id>
  python deploy_static.py --activate-http <hex-id>
  python deploy_static.py --activate-path <hex-id>
  python deploy_static.py --verify-path
  python deploy_static.py --enable-tls <hex-id>
  python deploy_static.py --verify-host

The existing SSH password is read into memory, never command arguments or output.
"""
from __future__ import annotations

import argparse, hashlib, io, json, re, shlex, sys, tarfile, time
from html.parser import HTMLParser
from pathlib import Path
import paramiko

HOST = '171.22.24.45'
HERE = Path(__file__).resolve().parent
REMOTE = r'''
from pathlib import Path
import base64, datetime, fcntl, hashlib, io, json, os, re, socket, subprocess, sys, tarfile, time, urllib.request
os.umask(0o022)
ROOT=Path('/var/www/peyvand'); DOMAIN='peyvand.quantiviq.xyz'
SITE=Path('/etc/nginx/sites-available/peyvand'); ENABLED=Path('/etc/nginx/sites-enabled/peyvand'); HEADERS=Path('/etc/nginx/snippets/peyvand-headers.conf')
MAIN_SITE=Path('/etc/nginx/sites-available/quantiviq'); PATH_SNIPPET=Path('/etc/nginx/snippets/peyvand-location.conf')
PATH_INCLUDE=b'    # PEYVAND independent static experience\n    include /etc/nginx/snippets/peyvand-location.conf;\n'
MODE,RELEASE=sys.argv[1:3]
PAYLOAD=json.loads(sys.stdin.readline())
def require(v,msg):
 if not v:raise RuntimeError(msg)
def run(args,timeout=30):
 p=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
 if p.returncode:raise RuntimeError('Command failed: '+' '.join(args)+'\n'+p.stderr.decode(errors='replace')[-1000:])
 return p.stdout.decode(errors='replace').strip()
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def status(name):
 p=subprocess.run(['systemctl','is-active',name],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 return p.stdout.decode().strip()
def protected():
 sites={str(p):digest(p)for p in Path('/etc/nginx/sites-enabled').glob('*')if p.is_file()and p.name!='peyvand'}
 return {'main_head':run(['git','-C','/opt/majid-systems','rev-parse','HEAD']),'main_env_sha256':digest('/opt/majid-systems/.env.production'),'main_unit_sha256':hashlib.sha256(subprocess.check_output(['systemctl','cat','majid-systems'])).hexdigest(),'other_enabled_nginx':sites,'main_build_id':Path('/opt/majid-systems/.next/BUILD_ID').read_text().strip()}
def main_health():
 require(status('majid-systems')=='active','Main service inactive')
 for route in ['/en','/fa','/en/mind']:
  req=urllib.request.Request('http://127.0.0.1:3000'+route,headers={'Host':'quantiviq.xyz'})
  with urllib.request.urlopen(req,timeout=10)as r:require(r.status==200,'Main route unhealthy')
def host_health():
 req=urllib.request.Request('http://127.0.0.1/',headers={'Host':DOMAIN})
 with urllib.request.urlopen(req,timeout=10)as r:
  b=r.read();require(r.status==200 and b'noindex'in b,'Invalid PEYVAND page');require('noindex'in r.headers.get('X-Robots-Tag',''),'No robot header');return {'status':r.status,'bytes':len(b),'robots':r.headers.get('X-Robots-Tag')}
def safe_root():
 require(not ROOT.is_symlink(),'Static root must not be symlink')
 ROOT.mkdir(mode=0o755,parents=True,exist_ok=True)
 (ROOT/'releases').mkdir(mode=0o755,exist_ok=True)
def release_path():
 require(re.fullmatch('[0-9a-f]{12,64}',RELEASE),'Release must be12–64 lowercase hex characters')
 p=ROOT/'releases'/RELEASE;require(not p.is_symlink(),'Release path is a symlink');return p
def write(p,b):
 temp=p.with_name(p.name+'.peyvand-tmp');temp.write_bytes(b);os.chmod(temp,0o644);os.replace(temp,p)
def restore_file(p,old):
 if old is None:p.unlink(missing_ok=True)
 else:write(p,old)
def point_to(target):
 link=ROOT/'current';temp=ROOT/'current.peyvand-tmp'
 require(not link.exists()or link.is_symlink(),'Current root must be symlink')
 temp.unlink(missing_ok=True);temp.symlink_to(target);os.replace(temp,link)
def path_request(path):
 p=subprocess.run(['curl','--silent','--show-error','--http1.1','--noproxy','*','--max-time','15','--resolve','quantiviq.xyz:443:127.0.0.1','--dump-header','-','https://quantiviq.xyz'+path],stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=20)
 require(p.returncode==0,'HTTPS path request failed:'+p.stderr.decode(errors='replace')[-300:])
 header,body=p.stdout.split(b'\r\n\r\n',1);code=int(header.splitlines()[0].split()[1]);return code,header.decode(),body
def path_health():
 code,headers,body=path_request('/peyvand/')
 title=re.search(rb'<title>([^<]{0,300})</title>',body,re.I)
 location=next((line.split(':',1)[1].strip()for line in headers.splitlines()if line.lower().startswith('location:')),'(none)')
 detail='status='+str(code)+', bytes='+str(len(body))+', title='+(title.group(1).decode(errors='replace')if title else'(none)')+', location='+location
 require(code==200 and b'noindex'in body,'Invalid path HTML ('+detail+')');require('x-robots-tag: noindex'in headers.lower(),'Missing path noindex header ('+detail+')')
 rel=(ROOT/'current').resolve();manifest=json.loads((rel/'verified-manifest.json').read_text())['files'];assets=[]
 for suffix in ['.css','.js','.woff2']:
  matches=sorted(p for p in manifest if p.endswith(suffix));require(matches,'Missing staticasset'+suffix)
  p=matches[0];s,h,b=path_request('/peyvand/'+p);require(s==200 and len(b)>20,'Static path asset failed:'+p);assets.append({'path':'/peyvand/'+p,'status':s})
 bad,_,bad_body=path_request('/peyvand/path-that-does-not-exist');require(bad==404,'Unknown proposal path must return404');require('این مسیر'.encode()in bad_body,'404 body must bePersian')
 redirect,redirect_headers,_=path_request('/peyvand');require(redirect==308 and '/peyvand/'in redirect_headers,'Canonical pathredirect missing')
 return {'url':'https://quantiviq.xyz/peyvand/','html_status':code,'bytes':len(body),'assets':assets,'unknown_path_status':bad,'canonical_redirect':redirect,'normal_certificate_validation':True}
def activate_path():
 rel=release_path();require((rel/'verified-manifest.json').is_file(),'Release wasnotstaged');require(not ENABLED.exists(),'Subdomain site mustremaininactive forpathdeployment')
 old_target=(ROOT/'current').resolve()if(ROOT/'current').is_symlink()else None
 old_main=MAIN_SITE.read_bytes();old_snippet=PATH_SNIPPET.read_bytes()if PATH_SNIPPET.exists()else None;old_headers=HEADERS.read_bytes()if HEADERS.exists()else None
 require(old_snippet is None or b'# Managed PEYVAND standalone path.'in old_snippet,'Existing unmanaged proposalpathsnippet')
 require(old_headers is None or b'# Managed PEYVAND standalone headers.'in old_headers,'Existing unmanaged proposalheaders')
 anchor=b'    server_name quantiviq.xyz;\n';require(old_main.count(anchor)==1,'ExpectedoneapexHTTPSserveranchor')
 require(b'listen 443 ssl;'in old_main[old_main.rfind(b'server {',0,old_main.index(anchor)):old_main.index(anchor)],'Anchor isnotHTTPSserver')
 if PATH_INCLUDE in old_main:new_main=old_main
 else:
  require(b'peyvand-location.conf'not in old_main,'Unexpected existingproposalinclude');new_main=old_main.replace(anchor,anchor+b'\n'+PATH_INCLUDE,1)
 expected=json.loads(json.dumps(BASELINE));main_enabled='/etc/nginx/sites-enabled/quantiviq';require(main_enabled in expected['other_enabled_nginx'],'Expectedenabledmainconfig')
 expected['other_enabled_nginx'][main_enabled]=hashlib.sha256(new_main).hexdigest()
 try:
  point_to(rel);write(HEADERS,base64.b64decode(PAYLOAD['headers']));write(PATH_SNIPPET,base64.b64decode(PAYLOAD['path']));write(MAIN_SITE,new_main)
  run(['nginx','-t']);run(['systemctl','reload','nginx'])
  for attempt in range(6):
   try:health=path_health();break
   except RuntimeError:
    if attempt==5:raise
    time.sleep(.7)
  require(protected()==expected,'Changebeyondreviewedadditiveinclude');main_health()
  record={'mode':'path','release':RELEASE,'health':health,'main_application_unchanged':True,'nginx_change':'one additiveinclude inexistingapexHTTPSserver plusproposal-onlysnippets','main_nginx_sha256_before':hashlib.sha256(old_main).hexdigest(),'main_nginx_sha256_after':hashlib.sha256(new_main).hexdigest(),'completed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'previous_target':str(old_target)if old_target else None}
  (ROOT/'activation.json').write_text(json.dumps(record,indent=2));print(json.dumps(record),flush=True)
 except BaseException:
  write(MAIN_SITE,old_main);restore_file(PATH_SNIPPET,old_snippet);restore_file(HEADERS,old_headers)
  if old_target is None:(ROOT/'current').unlink(missing_ok=True)
  else:point_to(old_target)
  run(['nginx','-t']);run(['systemctl','reload','nginx']);require(protected()==BASELINE,'Mainchangedafterpathrollback');main_health();raise
def activate(tls=False):
 rel=release_path();require((rel/'verified-manifest.json').is_file(),'Release was not staged')
 old_target=(ROOT/'current').resolve()if(ROOT/'current').is_symlink()else None
 old_site=SITE.read_bytes()if SITE.exists()else None;old_headers=HEADERS.read_bytes()if HEADERS.exists()else None;old_link=ENABLED.is_symlink()
 require(not ENABLED.exists()or old_link,'Enabled PEYVAND file is not a managed symlink')
 if old_site is not None:require(b'# Managed PEYVAND standalone' in old_site,'Existing unmanaged PEYVAND site')
 if old_headers is not None:require(b'# Managed PEYVAND standalone headers.'in old_headers,'Existing unmanaged PEYVAND header snippet')
 try:
  point_to(rel)
  write(HEADERS,base64.b64decode(PAYLOAD['headers']))
  write(SITE,b'# Managed PEYVAND standalone\n'+base64.b64decode(PAYLOAD['https'if tls else'http']))
  if not old_link:ENABLED.symlink_to(SITE)
  run(['nginx','-t']);run(['systemctl','reload','nginx']);result=host_health()if not tls else {'https':'configuration active; verify external HTTPS separately'}
  require(protected()==BASELINE,'Protected main configuration changed');main_health()
  record={'mode':'https'if tls else'http','release':RELEASE,'host':DOMAIN,'health':result,'main_unchanged':True,'completed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'previous_target':str(old_target)if old_target else None}
  (ROOT/'activation.json').write_text(json.dumps(record,indent=2));print(json.dumps(record),flush=True)
 except BaseException:
  if not old_link:ENABLED.unlink(missing_ok=True)
  restore_file(SITE,old_site);restore_file(HEADERS,old_headers)
  if old_target is not None:point_to(old_target)
  else:(ROOT/'current').unlink(missing_ok=True)
  run(['nginx','-t']);run(['systemctl','reload','nginx']);require(protected()==BASELINE,'Main changed during rollback');main_health();raise
BASELINE=protected();main_health()
if MODE=='inspect':
 print(json.dumps({'mode':'inspect','protected':BASELINE,'main_active':True,'peyvand_root_exists':ROOT.exists(),'peyvand_enabled':ENABLED.exists(),'dns_addresses':sorted({x[4][0]for x in socket.getaddrinfo(DOMAIN,80)})if PAYLOAD.get('check_dns')else 'not queried'},indent=2));sys.exit(0)
if MODE=='verify':
 print(json.dumps({'host':DOMAIN,'http':host_health(),'main_unchanged':protected()==BASELINE,'main_active':True}));sys.exit(0)
if MODE=='verify-path':
 print(json.dumps({'mode':'verify-path','health':path_health(),'main_active':True,'protected':BASELINE}));sys.exit(0)
safe_root()
with(ROOT/'.deploy.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
 if MODE=='stage':
  rel=release_path();require(not rel.exists(),'Release already exists; use a new content id')
  rel.mkdir(mode=0o755)
  blob=base64.b64decode(PAYLOAD['archive']);require(hashlib.sha256(blob).hexdigest()==PAYLOAD['archive_sha256'],'Archive hash mismatch')
  with tarfile.open(fileobj=io.BytesIO(blob),mode='r:gz')as tf:
   for member in tf:
    parts=Path(member.name).parts
    require(not Path(member.name).is_absolute()and'..'not in parts and not member.issym()and not member.islnk(),'Unsafe archive member')
    dest=rel/member.name;require(dest.resolve().is_relative_to(rel.resolve()),'Archive escaped release')
    if member.isdir():dest.mkdir(parents=True,exist_ok=True);continue
    require(member.isfile(),'Only static regular files allowed');dest.parent.mkdir(parents=True,exist_ok=True)
    with tf.extractfile(member)as source:dest.write_bytes(source.read())
    os.chmod(dest,0o644)
  manifest=PAYLOAD['manifest'];require((rel/'index.html').is_file(),'No exported index')
  require('noindex'in(rel/'index.html').read_text(),'Missing noindex metadata')
  require((rel/'404.html').is_file(),'Persian exported404.html is required')
  for p,h in manifest.items():require(digest(rel/p)==h,'File hash mismatch:'+p)
  (rel/'verified-manifest.json').write_text(json.dumps({'release':RELEASE,'files':manifest,'archive_sha256':PAYLOAD['archive_sha256'],'protected':BASELINE,'staged_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2))
  require(protected()==BASELINE,'Main changed during static staging');main_health()
  print(json.dumps({'mode':'staged','release':RELEASE,'path':str(rel),'files':len(manifest),'main_unchanged':True}),flush=True)
 elif MODE=='http':activate(False)
 elif MODE=='path':activate_path()
 elif MODE=='tls':
  addresses={x[4][0]for x in socket.getaddrinfo(DOMAIN,80)}
  require(addresses=={'171.22.24.45'},'Public DNS must resolve only to171.22.24.45 before TLS issuance')
  require(ENABLED.exists(),'Activate dedicated HTTP host first for webroot challenge')
  acme=ROOT/'acme';acme.mkdir(mode=0o755,exist_ok=True)
  run(['certbot','certonly','--non-interactive','--webroot','-w',str(acme),'-d',DOMAIN,'--cert-name',DOMAIN,'--keep-until-expiring'],timeout=180)
  cert=Path('/etc/letsencrypt/live')/DOMAIN/'fullchain.pem';require(cert.is_file(),'Dedicated certificate missing')
  run(['openssl','x509','-in',str(cert),'-checkhost',DOMAIN,'-noout']);activate(True)
 else:raise RuntimeError('Unsupported deployment mode')
'''

class MetadataCheck(HTMLParser):
 def __init__(self):super().__init__();self.fa=False;self.robots=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.fa=a.get('lang')=='fa'and a.get('dir')=='rtl'
  if tag=='meta'and a.get('name')=='robots':self.robots=a.get('content','')

def connection():
 c=paramiko.SSHClient();c.load_system_host_keys();c.load_host_keys(str(Path.home()/'.ssh/known_hosts'));c.set_missing_host_key_policy(paramiko.RejectPolicy())
 password=(Path.home()/'.dsh/var/quantiviq-ssh.password').read_text(encoding='utf-8').strip()
 try:c.connect(HOST,username='root',password=password,timeout=20,banner_timeout=20,auth_timeout=20,look_for_keys=False,allow_agent=False)
 finally:password=None
 return c

def main():
 p=argparse.ArgumentParser(description=__doc__,formatter_class=argparse.RawDescriptionHelpFormatter);g=p.add_mutually_exclusive_group(required=True)
 g.add_argument('--inspect',action='store_true');g.add_argument('--stage',type=Path);g.add_argument('--activate-http',metavar='RELEASE');g.add_argument('--activate-path',metavar='RELEASE');g.add_argument('--enable-tls',metavar='RELEASE');g.add_argument('--verify-host',action='store_true');g.add_argument('--verify-path',action='store_true');p.add_argument('--release')
 a=p.parse_args();mode='inspect'if a.inspect else'verify-path'if a.verify_path else'verify'if a.verify_host else'stage'if a.stage else'path'if a.activate_path else'http'if a.activate_http else'tls';release=a.release or a.activate_path or a.activate_http or a.enable_tls or'-'
 payload={}
 if mode in ['stage','http','tls','path']:
  if not re.fullmatch('[0-9a-f]{12,64}',release):p.error('Provide a12–64 lowercase hex release id')
  import base64
  for key,filename in [('http','peyvand.http.conf'),('https','peyvand.https.conf'),('headers','peyvand-headers.conf'),('path','peyvand-location.conf')]:payload[key]=base64.b64encode((HERE/filename).read_bytes()).decode()
 if a.stage:
  source=a.stage.resolve();require=source.is_dir()and(source/'index.html').is_file()
  if not require:p.error('Stage requires a complete static export containing index.html')
  check=MetadataCheck();check.feed((source/'index.html').read_text(encoding='utf-8'))
  if not check.fa or not all(x in check.robots for x in ['noindex','nofollow']):p.error('Export must have Persian RTL HTML and noindex,nofollow metadata')
  if not(source/'404.html').is_file():p.error('Export must include the isolated Persian404.html')
  missing=MetadataCheck();missing.feed((source/'404.html').read_text(encoding='utf-8'))
  if not missing.fa:p.error('404 export must use Persian RTL HTML')
  files=sorted(x for x in source.rglob('*')if x.is_file())
  if any(x.is_symlink()or x.name.startswith('.env')for x in files):p.error('Static export contains a symlink/environment file')
  manifest={x.relative_to(source).as_posix():hashlib.sha256(x.read_bytes()).hexdigest()for x in files}
  buf=io.BytesIO()
  with tarfile.open(fileobj=buf,mode='w:gz')as tf:
   for x in files:tf.add(x,arcname=x.relative_to(source).as_posix(),recursive=False)
  blob=buf.getvalue()
  if len(blob)>50*1024*1024:p.error('Static archive exceeds the50MiB safety budget')
  payload.update(archive=base64.b64encode(blob).decode(),archive_sha256=hashlib.sha256(blob).hexdigest(),manifest=manifest)
 c=connection()
 try:
  command='python3 -c '+shlex.quote(REMOTE)+' '+shlex.quote(mode)+' '+shlex.quote(release)
  i,o,e=c.exec_command(command,timeout=300);i.write(json.dumps(payload)+'\n');i.flush();i.channel.shutdown_write()
  channel=o.channel
  while True:
   if channel.recv_ready():sys.stdout.write(channel.recv(65536).decode('utf-8',errors='replace'));sys.stdout.flush()
   if channel.recv_stderr_ready():sys.stderr.write(channel.recv_stderr(65536).decode('utf-8',errors='replace'));sys.stderr.flush()
   if channel.exit_status_ready()and not channel.recv_ready()and not channel.recv_stderr_ready():break
   time.sleep(.1)
  return channel.recv_exit_status()
 finally:c.close()

if __name__=='__main__':raise SystemExit(main())
