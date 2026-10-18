'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const entries=html=>JSON.parse(html.match(/<script id="embedded" type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]);

// A return to copying the offline archive as the web entry must fail this budget.
test('hosted entry transfers under 250 KB with Brotli compression',()=>{
 const html=read('dist/index.html');
 const bytes=zlib.brotliCompressSync(html).length;
 assert(bytes<250000,'Hosted entry is '+bytes+' compressed bytes; budget is 250000');
});
test('hosted catalog has all references without eager prompt, code or demo bodies',()=>{
 const all=entries(read('dist/index.html'));
 assert.equal(all.length,865);
 assert(all.every(x=>typeof x.prompt==='undefined'&&typeof x.code==='undefined'&&typeof x.demo_html==='undefined'),'Do not embed full reference bodies in the hosted entry');
 for(const x of all){
  assert.match(x.content_url,/^assets\/[a-f0-9]{16}\/references\/.+\.json$/);
  const full=JSON.parse(read('dist/'+x.content_url));
  assert.equal(full.id,x.id);
  assert.equal(full.prompt,read(full.prompt_file));
  if(full.code_file)assert.equal(full.code,read(full.code_file));
  if(full.demo_file)assert.equal(full.demo_html,read(full.demo_file));
 }
});
test('offline entry keeps all complete text without network fetches',()=>{
 const all=entries(read('START_HERE.html'));
 assert.equal(all.length,865);
 assert(all.every(x=>typeof x.prompt==='string'&&x.prompt.length>0));
});
test('the JavaScript warning exists only inside noscript',()=>{
 for(const name of ['dist/index.html','START_HERE.html']){
  const html=read(name);
  const body=html.replace(/<noscript>[\s\S]*?<\/noscript>/g,'');
  assert(!body.includes('id="viewerNotice"'),name+' must never cover a loading app with a JavaScript-disabled warning');
 }
});
test('saved theme is applied before the first styled paint',()=>{
 const html=read('builder/template.html'),match=html.match(/<script id="themeBootstrap">([\s\S]*?)<\/script>/);
 assert(match,'Apply the saved theme before parsing the large catalog');
 assert(html.indexOf(match[0])<html.indexOf('<style>'));
 for(const [theme,light,expected] of [['light',false,'light'],['dark',true,'dark'],['system',true,'light'],['system',false,'dark']]){
  const document={documentElement:{dataset:{theme:'dark'}},querySelector:()=>({content:''})};
  vm.runInNewContext(match[1],{document,localStorage:{getItem:()=>JSON.stringify({theme})},matchMedia:()=>({matches:light})});
  assert.equal(document.documentElement.dataset.theme,expected);
 }
 vm.runInNewContext(match[1],{document:{documentElement:{dataset:{}}},localStorage:{getItem:()=>{throw Error('Storage blocked');}}});
});
