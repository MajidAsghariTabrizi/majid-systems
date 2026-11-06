"""One-time source palette migration: plum ink, copper light, warm ivory.
Only source color tokens are transformed; no graphics/media are edited.
"""
from pathlib import Path
import colorsys,re
ROOT=Path(__file__).resolve().parents[1]
def pigment(m):
 token=m.group();raw=token[1:]
 if len(raw)not in[6,8]:return token
 r,g,b=[int(raw[i:i+2],16)/255 for i in [0,2,4]]
 h,l,s=colorsys.rgb_to_hls(r,g,b)
 if not 85<=h*360<=185:return token
 if l<.25:h,s=318/360,.20+min(s,.6)*.13
 elif l>.6:h,s=24/360,.78 if s>.25 else .2
 else:h,s=22/360,min(s,.33)
 rr=colorsys.hls_to_rgb(h,l,s)
 return '#'+''.join(f'{round(x*255):02x}'for x in rr)+raw[6:]
for name in ['app/peyvand.css','components/network.css','components/summary.css','components/EconomicNetwork.tsx','public/icon.svg']:
 p=ROOT/name;t=p.read_text(encoding='utf-8');t=re.sub(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b',pigment,t)
 t=t.replace('--pv-green','--pv-accent').replace('--net-green','--net-accent').replace("url('/fonts/","url('/peyvand/fonts/")
 p.write_text(t,encoding='utf-8')
