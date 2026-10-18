#!/usr/bin/env node
'use strict';
// Optional browser regression check; Playwright and Chrome are recording-only dependencies.
// Usage: node builder/check_bloom_preview.cjs <chrome-path> <external-evidence-dir>
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),web=path.join(root,'dist');
const [chrome,outArg]=process.argv.slice(2);
if(!chrome||!outArg)throw Error('Chrome executable and external evidence directory are required');
const out=path.resolve(outArg);assert(!out.startsWith(root+path.sep),'Keep QA evidence outside the repository');fs.mkdirSync(out,{recursive:true});
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const items=read('data/library.json'),feature=read('data/feature.json'),evidence=read('SOURCE_AUDIT/BLOOM_RENDER.json');
const previous=JSON.parse(execFileSync('git',['show','origin/main:data/library.json'],{cwd:root,maxBuffer:8*1024*1024}).toString());
assert.equal(items.length,865);assert.equal(previous.length,items.length);
for(let i=0;i<items.length;i++){assert.equal(items[i].id,previous[i].id);if(items[i].id!==57)assert.deepEqual(items[i],previous[i]);}
const bloom=items.find(x=>x.id===57),old=previous.find(x=>x.id===57);
for(const key of ['prompt_file','access','access_evidence','chars','tags','provider'])assert.deepEqual(bloom[key],old[key]);
assert.equal(bloom.video,feature.video);assert.equal(bloom.full_image,feature.poster);assert.equal(bloom.video_loop,true);
assert.equal(evidence.source_prompt_sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,bloom.prompt_file))).digest('hex'));
assert.equal(evidence.output_sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,bloom.video))).digest('hex'));
assert.deepEqual([evidence.width,evidence.height,evidence.fps,evidence.duration_seconds],[1920,1080,30,32.5]);assert.deepEqual(evidence.runtime_errors,[]);
assert.equal(execFileSync('git',['diff','--name-only','--diff-filter=MD','origin/main','--','PROMPTS','CODE','DEMOS','SOURCE','VIDEO','IMAGES','FULL_IMAGES','FONTS','BOARDS'],{cwd:root}).toString().trim(),'','Original saved content must be unchanged');
const mime={'.html':'text/html; charset=utf-8','.mp4':'video/mp4','.webp':'image/webp','.ttf':'font/ttf','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 let relative;try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';}catch{res.writeHead(400);res.end();return;}
 const file=path.resolve(web,relative);
 if(!file.startsWith(web+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const size=fs.statSync(file).size,type=mime[path.extname(file)]||'application/octet-stream';
 const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
 if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;if(start>end){res.writeHead(416);res.end();return;}res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
 else{res.writeHead(200,{'Content-Type':type,'Content-Length':size,'Accept-Ranges':'bytes'});fs.createReadStream(file).pipe(res);}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/';
 let browser;const errors=[];const consoleIssues=[];const checks=[];
 const observe=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['warning','error'].includes(m.type())&&!m.location().url.endsWith('/favicon.ico'))consoleIssues.push({level:m.type(),message:m.text(),url:m.location().url});});};
 try{
  browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  observe(page);
  await page.goto(url,{waitUntil:'load'});assert.match(await page.title(),/Form Atlas/);
  await page.waitForFunction(()=>document.querySelectorAll('#cards .entry').length===24);
  assert.equal(await page.locator('#filterAllCount').textContent(),'865');
  const providers=await page.locator('#cards .tile-subline>span').allTextContents();assert(providers.every(x=>x==='MotionSites AI'));
  assert.match(await page.locator('.maker-note').textContent(),/Made By\s*Trex/);
  await page.waitForFunction(()=>{const v=document.getElementById('featuredVideo');return v.videoWidth===1920&&v.videoHeight===1080&&v.duration===32.5&&!v.paused&&v.loop&&v.muted;},{},{timeout:30000});
  checks.push('Desktop identity, 865 references, MotionSites-first cards, Trex credit, and 1080p silent looping autoplay');
  await page.screenshot({path:path.join(out,'desktop.png')});
  await page.locator('#featuredMotion').click();assert(await page.locator('#featuredVideo').evaluate(v=>v.paused));
  await page.locator('#featuredMotion').click();await page.waitForFunction(()=>!document.getElementById('featuredVideo').paused);
  await page.locator('#featuredVideo').evaluate(v=>{v.currentTime=32.3;});
  await page.waitForFunction(()=>document.getElementById('featuredVideo').currentTime<2,{},{timeout:10000});
  checks.push('Pause/resume controls and actual end-to-start loop crossing');
  await page.locator('#featuredOpen').click();assert.equal(await page.locator('#dtitle').textContent(),'Bloom');
  assert(await page.locator('#featuredVideo').evaluate(v=>v.paused));
  assert.equal(await page.locator('#dorigin').textContent(),'Recorded from saved code');
  await page.locator('#dplay').click();
  await page.waitForFunction(()=>{const v=document.getElementById('dvideo');return !v.paused&&v.videoWidth===1920&&v.loop;},{},{timeout:30000});
  assert((await page.locator('#downloadVideo').getAttribute('href')).endsWith('bloom-code-render-1080p.mp4'));
  await page.locator('#dclose').click();await page.waitForFunction(()=>!document.getElementById('featuredVideo').paused);
  checks.push('Bloom detail uses the same HD loop and correct local-recording provenance; hero pauses behind the dialog');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'load'});
  assert(await page.locator('#featuredVideo').evaluate(v=>v.paused));assert(await page.locator('#featuredImage').isVisible());
  checks.push('Reduced motion uses the high-resolution still without autoplay');
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  observe(mobile);
  await mobile.goto(url,{waitUntil:'load'});await mobile.waitForFunction(()=>document.querySelectorAll('#cards .entry').length===24);
  assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const bounds=await mobile.locator('.featured-preview').boundingBox();assert(Math.abs(bounds.width/bounds.height-16/9)<.02);
  await mobile.screenshot({path:path.join(out,'mobile.png')});
  await mobile.locator('#menu').click();assert(await mobile.locator('.maker-note').isVisible());await mobile.locator('#closeMenu').click();
  await mobile.locator('#featuredOpen').click();assert.equal(await mobile.locator('#dtitle').textContent(),'Bloom');await mobile.locator('#dclose').click();
  checks.push('390×844 mobile layout, full 16:9 frame, no horizontal overflow, sidebar and detail interactions');
  assert.deepEqual(errors,[]);
  assert.deepEqual(consoleIssues,[]);
  const result={result:'PASS',url,viewports:['1440x1000','390x844'],references:items.length,unchanged_other_records:864,checks,runtime_errors:errors,console_issues:consoleIssues};
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
