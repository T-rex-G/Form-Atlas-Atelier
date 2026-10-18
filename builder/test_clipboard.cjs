'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(clipboard={},options={}){
 const body={append(){}},field={style:{},focus(){},select(){},setSelectionRange(){},setAttribute(){},remove(){}};
 const context={window:{},document:{body,activeElement:null,createElement:()=>({...field,style:{}}),addEventListener(){},removeEventListener(){},execCommand:options.exec||(()=>false)},navigator:{clipboard},Blob,ClipboardItem:class{constructor(data){this.data=data;}},setTimeout,clearTimeout,...options.globals};
 vm.runInNewContext(fs.readFileSync(__dirname+'/clipboard.js','utf8'),context);
 return context.window.FormClipboard;
}
test('ready offline text starts its synchronous copy within the original call',async()=>{
 let called=false;const api=setup({}, {exec:()=>{called=true;return true;}}),result=api.copy('Complete offline prompt');
 assert(called);assert.equal((await result).ok,true);
});
test('lazy copying initiates clipboard permission before the network text resolves',async()=>{
 let resolve,started=false,written='';const text=new Promise(done=>{resolve=done;});
 const api=setup({write(items){started=true;return items[0].data['text/plain'].then(blob=>blob.text()).then(value=>{written=value;});}});
 assert.equal(typeof api.copyDeferred,'function','Lazy clipboard writes must retain the click gesture');
 const result=api.copyDeferred(text);assert(started,'Call clipboard.write synchronously from the click');
 resolve('Exact\ncomplete saved prompt');assert.equal((await result).ok,true);assert.equal(written,'Exact\ncomplete saved prompt');
});
test('denied deferred copying retains a safe manual-copy result',async()=>{
 const api=setup({write:()=>Promise.reject(Error('Denied'))});
 assert.equal(typeof api.copyDeferred,'function');assert.equal((await api.copyDeferred(Promise.resolve('Full prompt'))).ok,false);
});
test('a failed text fetch rejects without writing an empty clipboard value',async()=>{
 let written=false;const api=setup({write:items=>items[0].data['text/plain'].then(()=>{written=true;})});
 assert.equal(typeof api.copyDeferred,'function');await assert.rejects(api.copyDeferred(Promise.reject(Error('Connection lost'))),/Connection lost/);assert.equal(written,false);
});
test('unsupported deferred ClipboardItem still allows exact manual copying',async()=>{
 const api=setup({}, {globals:{ClipboardItem:undefined}});assert.equal(typeof api.copyDeferred,'function');assert.equal((await api.copyDeferred(Promise.resolve('Saved text'))).ok,false);
});
