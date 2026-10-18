#!/usr/bin/env node
'use strict';
// Optional browser regression checks. Evidence and browser dependencies stay external.
// Browser plugin not available: use isolated Playwright in GitHub Actions.
// Flow: hosted entry -> library -> complete reference and continuously playing Bloom.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),zlib=require('node:zlib');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'),web=path.join(root,'dist');
const [chrome,outArg]=process.argv.slice(2);
if(!chrome||!outArg)throw Error('Chrome executable and external evidence directory required');
const out=path.resolve(outArg);assert(!out.startsWith(root+path.sep));fs.mkdirSync(out,{recursive:true});
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const items=read('data/library.json'),feature=read('data/feature.json'),evidence=read('SOURCE_AUDIT/BLOOM_CONTINUOUS.json');
const previous=JSON.parse(execFileSync('git',['show','origin/main:data/library.json'],{cwd:root,maxBuffer:8*1024*1024}).toString());
assert.equal(items.length,865);assert.equal(previous.length,865);
for(let i=0;i<items.length;i++){assert.equal(items[i].id,previous[i].id);if(items[i].id!==57)assert.deepEqual(items[i],previous[i]);}
const bloom=items.find(x=>x.id===57),old=previous.find(x=>x.id===57);
for(const key of ['prompt_file','access','access_evidence','chars','tags','provider'])assert.deepEqual(bloom[key],old[key]);
assert.equal(bloom.video,feature.video);assert.equal(bloom.mobile_video,feature.mobile_video);assert.equal(bloom.full_image,feature.poster);assert.equal(bloom.video_loop,true);
const hash=name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
assert.equal(hash(bloom.prompt_file),evidence.source_prompt_sha256);assert.equal(hash(bloom.video),evidence.output_sha256);assert.equal(hash(bloom.mobile_video),evidence.mobile.sha256);
assert.deepEqual([evidence.width,evidence.height,evidence.fps,evidence.duration_seconds],[1920,1080,24,23]);assert.deepEqual(evidence.runtime_errors,[]);
assert.equal(execFileSync('git',['diff','--name-only','--diff-filter=MD','origin/main','--','PROMPTS','CODE','DEMOS','SOURCE','VIDEO','IMAGES','FULL_IMAGES','FONTS','BOARDS'],{cwd:root}).toString().trim(),'','Original saved content must be unchanged');
const index=fs.readFileSync(path.join(web,'index.html')),indexBr=zlib.brotliCompressSync(index,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:4}});
const full=JSON.parse(fs.readFileSync(path.join(root,'START_HERE.html'),'utf8').match(/<script id="embedded" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const mime={'.html':'text/html; charset=utf-8','.mp4':'video/mp4','.webp':'image/webp','.ttf':'font/ttf','.svg':'image/svg+xml','.json':'application/json','.md':'text/plain; charset=utf-8'};
const compressed=new Map();
const server=http.createServer((req,res)=>{
 let relative;try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';}catch{res.writeHead(400);res.end();return;}
 const file=path.resolve(web,relative);
 if(!file.startsWith(web+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const size=fs.statSync(file).size,ext=path.extname(file),type=mime[ext]||'application/octet-stream';
 const cache=relative.startsWith('assets/')?'public, max-age=31536000, immutable':ext==='.html'?'public, max-age=0, must-revalidate':'public, max-age=86400';
 const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
 if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;if(start>end){res.writeHead(416);res.end();return;}res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1,'Cache-Control':cache});fs.createReadStream(file,{start,end}).pipe(res);}
 else if(['.html','.json'].includes(ext)&&/\bbr\b/.test(req.headers['accept-encoding']||'')){
  if(!compressed.has(file))compressed.set(file,zlib.brotliCompressSync(fs.readFileSync(file),{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:4}}));
  const body=compressed.get(file);res.writeHead(200,{'Content-Type':type,'Content-Encoding':'br','Content-Length':body.length,'Cache-Control':cache});res.end(body);
 }else{res.writeHead(200,{'Content-Type':type,'Content-Length':size,'Accept-Ranges':'bytes','Cache-Control':cache});fs.createReadStream(file).pipe(res);}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/',errors=[],issues=[],checks=[],browsers=[];
 function observe(page,label,expectedNetworkError=false){
  page.on('pageerror',e=>errors.push({label,message:e.message}));
  page.on('console',m=>{if(['warning','error'].includes(m.type())&&!m.location().url.endsWith('/favicon.ico')&&!(expectedNetworkError&&m.text().includes('503')))issues.push({label,level:m.type(),message:m.text(),url:m.location().url});});
 }
 const ready=page=>page.waitForFunction(()=>document.querySelectorAll('#cards .entry').length===24);
 const playing=(page,width)=>page.waitForFunction(w=>{const v=document.getElementById('featuredVideo');return !v.paused&&v.videoWidth===w&&v.duration===23&&v.loop&&v.muted;},width,{timeout:30000});
 async function compactControl(page){
  const preview=page.locator('.featured-preview'),control=page.locator('#featuredMotion');
  assert.equal(await page.locator('#featuredStart').count(),0,'Do not render a central fallback overlay');
  assert.equal(await preview.getByRole('button',{name:/^(Play|Pause|Retry) Bloom preview$/}).count(),1);
  assert.equal((await control.textContent()).trim(),'','The corner control is icon-only');
  const bounds=await control.boundingBox(),frame=await preview.boundingBox();
  assert.deepEqual([bounds.width,bounds.height],[44,44],'Keep the full touch target without a wide label');
  assert(frame.x+frame.width-bounds.x-bounds.width<=14&&frame.y+frame.height-bounds.y-bounds.height<=14,'Keep playback in the lower corner');
  const disc=await control.evaluate(node=>{const s=getComputedStyle(node,'::before');return {width:parseFloat(s.width),height:parseFloat(s.height)};});
  assert(disc.width<=34&&disc.height<=34,'The visible control must remain discreet');
  assert.equal(await page.locator('#featuredVideo').evaluate(v=>v.controls),false,'Do not show native media controls over the hero');
 }
 try{
  const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});browsers.push(browser);
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});observe(page,'desktop');
  const requested=[];page.on('request',r=>requested.push(r.url()));
  await page.goto(url,{waitUntil:'load'});await ready(page);
  assert.match(await page.title(),/Form Atlas/);assert.equal(await page.locator('#viewerNotice').count(),0);assert.equal(await page.locator('#filterAllCount').textContent(),'865');
  assert((await page.locator('#cards .tile-subline>span').allTextContents()).every(x=>x==='MotionSites AI'));assert.match(await page.locator('.maker-note').textContent(),/Made By\s*Trex/);
  assert(!requested.some(x=>/\/assets\/.*\.json/.test(x)),'Initial entry must not download full text or demos');
  await playing(page,1920);await compactControl(page);await page.screenshot({path:path.join(out,'desktop.png')});
  checks.push('Desktop: direct library entry, no warning overlay, no eager content requests, 865 references, MotionSites first, Trex credit');
  await page.locator('#featuredMotion').click();assert(await page.locator('#featuredVideo').evaluate(v=>v.paused));
  await page.locator('#featuredMotion').click();await playing(page,1920);
  await page.locator('#featuredVideo').evaluate(v=>{v.currentTime=22.8;});await page.waitForFunction(()=>document.getElementById('featuredVideo').currentTime<2,null,{timeout:10000});
  checks.push('Desktop: automatic silent 1080p playback, pause/resume, real end-to-start loop crossing');
  await page.locator('#featuredOpen').click();assert.equal(await page.locator('#dtitle').textContent(),'Bloom');
  await page.waitForFunction(()=>document.getElementById('promptContent')&&document.getElementById('copy').disabled===false);
  assert.equal(await page.locator('#promptContent').textContent(),fs.readFileSync(path.join(root,bloom.prompt_file),'utf8'));
  assert(await page.locator('#featuredVideo').evaluate(v=>v.paused));assert.equal(await page.locator('#dorigin').textContent(),'Recorded from saved code');
  await page.locator('#dplay').click();await page.waitForFunction(()=>{const v=document.getElementById('dvideo');return !v.paused&&v.videoWidth===1920&&v.loop;},null,{timeout:30000});
  assert((await page.locator('#downloadVideo').getAttribute('href')).endsWith('bloom-continuous-1080p.mp4'));
  await page.locator('#dclose').click();await playing(page,1920);
  checks.push('Bloom detail: complete unchanged prompt loaded on demand, correct provenance, same continuous HD loop, hero paused behind dialog');
  await page.locator('[data-media=code]').click();
  const study=items.find(x=>x.id==='oss-motion-text-loop');
  await page.locator('.entry[data-id="oss-motion-text-loop"] .title-button').click();
  await page.waitForFunction(()=>document.getElementById('promptContent')&&document.getElementById('copy').disabled===false);
  assert.equal(await page.locator('#promptContent').textContent(),fs.readFileSync(path.join(root,study.prompt_file),'utf8'));
  await page.locator('#codeTab').click();assert.equal(await page.locator('#codeContent').textContent(),fs.readFileSync(path.join(root,study.code_file),'utf8'));
  await page.locator('#livePreview').click();await page.waitForFunction(()=>!document.getElementById('dlive').hidden&&!!document.getElementById('dlive').srcdoc);
  assert.equal(await page.locator('#dlive').getAttribute('srcdoc'),fs.readFileSync(path.join(root,study.demo_file),'utf8'));
  await page.locator('#dclose').click();await page.locator('#resetFilters').click();
  const query='requestanimationframe',expected=full.filter(x=>x.prompt.toLowerCase().includes(query)).length;assert(expected>0);
  await page.locator('#q').fill(query);await page.waitForFunction(count=>document.getElementById('filterAllCount').textContent===String(count)&&document.getElementById('searchStatus').hidden,expected,{timeout:30000});
  assert(requested.some(x=>/\/assets\/.*\/search\.json/.test(x)));
  await page.locator('#clearSearch').click();
  checks.push('Lazy MIT source/demo loading and exact-text full-prompt search remain functional');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'load'});await ready(page);
  assert(await page.locator('#featuredVideo').evaluate(v=>v.paused&&!v.getAttribute('src')));assert(await page.locator('#featuredImage').isVisible());
  checks.push('Reduced motion: visible high-resolution poster and zero automatic video requests');
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});observe(mobile,'mobile-chrome');
  await mobile.goto(url,{waitUntil:'load'});await ready(mobile);await playing(mobile,1280);await compactControl(mobile);
  assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const bounds=await mobile.locator('.featured-preview').boundingBox();assert(Math.abs(bounds.width/bounds.height-16/9)<.02);
  await mobile.locator('#theme').click();await mobile.screenshot({path:path.join(out,'mobile-light.png')});
  await mobile.locator('#menu').click();assert(await mobile.locator('.maker-note').isVisible());await mobile.locator('#closeMenu').click();
  await mobile.locator('#featuredOpen').click();await mobile.locator('#promptContent').waitFor();await mobile.locator('#dplay').click();
  await mobile.waitForFunction(()=>{const v=document.getElementById('dvideo');return !v.paused&&v.videoWidth===1280;},null,{timeout:30000});await mobile.locator('#dclose').click();
  checks.push('390×844 mobile: lighter 720p hero/detail, 16:9 frame, no overflow, light theme, sidebar controls');
  const retry=await browser.newPage({viewport:{width:1440,height:1000}});observe(retry,'content-retry',true);
  let failOnce=true;await retry.route('**/references/57.json',route=>{if(failOnce){failOnce=false;return route.fulfill({status:503,contentType:'application/json',body:'{}'});}return route.continue();});
  await retry.goto(url,{waitUntil:'load'});await ready(retry);await retry.locator('#featuredOpen').click();await retry.getByRole('button',{name:'Retry loading',exact:true}).waitFor();
  assert(await retry.locator('#copy').isDisabled());await retry.getByRole('button',{name:'Retry loading',exact:true}).click();await retry.locator('#promptContent').waitFor();assert.equal(await retry.locator('#promptContent').textContent(),fs.readFileSync(path.join(root,bloom.prompt_file),'utf8'));
  checks.push('Interrupted reference fetch: readable error, disabled empty-copy action, successful exact-content retry');
  async function delayedNotes(engine,label){
   for(const status of [200,503]){
    const p=await engine.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});observe(p,label+'-notes-'+status,status===503);
    let release;const held=new Promise(resolve=>{release=resolve;});
    await p.route('**/references/57.json',async route=>{await held;if(status===503)return route.fulfill({status:503,contentType:'application/json',body:'{}'});return route.continue();});
    try{
     await p.goto(url,{waitUntil:'load'});await ready(p);await p.locator('#featuredOpen').click();await p.getByRole('button',{name:'My notes',exact:true}).click();
     const field=p.getByRole('textbox',{name:'Private notes',exact:true}),draft='Keep this delicate lighting and organic detail.';
     await field.fill(draft);await field.evaluate(node=>{node.dataset.qaIdentity='original-editor';node.focus();node.setSelectionRange(5,14);});
     release();
     if(status===200)await p.waitForFunction(()=>!document.getElementById('copy').disabled);
     else await p.waitForFunction(()=>document.getElementById('copyStatus').textContent.includes('Prompt unavailable'));
     assert.equal(await field.getAttribute('data-qa-identity'),'original-editor','A fetch completion must not replace the Notes textarea');
     const state=await field.evaluate(node=>({focused:document.activeElement===node,start:node.selectionStart,end:node.selectionEnd,value:node.value,saved:JSON.parse(localStorage.getItem('form-iii-notes'))['57']}));
     assert.deepEqual(state,{focused:true,start:5,end:14,value:draft,saved:draft});
    }finally{release();await p.close();}
   }
   checks.push(label+': slow successful and failed fetches preserve Notes editor identity, focus, caret and saved draft');
  }
  await delayedNotes(browser,'chrome');
  async function deferredCopy(engine,label){
   for(const denied of [false,true]){
    const p=await engine.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});observe(p,label+'-deferred-copy');
    // Model the clipboard's gesture-sensitive boundary, not a real user's clipboard.
    await p.addInitScript(deny=>{
     let gesture=false;window.atlasDeferredWrites=0;window.atlasSyncCopies=0;window.atlasCopiedText='';
     // Browser events may checkpoint microtasks between listeners. Keep this
     // test boundary active through the complete click task, not one listener.
     document.addEventListener('click',()=>{gesture=true;setTimeout(()=>{gesture=false;},0);},true);
     document.execCommand=()=>false;
     Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
      write(items){window.atlasDeferredWrites++;if(deny||!gesture)return Promise.reject(new DOMException('Gesture required','NotAllowedError'));return items[0].getType('text/plain').then(blob=>blob.text()).then(text=>{window.atlasCopiedText=text;});},
      writeText(text){window.atlasSyncCopies++;if(deny||!gesture)return Promise.reject(new DOMException('Gesture required','NotAllowedError'));window.atlasCopiedText=text;return Promise.resolve();}
     }});
    },denied);
    let release;const held=new Promise(resolve=>{release=resolve;});
    await p.route('**/references/57.json',async route=>{await held;return route.continue();});
    try{
     await p.goto(url,{waitUntil:'load'});await ready(p);await p.locator('#featuredCopy').click();
     assert.equal(await p.evaluate(()=>window.atlasDeferredWrites),1,'The clipboard request must begin before the delayed fetch finishes');
     release();const expected=fs.readFileSync(path.join(root,bloom.prompt_file),'utf8');
     if(denied){await p.locator('#manualCopyPanel').waitFor({state:'visible'});assert.equal(await p.locator('#manualCopyText').inputValue(),expected);}
     else{await p.waitForFunction(text=>window.atlasCopiedText===text,expected);await p.locator('#featuredCopy').click();assert.equal(await p.evaluate(()=>window.atlasSyncCopies),1,'Cached copying must stay inside its original click');}
    }finally{release();await p.close();}
   }
   checks.push(label+': delayed quick-copy retains the click gesture; cached copy stays synchronous; denied clipboard exposes exact manual text');
  }
  await deferredCopy(browser,'chrome');
  const offline=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});observe(offline,'offline-file');
  const offlineRequests=[];offline.on('request',request=>{if(/^https?:/.test(request.url()))offlineRequests.push(request.url());});
  await offline.goto('file://'+path.join(root,'START_HERE.html'),{waitUntil:'load'});await ready(offline);await offline.locator('#featuredOpen').click();
  assert.equal(await offline.locator('#promptContent').textContent(),fs.readFileSync(path.join(root,bloom.prompt_file),'utf8'));assert.deepEqual(offlineRequests,[]);await offline.close();
  checks.push('Standalone file entry opens complete offline prompts without HTTP requests');
  async function policyCheck(engine,label){
   const p=await engine.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});observe(p,label);
   await p.addInitScript(()=>{const native=HTMLMediaElement.prototype.play;window.atlasPlayAttempts=0;HTMLMediaElement.prototype.play=function(){if(this.id==='featuredVideo'&&++window.atlasPlayAttempts===1){this.autoplay=false;return Promise.reject(new DOMException('Simulated gesture requirement','NotAllowedError'));}return native.call(this);};});
   await p.goto(url,{waitUntil:'load'});await ready(p);await p.waitForFunction(()=>window.atlasPlayAttempts===1&&document.getElementById('featuredMotion').getAttribute('aria-label')==='Play Bloom preview');
   await compactControl(p);
   assert.equal(await p.evaluate(()=>window.atlasPlayAttempts),1);
   await p.screenshot({path:path.join(out,label+'-tap-fallback.png')});
   await p.locator('#featuredMotion').click();await playing(p,1280);assert.equal(await p.evaluate(()=>window.atlasPlayAttempts),2);
   await p.locator('#featuredMotion').press('Space');assert(await p.locator('#featuredVideo').evaluate(v=>v.paused));
   assert.equal(await p.locator('#featuredMotion').getAttribute('aria-label'),'Play Bloom preview');
   await p.locator('#featuredMotion').press('Enter');await playing(p,1280);
   assert.equal(await p.locator('dialog[open]').count(),0,'Playback must not open the reference dialog');
   await p.close();checks.push(label+': one compact corner control handles policy denial, tap, keyboard pause/resume; no centre overlay or retry spam');
  }
  await policyCheck(browser,'chrome');
  if(process.env.ATLAS_WEBKIT==='1'){
   const safari=await webkit.launch({headless:true});browsers.push(safari);
   const p=await safari.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});observe(p,'webkit-mobile');
   await p.goto(url,{waitUntil:'load'});await ready(p);assert.equal(await p.locator('#viewerNotice').count(),0);await playing(p,1280);await compactControl(p);
   await p.locator('#featuredOpen').click();await p.locator('#promptContent').waitFor();assert.equal(await p.locator('#promptContent').textContent(),fs.readFileSync(path.join(root,bloom.prompt_file),'utf8'));
   await p.locator('#dclose').click();await p.locator('#theme').click();await p.screenshot({path:path.join(out,'webkit-mobile.png')});
   checks.push('WebKit mobile: direct entry, silent inline 720p autoplay, complete lazy prompt, theme and dialog lifecycle');
   await delayedNotes(safari,'webkit');
   await deferredCopy(safari,'webkit');
   await policyCheck(safari,'webkit');
  }
  const limited=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});observe(limited,'throttled-mobile');
  const cdp=await limited.context().newCDPSession(limited);await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:75000});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const start=Date.now();await limited.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await ready(limited);const libraryMs=Date.now()-start;
  assert(libraryMs<12000,'Library startup budget exceeded under controlled throttling: '+libraryMs);
  assert.equal(await limited.locator('#viewerNotice').count(),0);await playing(limited,1280);
  await limited.screenshot({path:path.join(out,'throttled-mobile.png')});
  checks.push('Controlled mobile profile: 1.6 Mbps / 150 ms latency / 4× CPU slowdown -> library in '+libraryMs+' ms');
  assert.deepEqual(errors,[]);assert.deepEqual(issues,[]);
  const result={result:'PASS',browser_plugin:'not available; isolated Playwright used',url,viewports:['1440x1000','390x844'],engines:process.env.ATLAS_WEBKIT==='1'?['Chromium','WebKit']:['Chromium'],references:865,unchanged_other_records:864,hosted_html_bytes:index.length,hosted_brotli_quality4_bytes:indexBr.length,desktop_video_bytes:evidence.output_bytes,mobile_video_bytes:evidence.mobile.bytes,controlled_mobile_library_ms:libraryMs,checks,runtime_errors:errors,console_issues:issues,remaining_risk:'Physical iPhone Safari, Low Power Mode and real cellular conditions are not emulated.'};
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 }finally{await Promise.all(browsers.map(b=>b.close()));await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
