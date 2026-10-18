(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FormContent=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 function create(fetcher){
  const request=fetcher||((...args)=>fetch(...args)),pending=new Map(),searches=new Map();
  const valid=url=>typeof url==='string'&&/^assets\/[a-f0-9]{16}\/(?:references\/[\w-]+|search)\.json$/.test(url);
  async function json(url){
   if(!valid(url))throw Error('This reference has an invalid content address.');
   const response=await request(url);
   if(!response.ok)throw Error('Could not load the reference. Check your connection and retry.');
   return response.json();
  }
  function load(entry){
   if(typeof entry.prompt==='string')return Promise.resolve(entry);
   if(pending.has(entry))return pending.get(entry);
   const work=json(entry.content_url).then(data=>{
    if(data.id!==entry.id||typeof data.prompt!=='string'||data.code_file&&typeof data.code!=='string'||data.demo_file&&typeof data.demo_html!=='string')throw Error('The saved content does not match this reference.');
    Object.assign(entry,data);return entry;
   }).finally(()=>pending.delete(entry));
   pending.set(entry,work);return work;
  }
  function search(url){
   if(searches.has(url))return searches.get(url);
   const work=json(url).then(rows=>{
    if(!Array.isArray(rows)||rows.some(row=>!Array.isArray(row)||row.length!==2||typeof row[1]!=='string'))throw Error('Full-text search could not be loaded.');
    return new Map(rows.map(([id,text])=>[String(id),text]));
   }).catch(error=>{searches.delete(url);throw error;});
   searches.set(url,work);return work;
  }
  return {load,search};
 }
 return {create};
});
