#!/usr/bin/env node
'use strict';
// Verify the offline archive, then export a lightweight hosted entry.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST_SHA256.json'),'utf8'));
// Vercel reserializes its config before running the build. Compare that one
// file structurally; retain byte-level verification for all library content.
const expectedVercelConfig={"$schema":"https://openapi.vercel.sh/vercel.json","framework":null,"installCommand":"","buildCommand":"node builder/export_static.cjs","outputDirectory":"dist","headers":[{"source":"/(.*)","headers":[{"key":"X-Content-Type-Options","value":"nosniff"},{"key":"Referrer-Policy","value":"no-referrer"},{"key":"Cache-Control","value":"public, max-age=0, must-revalidate"}]},{"source":"/assets/(.*)","headers":[{"key":"Cache-Control","value":"public, max-age=31536000, immutable"}]},{"source":"/(IMAGES|FULL_IMAGES|VIDEO|FONTS)/(.*)","headers":[{"key":"Cache-Control","value":"public, max-age=86400"}]}]};
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
const offline=fs.readFileSync(path.join(out,'START_HERE.html'),'utf8');
const embedded=/<script id="embedded" type="application\/json">([\s\S]*?)<\/script>/;
const match=offline.match(embedded);if(!match)throw Error('Offline catalog missing');
const full=JSON.parse(match[1]);
const version=crypto.createHash('sha256').update(match[1]).digest('hex').slice(0,16);
const assetPath='assets/'+version,referencePath=assetPath+'/references';
fs.mkdirSync(path.join(out,referencePath),{recursive:true});
const catalog=full.map(entry=>{
 if(!/^[\w-]+$/.test(String(entry.id)))throw Error('Invalid reference ID');
 const content_url=referencePath+'/'+entry.id+'.json';
 fs.writeFileSync(path.join(out,content_url),JSON.stringify(entry));
 const {prompt,code,demo_html,...metadata}=entry;
 return {...metadata,content_url};
});
const searchPath=assetPath+'/search.json';
fs.writeFileSync(path.join(out,searchPath),JSON.stringify(full.map(x=>[x.id,x.prompt])));
const compact=JSON.stringify(catalog).replace(/</g,'\\u003c');
const hosted=offline.replace(embedded,()=>'<script id="embedded" type="application/json" data-search="'+searchPath+'">'+compact+'</script>');
fs.writeFileSync(path.join(out,'index.html'),hosted);
console.log('STATIC EXPORT VERIFIED · '+copied+' source files · '+catalog.length+' lazy references · hosted entry '+Buffer.byteLength(hosted)+' bytes');
