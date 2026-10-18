/* Clipboard actions run from the original button click, including file:// viewers. */
window.FormClipboard = (() => {
  function selectAll(field) {
    field.focus({preventScroll:true});
    field.select();
    field.setSelectionRange(0, field.value.length);
  }
  function copySynchronously(text, host) {
    const previous = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.tabIndex = -1;
    field.setAttribute('aria-label','Temporary clipboard selection');
    Object.assign(field.style,{position:'fixed',left:'0',top:'80px',width:'2px',height:'2px',padding:'0',border:'0',opacity:'0.001',fontSize:'16px'});
    host.append(field);
    const supply = event => {
      if (!event.clipboardData) return;
      event.clipboardData.setData('text/plain',text);
      event.preventDefault();
    };
    document.addEventListener('copy',supply,true);
    let copied = false;
    try { selectAll(field); copied = document.execCommand('copy') === true; } catch {}
    document.removeEventListener('copy',supply,true);
    field.remove();
    if (previous?.isConnected) { try {previous.focus({preventScroll:true});} catch {} }
    return copied;
  }
  async function copy(text,host=document.body) {
    if (typeof text !== 'string' || !text.length) return {ok:false,method:'empty'};
    if (copySynchronously(text,host)) return {ok:true,method:'selection'};
    if (!navigator.clipboard?.writeText) return {ok:false,method:'unavailable'};
    let timer;
    try {
      const result = await Promise.race([
        navigator.clipboard.writeText(text).then(()=>true,()=>false),
        new Promise(resolve=>{timer=setTimeout(()=>resolve(false),1500);})
      ]);
      return {ok:result,method:result?'clipboard':'blocked'};
    } catch {return {ok:false,method:'blocked'};}
    finally {clearTimeout(timer);}
  }
  async function copyDeferred(textPromise,host=document.body) {
    const text=Promise.resolve(textPromise).then(value=>{
      if(typeof value!=='string'||!value.length)throw Error('The complete prompt could not be loaded.');
      return value;
    });
    // Start permission-sensitive writing while the original click is still active.
    // WebKit accepts a Promise<Blob>, so fetching content need not lose the gesture.
    let writing=null;
    if(navigator.clipboard?.write&&typeof ClipboardItem==='function'){
      const blob=text.then(value=>new Blob([value],{type:'text/plain'}));
      blob.catch(()=>{});
      try{writing=Promise.resolve(navigator.clipboard.write([new ClipboardItem({'text/plain':blob})])).then(()=>true,()=>false);}catch{}
    }
    const value=await text;
    if(writing){
      let timer;
      try{
        const ok=await Promise.race([writing,new Promise(resolve=>{timer=setTimeout(()=>resolve(false),1500);})]);
        if(ok)return {ok:true,method:'deferred-clipboard'};
      }finally{clearTimeout(timer);}
    }
    return copy(value,host);
  }
  return {copy,copyDeferred,selectAll};
})();
