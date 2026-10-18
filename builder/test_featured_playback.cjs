'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const helper=__dirname+'/featured_playback.js';
function setup(play){
 assert(fs.existsSync(helper),'Featured playback needs cancellation-safe request handling');
 const video={hidden:true,paused:true,src:'',muted:false,playsInline:false,loop:false,autoplay:false,controls:true,pause(){this.paused=true;},play(){return play.call(this);}};
 let allowed=true;const phases=[];
 const player=require(helper).create({video,allowed:()=>allowed,source:()=>'/preview.mp4',onState:s=>phases.push(s.phase)});
 return {video,player,phases,allow:value=>{allowed=value;}};
}
test('autoplay makes the muted inline video visible before requesting playback',async()=>{
 const {video,player}=setup(function(){assert.equal(this.hidden,false);assert(this.muted&&this.playsInline&&this.loop);this.paused=false;return Promise.resolve();});
 await player.sync();assert.equal(video.src,'/preview.mp4');assert.equal(video.paused,false);
});
test('feature playback explicitly requests autoplay without native player controls',async()=>{
 let flags;const {player}=setup(function(){flags={autoplay:this.autoplay,controls:this.controls};this.paused=false;return Promise.resolve();});
 await player.sync();assert.deepEqual(flags,{autoplay:true,controls:false});
});
test('concurrent sync events share one play request',async()=>{
 let attempts=0,finish;const {player}=setup(function(){attempts++;return new Promise(resolve=>{finish=resolve;});});
 const a=player.sync(),b=player.sync();assert.equal(attempts,1);finish();await Promise.all([a,b]);
});
test('an interrupted request does not permanently disable autoplay',async()=>{
 let attempts=0;const {player,phases}=setup(function(){if(++attempts===1)return Promise.reject(Object.assign(Error('Interrupted'),{name:'AbortError'}));this.paused=false;return Promise.resolve();});
 await player.sync();assert(!phases.includes('blocked'));await player.sync();assert.equal(attempts,2);assert.equal(phases.at(-1),'playing');
});
test('one transient startup interruption is retried automatically',async()=>{
 let attempts=0;const {player,video}=setup(function(){if(++attempts===1)return Promise.reject(Object.assign(Error('Interrupted'),{name:'AbortError'}));this.paused=false;return Promise.resolve();});
 await player.sync();assert.equal(attempts,2);assert.equal(video.paused,false);
});
test('repeated interruptions stop after one automatic retry',async()=>{
 let attempts=0;const {player}=setup(function(){attempts++;return Promise.reject(Object.assign(Error('Interrupted'),{name:'AbortError'}));});
 await player.sync();assert.equal(attempts,2);
});
test('policy denial is handled without a retry loop and remains manually playable',async()=>{
 let attempts=0;const {player,phases}=setup(function(){if(++attempts===1)return Promise.reject(Object.assign(Error('Gesture needed'),{name:'NotAllowedError'}));this.paused=false;return Promise.resolve();});
 await player.sync();assert.equal(phases.at(-1),'blocked');await player.sync();assert.equal(attempts,1);
 await player.sync({retry:true});assert.equal(attempts,2);assert.equal(phases.at(-1),'playing');
});
test('hidden and reduced-motion states do not fetch a video',async()=>{
 const {player,video,allow}=setup(()=>{throw Error('Must not play');});allow(false);await player.sync();assert.equal(video.src,'');assert.equal(video.paused,true);
});
test('a stale rejection after a pause does not block a later request',async()=>{
 let reject,attempts=0;const {player,allow,phases}=setup(function(){if(++attempts===1)return new Promise((_,fail)=>{reject=fail;});this.paused=false;return Promise.resolve();});
 const old=player.sync();allow(false);await player.sync();reject(Object.assign(Error('Old cancellation'),{name:'AbortError'}));await old;
 allow(true);await player.sync();assert.equal(attempts,2);assert.equal(phases.at(-1),'playing');
});
