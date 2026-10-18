'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const helper=__dirname+'/content_loader.js';
function create(fetcher){assert(fs.existsSync(helper),'Reference content needs an on-demand loader');return require(helper).create(fetcher);}
const url='assets/0123456789abcdef/references/57.json';
test('opening a reference loads exact text once and preserves the catalog object',async()=>{
 let requests=0;
 const entry={id:57,content_url:url};
 const loader=create(async path=>{requests++;assert.equal(path,url);return {ok:true,json:async()=>({id:57,prompt:'Complete saved prompt',code_file:'CODE/a.js',code:'export const a=1;',demo_file:'DEMOS/a.html',demo_html:'<!doctype html><p>Live</p>'})};});
 const [a,b]=await Promise.all([loader.load(entry),loader.load(entry)]);
 assert.equal(a,entry);assert.equal(b,entry);assert.equal(requests,1);
 assert.equal(entry.prompt,'Complete saved prompt');assert.equal(entry.demo_html,'<!doctype html><p>Live</p>');
 await loader.load(entry);assert.equal(requests,1);
});
test('offline and personal entries never request content',async()=>{
 const loader=create(()=>{throw Error('Offline content must not use the network');});
 const entry={id:'user-example',prompt:'Already complete'};
 assert.equal(await loader.load(entry),entry);
});
test('failed content requests remain retryable and do not create an empty prompt',async()=>{
 let requests=0;const entry={id:57,content_url:url};
 const loader=create(async()=>++requests===1?{ok:false}:{ok:true,json:async()=>({id:57,prompt:'Full text after retry'})});
 await assert.rejects(loader.load(entry),/load/i);assert.equal(entry.prompt,undefined);
 await loader.load(entry);assert.equal(entry.prompt,'Full text after retry');assert.equal(requests,2);
});
test('mismatched content never overwrites another reference',async()=>{
 const entry={id:57,content_url:url};
 const loader=create(async()=>({ok:true,json:async()=>({id:58,prompt:'Wrong text'})}));
 await assert.rejects(loader.load(entry),/reference/i);assert.equal(entry.id,57);assert.equal(entry.prompt,undefined);
});
test('full-text search loads once on demand without changing prompts',async()=>{
 let requests=0;const loader=create(async()=>{requests++;return {ok:true,json:async()=>[[57,'Complete prompt contains iridescent foliage']]};});
 const [a,b]=await Promise.all([loader.search('assets/0123456789abcdef/search.json'),loader.search('assets/0123456789abcdef/search.json')]);
 assert.equal(a,b);assert(a.get('57').includes('iridescent foliage'));assert.equal(requests,1);
});
