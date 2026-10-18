#!/usr/bin/env node
'use strict';
// Optional, deterministic recording of the unchanged saved Bloom design.
// Requires Playwright, Chrome, ffmpeg, and the original local media/font inputs.
// Usage: node builder/render_bloom.cjs <asset-dir> <output-dir> <chrome-path> [proof]
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {spawn,spawnSync}=require('node:child_process');
const {once}=require('node:events');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const [assetArg,outArg,chromePath,mode]=process.argv.slice(2);
if(!assetArg||!outArg||!chromePath)throw Error('Provide local asset directory, output directory, and Chrome executable');
const assets=path.resolve(assetArg),out=path.resolve(outArg);
fs.mkdirSync(out,{recursive:true});
const {fps,seconds,wrapSeconds,progress}=require('./bloom_timeline.cjs');
const width=1920,height=1080,frames=seconds*fps;
const sourcePath=path.join(root,'PROMPTS/01-Landing-and-Sections/057-bl.md');
const original=fs.readFileSync(sourcePath,'utf8');
const sourceHash=crypto.createHash('sha256').update(original).digest('hex');
let html=original.replace(/<link\b[^>]*>/g,'');
const filenames=['202606101700_hglz7q.mp4','202606101702_sd50y0.mp4','202606101703_jmidj2.mp4'];
for(let i=0;i<3;i++){
 const originalUrl='https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/'+filenames[i];
 if(!html.includes(originalUrl))throw Error('Saved design media identity changed');
 html=html.replace(originalUrl,'/assets/v'+(i+1)+'.mp4');
}
const fontFaces=[['Instrument Serif','400','normal','/fonts/instrument-serif-1.ttf'],['Instrument Serif','400','italic','/fonts/instrument-serif-0.ttf'],...['400','500','600','700'].map((w,i)=>['Manrope',w,'normal','/assets/font-'+i+'.ttf']),...['400','500','600'].map((w,i)=>['Space Grotesk',w,'normal','/assets/font-'+(i+4)+'.ttf'])];
const css=fontFaces.map(([family,weight,style,url])=>`@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url('${url}') format('truetype');font-display:block}`).join('')+'*{animation:none!important;transition:none!important;caret-color:transparent!important}html{scrollbar-width:none}::-webkit-scrollbar{display:none}';
html=html.replace('</head>','<style>'+css+'</style></head>');
for(const [before,after] of [
 ['currentProgress += (targetProgress - currentProgress) * 0.08;','currentProgress = targetProgress;'],
 ['safeSeek(activeKey, pLocal * (durations[activeKey] || 10));','// Recording driver awaits the exact original video frame.'],
]){if(!html.includes(before))throw Error('Recording seam changed');html=html.replace(before,after);}
html=html.replaceAll('requestAnimationFrame(tick);','');
const captureHook=`
window.__prepareBloom=async function(){
 await Promise.all(Object.values(videos).map(v=>new Promise((resolve,reject)=>{
  if(v.readyState>=2)return resolve();
  v.addEventListener('loadeddata',resolve,{once:true});
  v.addEventListener('error',()=>reject(Error('Original video failed: '+v.id)),{once:true});
 })));
 await document.fonts.ready;
 for(const key of Object.keys(videos)){durations[key]=videos[key].duration;metaLoaded[key]=true;}
 handleResize();loadingScreen.style.display='none';
 return Object.values(videos).map(v=>({id:v.id,width:v.videoWidth,height:v.videoHeight,duration:v.duration}));
};
window.__captureBloom=async function(p){
 targetProgress=currentProgress=p;
 const key=getActiveKey(p),v=videos[key];
 const local=key==='v1'?p*3:key==='v2'?(p-.333)*3:(p-.666)*3;
 const time=Math.max(0,Math.min(local*v.duration,v.duration-.05));
 if(Math.abs(v.currentTime-time)>.00001){
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Video seek timeout')),8000);
   v.addEventListener('seeked',()=>{clearTimeout(timer);resolve();},{once:true});
   v.currentTime=time;
  });
 }
 tick();drawFrame();
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 return {progress:p,video:key,time:v.currentTime};
};
`;
if(!html.includes('// Hamburger menu'))throw Error('Capture hook anchor missing');
html=html.replace('// Hamburger menu',captureHook+'\n// Hamburger menu');
fs.writeFileSync(path.join(out,'bloom-local.html'),html);
const allowed=new Map();
for(let i=1;i<=3;i++)allowed.set('/assets/v'+i+'.mp4',path.join(assets,'v'+i+'.mp4'));
for(let i=0;i<7;i++)allowed.set('/assets/font-'+i+'.ttf',path.join(assets,'font-'+i+'.ttf'));
for(const name of ['instrument-serif-0.ttf','instrument-serif-1.ttf'])allowed.set('/fonts/'+name,path.join(root,'FONTS',name));
for(const file of allowed.values())if(!fs.existsSync(file))throw Error('Missing recording input: '+file);
const server=http.createServer((req,res)=>{
 if(req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);return;}
 const file=allowed.get(req.url);if(!file){res.writeHead(404);res.end();return;}
 const size=fs.statSync(file).size,type=file.endsWith('.mp4')?'video/mp4':'font/ttf';
 const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
 if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;if(start>end){res.writeHead(416);res.end();return;}res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
 else{res.writeHead(200,{'Content-Type':type,'Content-Length':size,'Accept-Ranges':'bytes'});fs.createReadStream(file).pipe(res);}
});
// Constant forward motion: no section holds or zero-velocity easing keys.
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/';
 let browser,encoder;
 const errors=[];
 try{
  browser=await chromium.launch({headless:true,executablePath:chromePath,args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--disable-background-timer-throttling']});
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
  await page.goto(url,{waitUntil:'load',timeout:60000});
  const inputs=await page.evaluate(()=>window.__prepareBloom());
  if(!inputs.every(v=>v.width===1920&&v.height===1080&&v.duration===8))throw Error('Unexpected original video format');
  console.log('INPUTS '+JSON.stringify(inputs));
  for(const [label,p] of [['opening',0],['features',.31],['mission',.55],['planet',.72],['symbiosis',.89],['closing',.99]]){
   await page.evaluate(p=>window.__captureBloom(p),p);
   await page.screenshot({path:path.join(out,'proof-'+label+'.png'),type:'png'});
  }
  if(mode==='proof'){console.log('PROOFS VERIFIED '+JSON.stringify({sourceHash,errors}));return;}
  const master=path.join(out,'bloom-master.mp4');
  encoder=spawn('ffmpeg',['-v','error','-n','-f','image2pipe','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',master],{stdio:['pipe','inherit','inherit']});
  let encoderError;encoder.on('error',e=>{encoderError=e;});
  for(let i=0;i<frames;i++){
   await page.evaluate(p=>window.__captureBloom(p),progress((i+.5)/fps));
   const png=await page.screenshot({type:'jpeg',quality:97});
   if(encoderError)throw encoderError;
   if(!encoder.stdin.write(png))await once(encoder.stdin,'drain');
   if(i%90===0)console.log('RENDER '+i+'/'+frames);
  }
  encoder.stdin.end();const [code]=await once(encoder,'exit');if(code!==0)throw Error('Master encoder failed');encoder=null;
  const output=path.join(out,'bloom-continuous-1080p.mp4');
  const filter=`[0:v]split[a][b];[a]trim=start=${wrapSeconds},setpts=PTS-STARTPTS[body];[b]trim=end=${wrapSeconds},setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=${wrapSeconds}:offset=${seconds-2*wrapSeconds},format=yuv420p[out]`;
  const result=spawnSync('ffmpeg',['-v','error','-n','-i',master,'-filter_complex_threads','1','-filter_complex',filter,'-map','[out]','-an','-c:v','libx264','-preset','slow','-crf','23','-maxrate','2800k','-bufsize','5600k','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',output],{stdio:'inherit'});
  if(result.status!==0)throw Error('Loop encoder failed');
  const mobile=path.join(out,'bloom-continuous-720p.mp4');
  const smaller=spawnSync('ffmpeg',['-v','error','-n','-i',output,'-vf','scale=1280:720:flags=lanczos','-an','-c:v','libx264','-preset','slow','-crf','24','-maxrate','1100k','-bufsize','2200k','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',mobile],{stdio:'inherit'});
  if(smaller.status!==0)throw Error('Mobile encoder failed');
  if(errors.length)throw Error('Design runtime errors: '+JSON.stringify(errors));
  const metadata={source_prompt_sha256:sourceHash,width,height,fps,forward_seconds:seconds,duration_seconds:seconds-wrapSeconds,loop:'Continuous native-speed motion with a one-second moving wrap dissolve; no timing holds',inputs:inputs.map((v,i)=>({...v,source_filename:filenames[i],sha256:crypto.createHash('sha256').update(fs.readFileSync(allowed.get('/assets/'+v.id+'.mp4'))).digest('hex')})),output_sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),output_bytes:fs.statSync(output).size,mobile:{width:1280,height:720,bytes:fs.statSync(mobile).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(mobile)).digest('hex')},runtime_errors:errors};
  fs.writeFileSync(path.join(out,'bloom-render-evidence.json'),JSON.stringify(metadata,null,2)+'\n');
  console.log('RENDER COMPLETE '+JSON.stringify(metadata));
 }finally{if(encoder)encoder.kill('SIGTERM');if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
