#!/usr/bin/env python3
"""Build Form Atlas offline. Python 3 standard library; no network or package install."""
import argparse,csv,hashlib,json,re,zipfile,os,tempfile,html
from pathlib import Path
from native_gallery import render_gallery
R=Path(__file__).resolve().parent.parent
INDEX=R/'data/library.json'
def path(value):
 if not isinstance(value,str) or not value or '\\' in value or '\0' in value:raise ValueError('Invalid path')
 p=Path(value)
 if p.is_absolute() or '..' in p.parts or len(p.parts)>7 or any(x.startswith('.') for x in p.parts):raise ValueError('Unsafe path')
 return p
def load():return json.loads(INDEX.read_text('utf8'))
def ingest(items,file):
 staged=[];known={str(x['id']) for x in items};new=[]
 with zipfile.ZipFile(file) as z:
  names=z.namelist()
  if len(names)!=len(set(names)) or any(z.getinfo(n).flag_bits&1 for n in names):raise ValueError('Duplicate or encrypted files')
  for n in names:path(n)
  if sum(z.getinfo(n).file_size for n in names)>200_000_000:raise ValueError('Patch exceeds 200 MB')
  if 'patch.json' not in names or z.testzip() is not None:raise ValueError('Missing manifest or corrupt ZIP')
  cfg=json.loads(z.read('patch.json'))
  if cfg.get('app')!='FORM' or cfg.get('schema_version')!=3:raise ValueError('Invalid update pack')
  entries=cfg.get('entries')
  if not isinstance(entries,list) or not 1<=len(entries)<=500:raise ValueError('Import 1–500 entries per pack')
  for x in entries:
   id=x.get('id');title=x.get('title');tags=x.get('tags') or []
   if not isinstance(id,str) or not re.fullmatch('user-[a-z0-9-]{8,64}',id) or id in known:raise ValueError('Duplicate or invalid ID')
   if not isinstance(title,str) or not 2<=len(title)<=110 or not isinstance(tags,list) or not all(isinstance(t,str) for t in tags):raise ValueError('Invalid title or tags')
   pr=path(x.get('prompt_file'))
   if str(pr) not in names or pr.suffix.lower() not in ('.md','.txt'):raise ValueError('Missing Markdown')
   content=z.read(str(pr));prompt=content.decode('utf8')
   if not 40<=len(prompt) or len(content)>2_000_000:raise ValueError('Invalid prompt size')
   pd=Path('PROMPTS/08-Personal')/(id+'.md');staged.append((pd,content))
   ip=path(x.get('visual'))
   if str(ip) not in names or ip.suffix.lower() not in ('.webp','.jpeg','.jpg','.png','.svg'):raise ValueError('Missing image')
   content=z.read(str(ip))
   if len(content)>5_000_000:raise ValueError('Image exceeds 5 MB')
   if ip.suffix.lower()=='.svg' and any(t in content.lower() for t in (b'<script',b'javascript:',b'onload=')):raise ValueError('Unsafe SVG')
   dest=Path('IMAGES')/(id+ip.suffix.lower());staged.append((dest,content));pv=None
   if x.get('video'):
    vp=path(x['video'])
    if str(vp) not in names or vp.suffix.lower() not in ('.mp4','.webm'):raise ValueError('Missing/unsupported video')
    content=z.read(str(vp))
    if len(content)>25_000_000:raise ValueError('Video exceeds 25 MB')
    if vp.suffix.lower()=='.mp4' and b'ftyp' not in content[:64]:raise ValueError('Invalid MP4 header')
    pv=Path('VIDEO')/(id+vp.suffix.lower());staged.append((pv,content))
   new.append({'id':id,'title':title,'category':x.get('category','Personal'),'collection':'08-Personal','prompt_file':str(pd),'visual':str(dest),'visual_type':'study-reconstruction' if ip.suffix.lower()=='.svg' else 'user-supplied','tags':tags,'chars':len(prompt),'video':str(pv) if pv else None,'media_role':'preview','media_status':'personal','access':'personal','provider':'Personal','added_batch':'personal'})
   known.add(id)
 # Finish validation before writing any files.
 for dest,content in staged:
  target=R/dest
  if target.exists():raise ValueError('Destination already exists: '+str(dest))
 for dest,content in staged:
  target=R/dest;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(content)
 items.extend(new);INDEX.write_text(json.dumps(items,indent=2,ensure_ascii=False))
