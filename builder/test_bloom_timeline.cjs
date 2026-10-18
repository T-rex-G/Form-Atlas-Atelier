'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const helper=path.join(__dirname,'bloom_timeline.cjs');
// Baseline adapter exercises the original recording function before its repair.
const original=fs.readFileSync(path.join(__dirname,'render_bloom.cjs'),'utf8');
const timeline=fs.existsSync(helper)?require(helper):vm.runInNewContext(original.match(/const keys=\[[\s\S]*?function progress\(t\)\{[^\n]+/)[0]+';({progress,seconds:34,fps:30})');
test('Bloom moves continuously without a hold at section boundaries',()=>{
 let previous=timeline.progress(0);
 for(let frame=1;frame<timeline.seconds*timeline.fps;frame++){
  const p=timeline.progress(frame/timeline.fps);
  assert(p>previous,'Motion stops at frame '+frame);
  previous=p;
 }
});
test('Bloom recording follows original 24 fps footage at native speed',()=>{
 assert.equal(timeline.fps,24);
 assert.equal(timeline.seconds,24);
 for(let frame=1;frame<576;frame++){
  const delta=(timeline.progress((frame+.5)/24)-timeline.progress((frame-.5)/24))*576;
  assert(Math.abs(delta-1)<1e-9,'Each output frame advances exactly one original footage frame');
 }
});
