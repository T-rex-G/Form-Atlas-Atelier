#!/usr/bin/env node
'use strict';
// Export the verified offline build using Node's standard library only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST_SHA256.json'),'utf8'));
const directories=new Set(['IMAGES','FULL_IMAGES','VIDEO','FONTS','BOARDS','PROMPTS','CODE','DEMOS','SOURCE','SOURCE_AUDIT']);
function safe(name){const parts=name.split('/');if(path.isAbsolute(name)||name.includes('\\')||parts.some(p=>p==='..'||p==='.'||!p))throw Error('Unsafe manifest path');return path.join(root,...parts);}
// A stale prebuilt page must fail the web build instead of silently ignoring edits.
for(const [name,expected] of Object.entries(manifest)){
  const bytes=fs.readFileSync(safe(name));
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Changed file: '+name+'. Run python3 builder/build.py, verify, then commit the rebuilt files.');
}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
let copied=0;
for(const name of Object.keys(manifest)){
  const parts=name.split('/');
  if(!(directories.has(parts[0])||(parts.length===1&&/\.(?:html|md|csv|json)$/i.test(name))))continue;
  const target=path.join(out,...parts);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(safe(name),target);copied++;
}
fs.copyFileSync(path.join(out,'START_HERE.html'),path.join(out,'index.html'));
console.log('STATIC EXPORT VERIFIED · '+copied+' files · dist/index.html');
