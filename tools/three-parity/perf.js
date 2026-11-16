#!/usr/bin/env node
/* THREE PARITY, the cost. Software GL here, so COUNTS, not milliseconds:
   for each way into the game, the time to the title (the one wall-clock
   figure: read it only against the other file on the same idle machine),
   then `--frames` of play (default 1800: thirty seconds) and what stands
   at the end of it: shader programs linked, draw calls and triangles of a
   frame, the heap after a collection, GPU geometries and textures, and
   every distinct warning or error the console carried.

     node perf.js --file=/path/to/index.html [--frames=1800] [--out=perf.json] */
'use strict';
const fs=require('fs'),path=require('path');
const {chromium,ARGS,start,pump}=require('./lib');
const arg=k=>(process.argv.find(a=>a.startsWith('--'+k+'='))||'').slice(k.length+3);
const FILE=path.resolve(arg('file')||path.join(__dirname,'../../index.html')),FRAMES=+arg('frames')||1800;
const WAYS=[['field','seed=7&time=dusk&wx=rain'],['path','seed=7&time=noon&wx=clear&mode=path'],['ravine','seed=7&time=noon&wx=clear&mode=ravine'],
  ['mire','seed=7&mode=defend'],['castle','seed=7&time=night&wx=clear&mode=path&castle=1'],['codex','mode=codex']];
const LINKS=`(()=>{window.__links=0;for(const C of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!C)continue;const f=C.prototype.linkProgram;C.prototype.linkProgram=function(p){window.__links++;return f.call(this,p);};}})();`;
(async()=>{
  const browser=await chromium.launch({args:ARGS.concat('--js-flags=--expose-gc')}),out={};
  try{for(const [name,q] of WAYS){
    const ctx=await browser.newContext();await ctx.addInitScript(LINKS);
    const {pg,errs,warns,bootMs}=await start({newPage:o=>ctx.newPage(o)},FILE,q);
    const at=async()=>pg.evaluate(()=>{const B=window.BP,i=B._renderer.info;B.renderFrame();if(window.gc)window.gc();
      return {programs:i.programs.length,links:window.__links,calls:i.render.calls,tris:i.render.triangles,geometries:i.memory.geometries,textures:i.memory.textures,
        heapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,mode:B.G.mode};});
    const first=await at();
    if(name==='codex')for(let i=0;i<8;i++){await pg.evaluate(i=>window.codexShowX(0,i*3),i);await pump(pg,Math.round(FRAMES/8));}
    else{await pg.evaluate(()=>{const B=window.BP;B.player.maxHp=B.player.hp=1e6;});await pump(pg,FRAMES);}
    const end=await at();
    const lib=w=>/THREE\.|WebGL(Renderer|Program|Shader|Textures|State)|deprecat/i.test(w);
    out[name]={bootMs,first,end,errors:[...new Set(errs)],warnings:[...new Set(warns)].map(w=>w.replace(/0x[0-9a-f]+/g,'0x..')),fromThree:[...new Set(warns.concat(errs))].filter(lib)};
    console.log(name.padEnd(7),'boot',bootMs+'ms','programs',first.programs,'->',end.programs,'links',end.links,'calls',end.calls,'tris',end.tris,'heap',end.heapMB+'MB','geo',end.geometries,'tex',end.textures,
      'errors',out[name].errors.length,'three-warnings',out[name].fromThree.length);
    for(const w of out[name].errors.concat(out[name].fromThree))console.log('   ',w.slice(0,200));
    await ctx.close();
  }}finally{await browser.close();}
  if(arg('out'))fs.writeFileSync(path.resolve(arg('out')),JSON.stringify(out,null,1));
})();
