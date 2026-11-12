#!/usr/bin/env node
/* BAKED LIGHT, the pictures. Loads the real game, begins a run, injects
   bake.inject.js, and photographs fixed views OFF / AO / AO+SUN on the very
   same frozen frame (the game's own renderFrame, at its own 216 lines).

     node shots.js                      # every set -> OUT (default: the system temp dir), then node sheets.js
     node shots.js field-noon path-noon # some sets
     BL_OPT='{"floor":.5}' node shots.js field-noon     # try another shaping
     BL_OUT=/some/dir node shots.js */
const {chromium,ARGS,start}=require('./lib');
const fs=require('fs'),path=require('path');
const OUT=process.env.BL_OUT||require('path').join(require('os').tmpdir(),'bakelight-raw');
const OPT=Object.assign({sun:true},process.env.BL_OPT?JSON.parse(process.env.BL_OPT):{});
const POPT=process.env.BL_POPT?JSON.parse(process.env.BL_POPT):{};
fs.mkdirSync(OUT,{recursive:true});
// a view: where the pilgrim stands (so the nave dims as it does in play), the eye, and what it looks at. y is height over the soil there.
const FIELD=[
  {id:'a-cathedral',p:[-2,33],eye:[-7,2.6,41],at:[0,9,14]},
  {id:'b-nave',p:[0,13],eye:[1.6,3.3,18.5,'abs'],at:[0,4.2,-14,'abs']},
  {id:'c-graves',p:[-28,-9],eye:[-24.5,2.1,-6.5],at:[-33,.5,-18]},
  {id:'d-wood',wood:true},
  {id:'g-door',p:[0,25],eye:[6,2.2,29],at:[0,3.5,20]},
];
const SETS={
  'field-noon':{q:'seed=7&time=noon&wx=clear',views:FIELD},
  'field-dusk':{q:'seed=7&time=dusk&wx=clear',views:FIELD},
  'field-night':{q:'seed=7&time=night&wx=clear',views:FIELD},
  'path-noon':{q:'seed=7&time=noon&wx=clear&mode=path',views:[
    {id:'e-path-hollow',p:[0,-36],eye:[7,5,-31],at:[0,0,-52]},
    {id:'e-path-ruins',p:[0,-64],eye:[-6,4,-62],at:[1,1,-80]}]},
  'ravine-noon':{q:'seed=7&time=noon&wx=clear&mode=ravine',views:[
    {id:'f-ravine',p:[0,-40],eye:[1.5,3,-36],at:[0,1,-60]},
    {id:'f-ravine-rim',p:[0,-40],eye:[14,9,-34],at:[0,-2,-58]}]},
};
(async()=>{
  const want=process.argv.slice(2).filter(a=>SETS[a]),names=want.length?want:Object.keys(SETS);
  const browser=await chromium.launch({args:ARGS});const report={};
  try{for(const name of names){
    const set=SETS[name],{pg,errs}=await start(browser,set.q);
    // only the picture: no HUD
    await pg.evaluate(()=>{const cv=window.BP._renderer.domElement;document.querySelectorAll('body *').forEach(e=>{if(e!==cv&&!e.contains(cv))e.style.visibility='hidden';});});
    // nothing that moves: the host is sent away, and the frame is ours
    await pg.evaluate(()=>{const B=window.BP;for(const e of B.enemies){const r=e.rig&&e.rig.root;if(r&&r.parent)r.parent.remove(r);}B.enemies.length=0;});
    const st=await pg.evaluate(o=>window.BL.bake(o),OPT);
    const ps=await pg.evaluate(o=>window.BL.paint(o),POPT);
    report[name]={bake:st,paint:ps};console.log(name,JSON.stringify(st),JSON.stringify(ps));
    for(const v of set.views){
      const view=await pg.evaluate(v=>{const B=window.BP;
        if(v.wood){let best=null,bn=0;const T=B.obstacles.filter(o=>o.tree&&isFinite(o.x));
          for(const t of T){const n=T.filter(u=>Math.hypot(u.x-t.x,u.z-t.z)<9).length;if(n>bn){bn=n;best=t;}}
          if(!best)return null;const d=Math.hypot(best.x,best.z),ux=best.x/d,uz=best.z/d;
          v.p=[best.x-ux*9,best.z-uz*9];v.eye=[best.x-ux*13+uz*3,3.2,best.z-uz*13-ux*3];v.at=[best.x,1.6,best.z];v.n=bn;}
        B.player.x=v.p[0];B.player.z=v.p[1];B.player.hp=B.player.maxHp;return v;},v);
      if(!view){console.log('  no view for',v.id);continue;}
      await pg.waitForTimeout(1600);
      await pg.evaluate(v=>{const B=window.BP,cam=B.camera,H=B.heightAt;
        window.__raf=window.__raf||window.requestAnimationFrame;window.requestAnimationFrame=f=>{window.__held=f;return 0;};
        return new Promise(res=>window.__raf(()=>window.__raf(()=>{       // (the loop has stopped by the second frame)
          const y=(a)=>a[3]==='abs'?a[1]:H(a[0],a[2])+a[1];
          cam.position.set(v.eye[0],y(v.eye),v.eye[2]);cam.lookAt(v.at[0],y(v.at),v.at[2]);cam.updateMatrixWorld(true);res();})));},view);
      for(const [tag,mode] of [['off',false],['ao',true],['sun','sun']]){
        await pg.evaluate(m=>{window.BL.show(m);window.BL.sync();window.BP.renderFrame();},mode);
        await pg.waitForTimeout(120);
        await pg.screenshot({path:path.join(OUT,name+'_'+v.id+'_'+tag+'.png')});
      }
      await pg.evaluate(()=>{window.BL.show(true);window.requestAnimationFrame=window.__raf;if(window.__held)window.__raf(window.__held);});
      console.log('  shot',v.id);
    }
    report[name].errors=errs.slice();if(errs.length)console.log('  ERRORS',errs.slice(0,4));
    await pg.close();
  }}finally{await browser.close();}
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({opt:OPT,report},null,1));
})();
