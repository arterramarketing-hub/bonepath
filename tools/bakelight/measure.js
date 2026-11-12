#!/usr/bin/env node
/* BAKED LIGHT, the numbers: bake time, what it adds, draw calls on a frozen frame before and after,
   and twenty seconds of play (walking, an hour turned, a weather brought on) with the page's errors counted.
     node measure.js            -> prints, and writes docs/bakelight/measure.json */
const {chromium,ARGS,start}=require('./lib');
const fs=require('fs'),path=require('path');
const OUT=process.env.BL_OUT||require('path').join(require('os').tmpdir(),'bakelight-raw');
fs.mkdirSync(OUT,{recursive:true});
const frozen=(pg,fn,arg)=>pg.evaluate(([src,arg])=>{const B=window.BP;window.__raf=window.__raf||window.requestAnimationFrame;window.requestAnimationFrame=f=>{window.__held=f;return 0;};
  return new Promise(res=>window.__raf(()=>window.__raf(()=>{const r=(new Function('B','BL','arg','return ('+src+')(B,BL,arg)'))(B,window.BL,arg);
    window.requestAnimationFrame=window.__raf;if(window.__held)window.__raf(window.__held);res(r);})));},[fn.toString(),arg]);
(async()=>{const browser=await chromium.launch({args:ARGS}),out={};
  try{
    for(const [name,q] of [['field','seed=7&time=noon&wx=clear'],['path','seed=7&time=noon&wx=clear&mode=path'],['ravine','seed=7&time=noon&wx=clear&mode=ravine'],['mire','seed=7&time=noon&wx=clear&mode=defend']]){
      const {pg,errs}=await start(browser,q);const o=out[name]={};
      // the same frozen frame, before and after
      const r=await frozen(pg,(B,BL)=>{const I=B._renderer.info,o={};
        B.renderFrame();B.renderFrame();o.before={calls:I.render.calls,tris:I.render.triangles,programs:I.programs.length,geometries:I.memory.geometries};
        if(B.PATH.on||B.DEF.on)o.all=BL.bake({sun:false});
        else{o.cathedral=BL.bake({sun:false,cath:true,size:512});o.rest=BL.bake({sun:false,cath:false,size:1024});o.key=BL.stats.length;}
        o.paint=BL.paint();
        B.renderFrame();B.renderFrame();o.after={calls:I.render.calls,tris:I.render.triangles,programs:I.programs.length,geometries:I.memory.geometries};
        o.base=BL.stats.length;o.twins=BL.twins.size;o.verts=BL.stats.reduce((a,s)=>a+s.verts,0);o.bytes=BL.stats.reduce((a,s)=>a+s.bytes,0);
        return o;});
      Object.assign(o,r);
      // twenty seconds of it
      await pg.evaluate(()=>{window.BL.opt.size=512;window.BL.hook(true);});
      const e0=errs.length;
      const play=await pg.evaluate(async(name)=>{const B=window.BP,P=B.player,f=()=>new Promise(q=>requestAnimationFrame(q)),t0=performance.now();
        let n=0,a=0,did=[],worst=0,last=performance.now();const z0=P.z;
        while(performance.now()-t0<20000){await f();n++;P.hp=P.maxHp;const now=performance.now();worst=Math.max(worst,now-last);last=now;
          if(B.PATH.on)P.z-=1.1;else{a+=.012;P.x=Math.sin(a)*30;P.z=Math.cos(a)*34;}
          const t=now-t0;
          if(t>5000&&!did[0]){did[0]=1;try{B.turnDay();}catch(e){did.push('turnDay: '+e.message);}}
          if(t>10000&&!did[1]){did[1]=1;try{B.xfStart('dusk','rain',3);}catch(e){did.push('xfStart: '+e.message);}}
          if(t>14000&&!did[2]){did[2]=1;try{let k=0;for(const [m] of B.BAKED){if(k++>=3)break;B.unbake(m);}did.push('unbaked '+k);}catch(e){did.push('unbake: '+e.message);}}}
        return {frames:n,worstFrameMs:Math.round(worst),walked:+(z0-P.z).toFixed(0),hour:B.RUN.time,wx:B.RUN.weather,notes:did.slice(3),late:window.BL.late,
          lateBakes:(window.BL.late>0?window.BL.stats.slice(-window.BL.late):[]).map(s=>({meshes:s.meshes,verts:s.verts,ms:s.ms.total,renders:s.renders})),
          calls:B._renderer.info.render.calls,programs:B._renderer.info.programs.length,mode:B.G.mode};},name);
      o.play=play;o.errors=errs.slice(e0);o.bootErrors=errs.slice(0,e0);
      console.log(name,JSON.stringify(o));
      await pg.close();}
  }finally{await browser.close();}
  fs.writeFileSync(path.resolve(__dirname,'../../docs/bakelight/measure.json'),JSON.stringify(out,null,1));
})();
