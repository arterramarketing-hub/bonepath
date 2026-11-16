/* THREE PARITY, the shared half. Starts the real game headless on a clock
   and a dice of the harness's own, so two runs of one file draw the same
   frame and two revisions of three.js can be told apart by their pixels.

   The page's time (`performance.now`, `requestAnimationFrame`, the timers)
   and `Math.random` are replaced BEFORE the page's first script: nothing
   moves unless `__pump(n)` turns n frames of a sixtieth of a second, and
   every roll comes off one seeded stream (`__seed`). The picture is read
   from the canvas itself, at the game's internal size, straight after the
   game's own `renderFrame()`: no screenshot, no page scaling. */
'use strict';
const {chromium}=require('playwright');
const ARGS=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--mute-audio','--enable-precise-memory-info'];
const INIT=file=>`(()=>{
  // the game's rolls and the library's own (it rolls four times for every uuid, and each revision makes a different
  // number of them) come off separate streams, told apart by the line the caller stands on: the library is one line
  let s=0x2545f491,s2=0x1234567;const LIB=__LIBLINE__,at=/:(\\d+):\\d+\\)?$/;
  Math.random=()=>{const f=(new Error().stack||'').split('\\n')[2]||'',m=at.exec(f);
    if(m&&+m[1]===LIB){s2=(Math.imul(s2,1664525)+1013904223)>>>0;return s2/4294967296;}
    s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  window.__seed=v=>{s=v>>>0;};
  let t=1000;performance.now=()=>t;
  let raf=[];window.requestAnimationFrame=f=>{raf.push(f);return raf.length;};window.cancelAnimationFrame=()=>{};
  let tm=[],id=1;
  window.setTimeout=(f,ms,...a)=>{if(typeof f!=='function')return 0;tm.push({id:++id,due:t+(+ms||0),f,a});return id;};
  window.setInterval=(f,ms,...a)=>{if(typeof f!=='function')return 0;tm.push({id:++id,due:t+(+ms||0),f,a,every:Math.max(1,+ms||0)});return id;};
  window.clearTimeout=window.clearInterval=i=>{tm=tm.filter(x=>x.id!==i);};
  window.__pump=n=>{for(let i=0;i<n;i++){t+=1000/60;
    const due=tm.filter(x=>x.due<=t);tm=tm.filter(x=>x.due>t);
    for(const x of due){if(x.every){x.due=t+x.every;tm.push(x);}try{x.f(...x.a);}catch(e){console.error('timer: '+e.message);}}
    const c=raf;raf=[];for(const f of c)f(t);}};
  // every string replace the game makes on a shader is counted: one that matched nothing is silent in play
  window.__miss=[];const rep=String.prototype.replace;
  String.prototype.replace=function(a,b){const r=rep.call(this,a,b);
    if(typeof a==='string'&&this.length>400&&r===String(this)&&(this.indexOf('void main')>=0||this.indexOf('#include')>=0||this.indexOf('gl_')>=0||this.indexOf('#if')>=0)&&a!==b)window.__miss.push(a.slice(0,90));
    return r;};
})();`.replace('__LIBLINE__',require('fs').readFileSync(file,'utf8').split('\n').findIndex(l=>l.length>5000)+1);
const press=(pg,id)=>pg.evaluate(I=>document.getElementById(I).dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})),id);
const pump=async(pg,n)=>{for(let left=n;left>0;left-=20)await pg.evaluate(k=>window.__pump(k),Math.min(20,left));};
// open the page on `query`, turn the title a little, and (unless `stay`) begin the way the query names
async function start(browser,file,query,opt){
  opt=opt||{};
  const pg=await browser.newPage({viewport:{width:opt.vw||844,height:opt.vh||390}});
  const errs=[],warns=[];
  pg.on('pageerror',e=>errs.push(e.message));
  pg.on('console',m=>{const t=m.type(),x=m.text().slice(0,300);if(t==='error')errs.push('console: '+x);else if(t==='warning')warns.push(x);});
  await pg.addInitScript(INIT(file));
  const t0=Date.now();
  await pg.goto('file://'+file+'?'+query,{waitUntil:'load'});
  const bootMs=Date.now()-t0;
  await pump(pg,30);
  if(!opt.stay&&!/mode=codex/.test(query)){
    await press(pg,/mode=(path|ravine)/.test(query)?'modePath':/mode=defend/.test(query)?'modeDefend':'modeField');
    if(await pg.evaluate(()=>window.BP.G.mode==='title'))await press(pg,'menuGo');
    await pump(pg,60);
  }
  return {pg,errs,warns,bootMs};
}
// the frame as the canvas holds it, and what it cost
const snap=pg=>pg.evaluate(()=>{const B=window.BP,r=B._renderer;B.renderFrame();
  const png=r.domElement.toDataURL('image/png'),i=r.info;
  return {png,calls:i.render.calls,tris:i.render.triangles,programs:(i.programs||[]).length,geometries:i.memory.geometries,textures:i.memory.textures};});
module.exports={chromium,ARGS,start,press,pump,snap};
