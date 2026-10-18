#!/usr/bin/env node
'use strict';
// Export the verified offline build using Node's standard library only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST_SHA256.json'),'utf8'));
// Vercel reserializes its config before running the build. Compare that one
// file structurally; retain byte-level verification for all library content.
const expectedVercelConfig={"$schema":"https://openapi.vercel.sh/vercel.json","framework":null,"installCommand":"","buildCommand":"node builder/export_static.cjs","outputDirectory":"dist","headers":[{"source":"/(.*)","headers":[{"key":"X-Content-Type-Options","value":"nosniff"},{"key":"Referrer-Policy","value":"no-referrer"},{"key":"Cache-Control","value":"private, no-store"}]}]};
const directories=new Set(['IMAGES','FULL_IMAGES','VIDEO','FONTS','BOARDS','PROMPTS','CODE','DEMOS','SOURCE','SOURCE_AUDIT']);
function safe(name){const parts=name.split('/');if(path.isAbsolute(name)||name.includes('\\')||parts.some(p=>p==='..'||p==='.'||!p))throw Error('Unsafe manifest path');return path.join(root,...parts);}
// A stale prebuilt page must fail the web build instead of silently ignoring edits.
for(const [name,expected] of Object.entries(manifest)){
  const bytes=fs.readFileSync(safe(name));
  if(name==='vercel.json'){
    const actual=JSON.parse(bytes.toString('utf8'));
    if(!require('node:util').isDeepStrictEqual(actual,expectedVercelConfig))throw Error('Changed Vercel configuration: '+JSON.stringify(actual));
    continue;
  }
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
