'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const name of ['START_HERE.html','dist/index.html']){
 test(name+': Bloom exports only one icon-only playback control',()=>{
  const html=fs.readFileSync(path.join(root,name),'utf8');
  const hero=html.match(/<section id="featuredReference"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert(hero,'The featured reference must exist');
  const controls=[...hero.matchAll(/<button\b[^>]*aria-label="(?:Play|Pause|Retry) Bloom preview"[^>]*>/g)];
  assert.equal(controls.length,1,'Keep one corner playback control, with no central fallback button');
  const control=hero.match(/<button\b[^>]*id="featuredMotion"[^>]*>([\s\S]*?)<\/button>/)?.[1];
  assert.equal(control?.replace(/<[^>]*>/g,'').trim(),'','The corner control must not have a visible text label');
  const video=hero.match(/<video\b[^>]*>/)?.[0];
  for(const attribute of ['autoplay','muted','loop','playsinline'])assert.match(video,new RegExp('\\s'+attribute+'(?:\\s|>)'));
  assert(!/\scontrols(?:\s|=|>)/.test(video),'Native player controls must stay off in the hero');
 });
}
