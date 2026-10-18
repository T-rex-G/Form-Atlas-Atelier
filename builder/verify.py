#!/usr/bin/env python3
"""Verify the catalog, embedded text, referenced files and complete manifest.

Optional --baseline compares unchanged content/media against a supplied Atlas ZIP.
"""
import argparse, collections, csv, hashlib, json, re, zipfile
from pathlib import Path

R=Path(__file__).resolve().parent.parent
def digest(content):return hashlib.sha256(content).hexdigest()
def check(condition,message):
    if not condition:raise ValueError(message)
def safe(name):
    p=Path(name)
    check(not p.is_absolute() and '..' not in p.parts and '\\' not in name,'Unsafe file path: '+name)
    return R/p
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--baseline');args=parser.parse_args()
    items=json.loads((R/'data/library.json').read_text());ids=[x['id'] for x in items]
    check(len(ids)==len(set(ids)),'Duplicate reference IDs')
    check(json.loads((R/'CATALOG.json').read_text())==items,'Generated catalog differs from source')
    summary=json.loads((R/'SOURCE_AUDIT/SUMMARY.json').read_text())
    counts=dict(collections.Counter(x['access'] for x in items))
    check(summary['access_counts']==counts,'Audit counts differ from catalog')
    text=(R/'START_HERE.html').read_text()
    match=re.search(r'<script id="embedded" type="application/json">(.*?)</script>',text,re.S)
    check(match is not None,'Embedded catalog missing')
    embedded={x['id']:x for x in json.loads(match[1])}
    check(set(embedded)==set(ids),'Embedded catalog IDs differ')
    for x in items:
        e=x.get('access_evidence',{})
        check(e.get('access')==x['access'] and e.get('method') and e.get('checked_on') and e.get('conditions'),'Missing access evidence: '+str(x['id']))
        if x['access']!='unverified':check(bool(e.get('source_id')),'Verified access has no source identity')
        if e.get('access_model')=='limited-free-copy':check(e.get('free_copy_allowance',0)>0 and e.get('copy_policy_checked_on'),'Missing free allowance evidence')
        for key in ['prompt_file','visual','video','full_image','code_file','demo_file','license_file']:
            if x.get(key):check(safe(x[key]).is_file(),'Missing '+key+': '+str(x['id']))
        check(embedded[x['id']]['prompt']==safe(x['prompt_file']).read_text(),'Truncated/changed embedded prompt: '+str(x['id']))
        if x.get('code_file'):check(embedded[x['id']]['code']==safe(x['code_file']).read_text(),'Changed embedded code: '+str(x['id']))
        if x.get('demo_file'):check(embedded[x['id']]['demo_html']==safe(x['demo_file']).read_text(),'Changed embedded demonstration: '+str(x['id']))
    with (R/'ACCESS_CATALOG.csv').open(newline='',encoding='utf8') as handle:rows=list(csv.DictReader(handle))
    check({r['ID'] for r in rows}=={str(x) for x in ids},'Access CSV differs from catalog IDs')
    check(dict(collections.Counter(r['Source access'] for r in rows))==counts,'Access CSV counts differ')
    manifest=json.loads((R/'MANIFEST_SHA256.json').read_text())
    for name,expected in manifest.items():check(digest(safe(name).read_bytes())==expected,'Checksum mismatch: '+name)
    baseline_count=0
    if args.baseline:
        protected={'PROMPTS','CODE','DEMOS','SOURCE','VIDEO','IMAGES','FULL_IMAGES','FONTS','BOARDS'}
        with zipfile.ZipFile(args.baseline) as old:
            for name in old.namelist():
                relative=Path(name).parts[1:]
                if not relative or relative[0] not in protected or name.endswith('/'):continue
                target=R.joinpath(*relative)
                check(target.is_file() and digest(target.read_bytes())==digest(old.read(name)),'Baseline content changed: '+name)
                baseline_count+=1
        check(sum(1 for _ in (R/'PROMPTS').rglob('*.md'))==len(items),'Prompt file count differs')
    print(json.dumps({'result':'PASS','references':len(items),'access':counts,'manifest_files':len(manifest),'baseline_files_unchanged':baseline_count},ensure_ascii=False))
if __name__=='__main__':main()