def render(items):
 data=[]
 for x in items:
  v=dict(x);v['prompt']=(R/path(x['prompt_file'])).read_text('utf8')
  if x.get('code_file'):v['code']=(R/path(x['code_file'])).read_text('utf8')
  if x.get('demo_file'):v['demo_html']=(R/path(x['demo_file'])).read_text('utf8')
  if not (R/path(x['visual'])).is_file():raise ValueError('Missing image: '+x['visual'])
  if x.get('full_image') and not (R/path(x['full_image'])).is_file():raise ValueError('Missing full image: '+x['full_image'])
  if x.get('video') and not (R/path(x['video'])).is_file():raise ValueError('Missing video: '+x['video'])
  data.append(v)
 template=(R/'builder/template.html').read_text('utf8')
 feature=json.loads((R/'data/feature.json').read_text('utf8'))
 selected=next(x for x in items if x['id']==feature['reference_id'])
 for key in ('video','poster'):
  if not (R/path(feature[key])).is_file():raise ValueError('Missing featured '+key)
 values={'ID':str(selected['id']),'TITLE':selected.get('display_title') or selected['title'],'DESCRIPTION':feature['description'],'VIDEO':feature['video'],'MOBILE_VIDEO':feature.get('mobile_video',feature['video']),'POSTER':feature['poster']}
 for key,value in values.items():template=template.replace('__FEATURED_'+key+'__',html.escape(value,quote=True))
 if not template.count('__CSS__')==template.count('__DATA__')==template.count('__JS__')==1:raise ValueError('Invalid template')
 template=template.replace('__CSS__','\n'.join((R/('builder/'+name)).read_text('utf8') for name in ['base.css','ui.css'])).replace('__DATA__',json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')).replace('__JS__','\n'.join((R/('builder/'+name)).read_text('utf8') for name in ['clipboard.js','content_loader.js','featured_playback.js','app.js']))
 (R/'START_HERE.html').write_text(template,'utf8');(R/'CATALOG.json').write_text(json.dumps(items,indent=2,ensure_ascii=False))
 with (R/'INDEX.csv').open('w',encoding='utf8',newline='') as f:
  w=csv.writer(f);w.writerow(['ID','Title','Category','Collection','Prompt','Image','Video','Visual provenance','Media role','Source access','Provider','Code','Demo','License'])
  for x in data:w.writerow([x['id'],x['title'],x['category'],x['collection'],x['prompt_file'],x['visual'],x.get('video') or '',x['visual_type'],x.get('media_role') or 'still',x.get('access','unverified'),x.get('provider',''),x.get('code_file',''),x.get('demo_file',''),x.get('license','')])
 with (R/'ACCESS_CATALOG.csv').open('w',encoding='utf8',newline='') as f:
  w=csv.writer(f);w.writerow(['ID','Title','Provider','Source access','Access model','Bundled code license','Publisher component license','Source title','Source ID','Access conditions','Archived access flag','Evidence method','Checked on'])
  for x in items:
   e=x.get('access_evidence',{});w.writerow([x['id'],x.get('display_title') or x['title'],x.get('provider',''),x.get('access','unverified'),e.get('access_model',''),x.get('license',''),e.get('source_license',''),e.get('source_title',''),e.get('source_id',''),e.get('conditions',''),e.get('archived_access',''),e.get('method','MIT source license' if x.get('license') else 'Unknown'),e.get('checked_on','')])
 return len(data)
def files():
 excluded={'.git','.vercel','dist','node_modules','__pycache__'}
 return sorted(f for f in R.rglob('*') if f.is_file() and not excluded.intersection(f.relative_to(R).parts) and f.suffix!='.pyc')
def manifest():
 d={str(f.relative_to(R)):hashlib.sha256(f.read_bytes()).hexdigest() for f in files() if f.name!='MANIFEST_SHA256.json'}
 (R/'MANIFEST_SHA256.json').write_text(json.dumps(d,indent=2))
def main():
 p=argparse.ArgumentParser();p.add_argument('--patch',action='append',default=[]);p.add_argument('--output');a=p.parse_args();items=load()
 for f in a.patch:ingest(items,f)
 n=render(items);render_gallery(R,items);manifest()
 if a.output:
  dest=Path(a.output).resolve()
  if dest.is_relative_to(R):raise ValueError('Write the output ZIP outside the archive folder')
  fd,temporary_name=tempfile.mkstemp(prefix='form-atlas-build-',suffix='.tmp',dir=dest.parent)
  os.close(fd);temporary=Path(temporary_name)
  try:
   with zipfile.ZipFile(temporary,'w',zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=False) as z:
    for f in files():z.write(f,'Form_Atlas/'+str(f.relative_to(R)))
   with zipfile.ZipFile(temporary) as z:
    if z.testzip() is not None:raise ValueError('Archive CRC verification failed')
    if sum(n.startswith('Form_Atlas/PROMPTS/') and n.endswith('.md') for n in z.namelist())!=len(items):raise ValueError('Prompt count mismatch')
    hashes=json.loads(z.read('Form_Atlas/MANIFEST_SHA256.json'))
    for name,digest in hashes.items():
     if hashlib.sha256(z.read('Form_Atlas/'+name)).hexdigest()!=digest:raise ValueError('Checksum mismatch: '+name)
   with temporary.open('rb') as completed:os.fsync(completed.fileno())
   os.replace(temporary,dest)
  finally:
   temporary.unlink(missing_ok=True)
  print('ARCHIVE VERIFIED',n,'entries',round(dest.stat().st_size/1048576,2),'MiB',flush=True)
 else:print('RENDERED',n,flush=True)
if __name__=='__main__':main()
