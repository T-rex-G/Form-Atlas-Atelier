(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FormFeatured=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 function create({video,allowed,source,onState}){
  let pending=null,generation=0,blocked=false,failed=false,phase='idle',transientRetries=0;
  const publish=next=>{phase=next;onState({phase});};
  function sync({retry=false}={}){
   if(retry){blocked=false;failed=false;transientRetries=0;if(video.error)video.load?.();}
   if(!allowed()){generation++;video.pause();publish('paused');return Promise.resolve();}
   if(blocked||failed)return Promise.resolve();
   if(!video.paused){publish('playing');return Promise.resolve();}
   if(pending)return pending;
   const id=++generation;
   video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;video.autoplay=true;video.controls=false;
   // iOS must see a visible, silent inline element when play is requested.
   video.hidden=false;
   if(!video.getAttribute?.('src')&&!video.src)video.src=source();
   publish('loading');
   let playback,retryInterrupted=false;try{playback=video.play();}catch(error){playback=Promise.reject(error);}
   const work=Promise.resolve(playback).then(()=>{
    if(id===generation){transientRetries=0;publish(video.paused?'loading':'playing');}
   }).catch(error=>{
    if(id!==generation)return;
    if(error.name==='AbortError'){if(transientRetries<1&&allowed()){transientRetries++;retryInterrupted=true;}publish('paused');return;}
    blocked=error.name==='NotAllowedError';failed=!blocked;
    publish(blocked?'blocked':'error');
   }).finally(()=>{
    if(pending===work)pending=null;
    if((retryInterrupted||id!==generation)&&allowed()&&!blocked&&!failed)return sync();
   });
   pending=work;return work;
  }
  function fail(){generation++;failed=true;video.pause();publish('error');}
  return {sync,fail,get phase(){return phase;}};
 }
 return {create};
});
