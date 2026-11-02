import io, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
def runA(cmd, t=240):
    _, so, se = a.exec_command(cmd, timeout=t)
    return (so.read().decode('utf-8','replace') + se.read().decode('utf-8','replace')).strip()
CUT = '01/Nov/2026:08:20:00'
q = '"' + chr(92) + '"'  # escaped double quote for awk string
flt = 'zcat -f /var/log/nginx/access.log /var/log/nginx/access.log.1 /var/log/nginx/access.log.2.gz 2>/dev/null | awk ' + q + 'substr($4,2,20) >= ' + q + chr(92) + q + CUT + chr(92) + q + q + chr(39)
# write filter once, reuse
a.exec_command('true')
_, so, _ = a.exec_command('echo ok'); so.read()
base = 'zcat -f /var/log/nginx/access.log /var/log/nginx/access.log.1 /var/log/nginx/access.log.2.gz 2>/dev/null | sed -n s/^//p'
# do it with python-side filtering instead: pull the raw window once
_, so, se = a.exec_command('zcat -f /var/log/nginx/access.log /var/log/nginx/access.log.1 /var/log/nginx/access.log.2.gz 2>/dev/null | grep -v smart-trader | grep -v docs-market', timeout=240)
raw = so.read().decode('utf-8', 'replace')
def after_cut(ts):  # ts like 01/Nov/2026:08:20:00
    d, rest = ts.split(':', 1)
    day, mon, yr = d.split('/')
    if mon != 'Nov' or int(yr) != 2026: return False
    if int(day) > 1: return True
    return rest >= '08:20:00'
lines = [l for l in raw.splitlines() if len(l.split(' ')) > 12 and after_cut(l.split(' ')[3][1:])]
print('LINES_SINCE_CUT', len(lines))
sends = [l for l in lines if 'POST /_q/api/send' in l]
scripts = [l for l in lines if 'GET /_q/script.js' in l]
print('SENDS', len(sends), 'SCRIPT_HITS', len(scripts))
bots = [l for l in lines if any(x in l for x in ('Googlebot','OAI-SearchBot','ChatGPT-User','GPTBot','ClaudeBot','bingbot','AhrefsBot','SemrushBot','MJ12bot','PetalBot','YandexBot','DotBot','facebookexternalhit','HeadlessChrome'))]
print('BOT_REQS', len(bots))
import collections
bc = collections.Counter()
for l in bots:
    for x in ('Googlebot','OAI-SearchBot','ChatGPT-User','GPTBot','ClaudeBot','bingbot','AhrefsBot','SemrushBot','MJ12bot','PetalBot','YandexBot','DotBot','facebookexternalhit','HeadlessChrome'):
        if x in l: bc[x] += 1
print('BOT_BREAKDOWN', dict(bc))
human = [l for l in lines if l not in bots]
html = [l for l in human if ' GET /' in l and ('Mozilla/5.0' in l) and l.split(' ')[8] == '200']
print('HUMAN_200_HTML', len(html))
for l in html[-12:]: print('H', l.split(' ')[3], l.split(' ')[6][:50], l.split(' ')[-1][:40])
for l in sends[-8:]: print('S', l.split(' ')[3], l.split(' ')[8], l.split(' ')[-1][:40])
import collections as C2
uac = C2.Counter()
for l in lines:
    if l in bots: continue
    ua = l.rsplit(' "', 1)[-1][:70]
    uac[ua] += 1
print('NONBOT_UA_TOP', uac.most_common(8))
paths = C2.Counter()
for l in lines:
    if l in bots: continue
    paths[l.split(' ')[6][:34]] += 1
print('NONBOT_PATH_TOP', paths.most_common(8))
a.close()