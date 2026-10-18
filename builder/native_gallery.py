"""Script-free companion gallery generated from the current local catalog."""
import html

def render_gallery(root, items):
    css="body{font:15px/1.6 Arial;background:#101112;color:#f2f3ec;margin:0;padding:24px;max-width:1300px;margin:auto}a{color:#d6bc8d}h1{font-weight:400;letter-spacing:-1px;font-size:36px}header{margin-bottom:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px}article{min-width:0}img{width:100%;aspect-ratio:1.45;object-fit:contain;background:#000;border-radius:7px}video{width:100%;aspect-ratio:1.45;background:#000;border-radius:7px;object-fit:contain}h2{font-size:14px;font-weight:500}p{font-size:12px;color:#a9afa4}small{color:#a9afa4;font-size:11px}details{margin-top:12px}summary{cursor:pointer;color:#d6bc8d}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.8 monospace}"
    videos=[x for x in items if x.get('video')]
    rows=[]
    for x in videos:
        title=html.escape(x.get('display_title',x['title'])); vp=html.escape(x['video'],quote=True); image=html.escape(x['visual'],quote=True); prompt=html.escape(x['prompt_file'],quote=True)
        kind='Recorded local code demonstration' if x.get('demo_file') else 'Source background footage' if x.get('media_role')=='background' else 'Source design preview'
        text=html.escape((root/x['prompt_file']).read_text('utf8'))
        rows.append(f'<article><img loading="lazy" src="{image}" alt="{title}"><h2>{title}</h2><details name="atlas-preview"><summary>Watch preview</summary><video controls playsinline muted preload="none" poster="{image}" src="{vp}"></video></details><small>{kind} · #{html.escape(str(x["id"]))}</small><p><a href="{vp}">Open MP4 directly</a> · <a href="{prompt}">Prompt .md</a></p><details><summary>Read prompt</summary><pre>{text}</pre></details></article>')
    head='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Form Atlas — Video gallery</title><style>'+css+'</style><body>'
    header=f'<header><a href="START_HERE.html">← Full atlas</a><h1>The moving collection.</h1><p>{len(videos)} local clips · Native playback controls · No JavaScript required. Source footage and recorded component demonstrations are labeled separately.</p></header>'
    (root/'VIDEO_GALLERY.html').write_text(head+header+'<main>'+''.join(rows)+'</main></body></html>','utf8')
